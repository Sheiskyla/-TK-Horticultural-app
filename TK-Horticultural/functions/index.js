const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

const ADMIN_EMAILS = [
  'gmail-tkhorticulture@gmail.com',
  'tkhorticulture@gmail.com'
];

/**
 * Helper to check if a callable caller has administrator privileges.
 */
async function verifyAdminCaller(context) {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const email = (context.auth.token.email || '').toLowerCase().trim();
  const hasClaim = context.auth.token.admin === true;

  if (hasClaim || ADMIN_EMAILS.includes(email)) {
    return true;
  }

  // Check admins/{uid} document in Firestore
  const adminDoc = await db.collection('admins').doc(context.auth.uid).get();
  if (adminDoc.exists && (adminDoc.data()?.role === 'admin' || adminDoc.data()?.active !== false)) {
    return true;
  }

  throw new functions.https.HttpsError('permission-denied', 'Only administrators can perform this action.');
}

/**
 * Build standardized user document object from Auth UserRecord
 */
function buildUserDocData(userRecord, existingDocData = null) {
  const email = (userRecord.email || '').toLowerCase().trim();
  const isAdmin = ADMIN_EMAILS.includes(email) || userRecord.customClaims?.admin === true;
  const role = isAdmin ? 'admin' : (existingDocData?.role || 'client');

  const createdAt = userRecord.metadata.creationTime
    ? admin.firestore.Timestamp.fromDate(new Date(userRecord.metadata.creationTime))
    : admin.firestore.FieldValue.serverTimestamp();

  const lastSignInAt = userRecord.metadata.lastSignInTime
    ? admin.firestore.Timestamp.fromDate(new Date(userRecord.metadata.lastSignInTime))
    : (existingDocData?.lastSignInAt || createdAt);

  const providers = (userRecord.providerData || []).map((p) => p.providerId);

  return {
    uid: userRecord.uid,
    email: userRecord.email || '',
    displayName: userRecord.displayName || existingDocData?.displayName || '',
    phoneNumber: userRecord.phoneNumber || existingDocData?.phone || existingDocData?.phoneNumber || '',
    photoURL: userRecord.photoURL || '',
    disabled: userRecord.disabled === true,
    emailVerified: userRecord.emailVerified === true,
    providers,
    role,
    source: existingDocData?.source || (userRecord.providerData?.length > 0 ? 'signup' : 'console'),
    createdAt,
    lastSignInAt,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
}

/**
 * 1. Auth onCreate trigger: Syncs new Auth users to users/{uid} Firestore document.
 */
exports.onUserCreated = functions.auth.user().onCreate(async (userRecord) => {
  try {
    const userRef = db.collection('users').doc(userRecord.uid);
    const existingSnap = await userRef.get();
    const docData = buildUserDocData(userRecord, existingSnap.exists ? existingSnap.data() : null);

    await userRef.set(docData, { merge: true });

    // Set custom claim if designated admin email
    const email = (userRecord.email || '').toLowerCase().trim();
    if (ADMIN_EMAILS.includes(email)) {
      await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
      await db.collection('admins').doc(userRecord.uid).set({
        email: userRecord.email,
        role: 'admin',
        grantedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }

    console.log(`Successfully synced created user ${userRecord.uid} (${userRecord.email}) to Firestore.`);
  } catch (error) {
    console.error(`Error in onUserCreated trigger for ${userRecord.uid}:`, error);
  }
});

/**
 * 2. Auth onDelete trigger: Removes Firestore user doc when Auth user is deleted.
 */
exports.onUserDeleted = functions.auth.user().onDelete(async (userRecord) => {
  try {
    await db.collection('users').doc(userRecord.uid).delete();
    await db.collection('admins').doc(userRecord.uid).delete();
    console.log(`Deleted Firestore documents for user ${userRecord.uid}.`);
  } catch (error) {
    console.error(`Error in onUserDeleted trigger for ${userRecord.uid}:`, error);
  }
});

/**
 * 3. Callable: One-time or on-demand BACKFILL of all Firebase Auth users into users/{uid} collection.
 */
exports.syncAllUsers = functions.https.onCall(async (data, context) => {
  await verifyAdminCaller(context);

  let totalSynced = 0;
  let pageToken = undefined;

  do {
    const listResult = await admin.auth().listUsers(1000, pageToken);
    pageToken = listResult.pageToken;

    const users = listResult.users;
    if (!users.length) break;

    // Process in batches of 500 (Firestore batch limit)
    for (let i = 0; i < users.length; i += 500) {
      const chunk = users.slice(i, i + 500);
      const batch = db.batch();

      for (const userRecord of chunk) {
        const userRef = db.collection('users').doc(userRecord.uid);
        const docData = buildUserDocData(userRecord);
        batch.set(userRef, docData, { merge: true });

        // Grant custom claim if admin email
        const email = (userRecord.email || '').toLowerCase().trim();
        if (ADMIN_EMAILS.includes(email) && userRecord.customClaims?.admin !== true) {
          await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
          const adminRef = db.collection('admins').doc(userRecord.uid);
          batch.set(adminRef, {
            email: userRecord.email,
            role: 'admin',
            grantedAt: admin.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        }
      }

      await batch.commit();
      totalSynced += chunk.length;
    }
  } while (pageToken);

  return {
    success: true,
    count: totalSynced,
    message: `Successfully synchronized ${totalSynced} user accounts from Firebase Authentication to Firestore.`
  };
});

/**
 * 4. Callable: Enable or Disable a user account
 */
exports.setUserDisabled = functions.https.onCall(async (data, context) => {
  await verifyAdminCaller(context);

  const { uid, disabled } = data;
  if (!uid || typeof disabled !== 'boolean') {
    throw new functions.https.HttpsError('invalid-argument', 'Parameters uid and disabled (boolean) are required.');
  }

  // Update Auth user
  await admin.auth().updateUser(uid, { disabled });

  // Update Firestore user document
  await db.collection('users').doc(uid).set({
    disabled,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  return { success: true, uid, disabled };
});

/**
 * 5. Callable: Delete user account (and optionally their bookings)
 */
exports.deleteUserAccount = functions.https.onCall(async (data, context) => {
  await verifyAdminCaller(context);

  const { uid, deleteBookings } = data;
  if (!uid) {
    throw new functions.https.HttpsError('invalid-argument', 'Parameter uid is required.');
  }

  if (uid === context.auth.uid) {
    throw new functions.https.HttpsError('permission-denied', 'You cannot delete your own administrator account.');
  }

  // 1. Delete Auth account
  try {
    await admin.auth().deleteUser(uid);
  } catch (err) {
    console.warn(`Auth user delete warning for ${uid}:`, err.message);
  }

  // 2. Delete Firestore users/{uid} & admins/{uid} docs
  await db.collection('users').doc(uid).delete();
  await db.collection('admins').doc(uid).delete();

  // 3. Delete user's bookings if requested
  if (deleteBookings === true) {
    const bookingsSnap = await db.collection('bookings').where('userId', '==', uid).get();
    if (!bookingsSnap.empty) {
      const batch = db.batch();
      bookingsSnap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }
  }

  return { success: true, uid, deletedBookings: deleteBookings === true };
});

/**
 * 6. Callable: Generate password reset link or trigger email for user
 */
exports.sendPasswordReset = functions.https.onCall(async (data, context) => {
  await verifyAdminCaller(context);

  const { email } = data;
  if (!email) {
    throw new functions.https.HttpsError('invalid-argument', 'Parameter email is required.');
  }

  const resetLink = await admin.auth().generatePasswordResetLink(email);

  return {
    success: true,
    email,
    resetLink,
    message: `Password reset link generated for ${email}.`
  };
});

/**
 * 7. Callable: Promote or Demote Admin Role (sets custom claim and updates Firestore docs)
 */
exports.setAdminRole = functions.https.onCall(async (data, context) => {
  await verifyAdminCaller(context);

  const { uid, isAdmin } = data;
  if (!uid || typeof isAdmin !== 'boolean') {
    throw new functions.https.HttpsError('invalid-argument', 'Parameters uid and isAdmin (boolean) are required.');
  }

  // Prevent admin from removing their own admin role
  if (uid === context.auth.uid && !isAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'You cannot remove your own administrator role.');
  }

  // Set custom claims
  await admin.auth().setCustomUserClaims(uid, { admin: isAdmin });

  const role = isAdmin ? 'admin' : 'client';

  // Update Firestore user document
  await db.collection('users').doc(uid).set({
    role,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  // Update admins/{uid} document
  if (isAdmin) {
    const userRecord = await admin.auth().getUser(uid);
    await db.collection('admins').doc(uid).set({
      email: userRecord.email,
      role: 'admin',
      grantedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } else {
    await db.collection('admins').doc(uid).delete();
  }

  return { success: true, uid, role };
});
