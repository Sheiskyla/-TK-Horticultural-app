import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut,
  updateProfile,
  signInWithPopup
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB8mJtIoCG_y_ANrsX8QZAXpdKQa59e92A",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tk-horticultural.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tk-horticultural",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tk-horticultural.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1097635512071",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1097635512071:web:c8c960d943d01ff17d0fa2",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-FGT1KNRVRF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functionsInstance = getFunctions(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut,
  updateProfile,
  signInWithPopup,
  httpsCallable
};

export default app;