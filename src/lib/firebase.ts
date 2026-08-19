import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDkkVBmXTbTIriEPVvKx0Pe6jVosnFsh2g",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0652061293.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0652061293",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0652061293.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "523306255444",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:523306255444:web:f7098d75a7571043f3d9c1"
};

const app = initializeApp(firebaseConfig);

// Get Firestore instance with custom databaseId
const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || "ai-studio-localtaxiwala-abb4534b-5df8-4892-b99a-0af5cf70a9ae";
export const db = getFirestore(app, databaseId);
