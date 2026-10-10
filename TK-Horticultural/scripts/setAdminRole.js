import admin from 'firebase-admin';
import { readFile } from 'fs/promises';

/**
 * Script to grant Administrator Custom Claim (admin: true) to a Firebase user.
 * 
 * Usage:
 *   1. Download your Firebase Admin Service Account Key JSON from:
 *      Firebase Console -> Project Settings -> Service Accounts -> Generate New Private Key
 *   2. Save key file as `serviceAccountKey.json` in the `scripts/` directory (or set GOOGLE_APPLICATION_CREDENTIALS).
 *   3. Run: node scripts/setAdminRole.js gmail-tkhorticulture@gmail.com
 */

const targetEmail = process.argv[2] || 'gmail-tkhorticulture@gmail.com';

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

    console.log(`Searching for user: ${targetEmail}...`);
    const user = await admin.auth().getUserByEmail(targetEmail);

    console.log(`User found (UID: ${user.uid}). Setting custom claim { admin: true }...`);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });

    // Also set Firestore document at admins/{uid} for Firestore role verification fallback
    const db = admin.firestore();
    await db.collection('admins').doc(user.uid).set({
      email: user.email,
      role: 'admin',
      grantedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log(`SUCCESS: Custom claim { admin: true } and admins/${user.uid} document granted for ${targetEmail}.`);
    console.log('Note: User must sign out and sign back in for the new token claim to take effect.');
    process.exit(0);
  } catch (error) {
    console.error('ERROR granting admin role:', error.message);
    process.exit(1);
  }
}

main();
