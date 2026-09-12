import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDsypqSLY7FfJTFc-dcuN9k7IKX36YvXWE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "shramik-quote.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "shramik-quote",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "shramik-quote.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "216325345229",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:216325345229:web:ec0ba45114afe5823dfe84"
};

// Initialize Firebase safely (avoid duplicate initialization)
export const app: FirebaseApp = getApps().length === 0 
  ? initializeApp(firebaseConfig) 
  : getApp();

// Initialize Firebase services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

export default app;
