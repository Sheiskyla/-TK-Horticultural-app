import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const ADMIN_EMAILS = [
  'gmail-tkhorticulture@gmail.com',
  'tkhorticulture@gmail.com'
];

export const ADMIN_EMAIL = 'gmail-tkhorticulture@gmail.com';

export async function hasAdminRole(user) {
  if (!user) return false;

  const userEmail = user.email ? user.email.toLowerCase().trim() : '';

  if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
    return true;
  }

  try {
    const cachedToken = await user.getIdTokenResult(false);
    if (cachedToken?.claims?.admin === true) {
      return true;
    }
  } catch (e) {
    console.warn('Cached token claim check warning:', e);
  }

  if (user.uid) {
    try {
      const adminDocRef = doc(db, 'admins', user.uid);
      const adminSnap = await Promise.race([
        getDoc(adminDocRef),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Doc check timeout')), 3000))
      ]);
      if (adminSnap && adminSnap.exists() && (adminSnap.data()?.role === 'admin' || adminSnap.data()?.active !== false)) {
        return true;
      }
    } catch (err) {
      console.warn('Firestore admins doc check failed or timed out:', err);
    }
  }

  try {
    const freshToken = await Promise.race([
      user.getIdTokenResult(true),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Token refresh timeout')), 3000))
    ]);
    if (freshToken?.claims?.admin === true) {
      return true;
    }
  } catch (err) {
    console.warn('Fresh token claim check failed or timed out:', err);
  }

  return false;
}

