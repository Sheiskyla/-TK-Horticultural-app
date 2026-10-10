import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import process from 'node:process';

const email = process.argv[2] || 'gmail-tkhorticulture@gmail.com';
const projectId = process.env.FIREBASE_PROJECT_ID || 'tk-horticultural';

const app = initializeApp({
  credential: applicationDefault(),
  projectId,
});

try {
  const adminAuth = getAuth(app);
  const user = await adminAuth.getUserByEmail(email);
  await adminAuth.setCustomUserClaims(user.uid, {
    ...user.customClaims,
    admin: true,
  });
  console.log(`Granted admin: true to ${email} (${user.uid}) in ${projectId}.`);
  console.log('Sign out and sign back in to refresh the Firebase ID token.');
} catch (error) {
  console.error(`Unable to grant admin access to ${email}:`, error);
  process.exitCode = 1;
}
