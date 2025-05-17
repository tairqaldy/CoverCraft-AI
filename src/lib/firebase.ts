
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
// Check if all required Firebase config keys are present
const requiredKeys: (keyof typeof firebaseConfig)[] = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

let app;
let auth;
let db;

if (missingKeys.length > 0) {
  console.error(`Firebase configuration is missing: ${missingKeys.join(', ')}. Please check your .env file.`);
  // You might want to throw an error here or handle this case appropriately
  // For now, we'll let it proceed, but Firebase services will likely fail.
}


if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (e) {
    console.error("Failed to initialize Firebase app:", e);
    console.error("Ensure your Firebase config in .env is correct and you have restarted the dev server.");
  }
} else {
  app = getApp();
}

try {
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.error("Failed to initialize Firebase services (Auth/Firestore):", e);
   if (!app) {
    console.error("Firebase app was not initialized. This is likely due to missing or incorrect .env configuration.");
  }
}


export { app, auth, db };
