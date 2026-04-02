/**
 * Firebase bootstrap layer.
 * Keep this file isolated so repositories can switch between mock and Firestore
 * without touching UI code.
 */
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const shouldUseFirebase = process.env.NEXT_PUBLIC_DATA_SOURCE === "firebase";

export const firebaseApp =
  shouldUseFirebase && !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const firestoreDb = firebaseApp ? getFirestore(firebaseApp) : null;
