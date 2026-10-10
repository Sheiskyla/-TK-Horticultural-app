import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  updateProfile 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { db } from '../firebase';
import { doc, getDoc, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { AuthContext } from './authContextCore';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signup = async (email, password, displayName, phone = '', address = '') => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      setCurrentUser(userCredential.user);
      if (displayName) {
        updateProfile(userCredential.user, { displayName }).catch(() => {});
      }
      const userRef = doc(db, 'users', userCredential.user.uid);
      const createdAt = userCredential.user.metadata?.creationTime
        ? Timestamp.fromDate(new Date(userCredential.user.metadata.creationTime))
        : serverTimestamp();
      setDoc(userRef, {
        uid: userCredential.user.uid,
        displayName: displayName || '',
        email: email || '',
        phone: phone || '',
        address: address || '',
        role: 'client',
        createdAt,
        lastActiveAt: serverTimestamp(),
        isOnline: true,
      }, { merge: true }).catch((err) => console.warn('Signup Firestore sync note:', err));
    }
    return userCredential;
  };

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (userCredential?.user) {
      setCurrentUser(userCredential.user);
    }
    return userCredential;
  };

  const loginWithGoogle = async () => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    if (userCredential?.user) {
      const user = userCredential.user;
      setCurrentUser(user);

      const userRef = doc(db, 'users', user.uid);
      const createdAt = user.metadata?.creationTime
        ? Timestamp.fromDate(new Date(user.metadata.creationTime))
        : serverTimestamp();
      const providers = user.providerData ? user.providerData.map((p) => p.providerId) : ['google.com'];

      setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || '',
        role: 'client',
        createdAt,
        lastActiveAt: serverTimestamp(),
        isOnline: true,
        providers
      }, { merge: true }).catch((docErr) => {
        console.warn('Note on Google sign-in Firestore sync:', docErr);
      });
    }
    return userCredential;
  };

  const logout = async () => {
    if (auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      setDoc(userRef, {
        isOnline: false,
        lastActiveAt: serverTimestamp()
      }, { merge: true }).catch((err) => console.warn('Presence logout update note:', err));
    }
    setCurrentUser(null);
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) return undefined;

    const userRef = doc(db, 'users', currentUser.uid);
    let lastUpdate = 0;
    let profileInitialized = false;
    let needsCreateRole = false;

    const syncPresence = async (isOnline, force = false) => {
      const now = Date.now();
      if (isOnline && !force && now - lastUpdate < 10_000) return;
      lastUpdate = now;

      try {
        if (!profileInitialized) {
          const profileSnapshot = await getDoc(userRef);
          needsCreateRole = !profileSnapshot.exists();
          profileInitialized = true;
        }
        const createdAt = currentUser.metadata?.creationTime
          ? Timestamp.fromDate(new Date(currentUser.metadata.creationTime))
          : serverTimestamp();
        const profile = {
          uid: currentUser.uid,
          displayName: currentUser.displayName || '',
          email: currentUser.email || '',
          createdAt,
          lastActiveAt: serverTimestamp(),
          isOnline,
        };
        if (needsCreateRole) {
          profile.role = 'client';
        }
        await setDoc(userRef, profile, { merge: true });
      } catch (error) {
        console.error('Unable to sync user profile or activity status:', error);
      }
    };

    syncPresence(true, true);

    const heartbeat = window.setInterval(() => syncPresence(true, true), 25_000);

    const handleUserActivity = () => {
      if (document.visibilityState === 'visible') {
        syncPresence(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncPresence(true, true);
      } else {
        syncPresence(false, true);
      }
    };

    const handleBeforeUnload = () => {
      syncPresence(false, true);
    };

    window.addEventListener('mousemove', handleUserActivity, { passive: true });
    window.addEventListener('keydown', handleUserActivity, { passive: true });
    window.addEventListener('click', handleUserActivity, { passive: true });
    window.addEventListener('touchstart', handleUserActivity, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.clearInterval(heartbeat);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      syncPresence(false, true);
    };
  }, [currentUser]);

  const value = {
    currentUser,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? (
        children
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 font-sans">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Loading TK Horticultural Services...</p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};
