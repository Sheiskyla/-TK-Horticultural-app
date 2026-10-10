import admin from 'firebase-admin';
import { readFile } from 'fs/promises';

/**
 * Node script to sync ALL users from Firebase Authentication (Console) into Firestore `users/{uid}` collection.
 * 
 * Usage:
 *   node scripts/syncConsoleUsers.js
 */

const ADMIN_EMAILS = [
  'gmail-tkhorticulture@gmail.com',
  'tkhorticulture@gmail.com'
];

async function main() {
  try {
    let serviceAccount;
    try {
      const keyFile = new URL('./serviceAccountKey.json', import.meta.url);
      const fileData = await readFile(keyFile, 'utf8');
      serviceAccount = JSON.parse(fileData);
    } catch {
      console.log('No serviceAccountKey.json found in scripts/. Attempting default credentials...');
    }

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      admin.initializeApp();
    }

    const db = admin.firestore();
    console.log('Fetching all users from Firebase Authentication...');
    
    const listUsersResult = await admin.auth().listUsers(1000);
    const authUsers = listUsersResult.users;
    console.log(`Found ${authUsers.length} user accounts in Firebase Auth.`);

    const batch = db.batch();
    let count = 0;

    for (const userRecord of authUsers) {
      const email = (userRecord.email || '').toLowerCase().trim();
      const isAdmin = ADMIN_EMAILS.includes(email) || userRecord.customClaims?.admin === true;
      const role = isAdmin ? 'admin' : 'client';

      const createdAt = userRecord.metadata.creationTime
        ? admin.firestore.Timestamp.fromDate(new Date(userRecord.metadata.creationTime))
        : admin.firestore.FieldValue.serverTimestamp();

      const lastSignInAt = userRecord.metadata.lastSignInTime
        ? admin.firestore.Timestamp.fromDate(new Date(userRecord.metadata.lastSignInTime))
        : createdAt;

      const userRef = db.collection('users').doc(userRecord.uid);
      batch.set(userRef, {
        uid: userRecord.uid,
        email: userRecord.email || '',
        displayName: userRecord.displayName || (isAdmin ? 'Administrator' : email.split('@')[0]),
        phoneNumber: userRecord.phoneNumber || '',
        photoURL: userRecord.photoURL || '',
        disabled: userRecord.disabled === true,
        emailVerified: userRecord.emailVerified === true,
        providers: (userRecord.providerData || []).map((p) => p.providerId),
        role,
        source: userRecord.providerData?.length > 0 ? 'signup' : 'console',
        createdAt,
        lastSignInAt,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      if (isAdmin) {
        const adminRef = db.collection('admins').doc(userRecord.uid);
        batch.set(adminRef, {
          email: userRecord.email,
          role: 'admin',
          grantedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      }

      count += 1;
      console.log(`- Queued user [${role.toUpperCase()}]: ${userRecord.email} (UID: ${userRecord.uid})`);
    }

    await batch.commit();
    console.log(`\nSUCCESS: Synchronized ${count} accounts to Firestore users collection.`);
    process.exit(0);
  } catch (error) {
    console.error('ERROR syncing Console users:', error.message);
    process.exit(1);
  }
}

main();
