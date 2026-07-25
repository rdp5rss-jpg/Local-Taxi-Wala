import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDkkVBmXTbTIriEPVvKx0Pe6jVosnFsh2g",
  authDomain: "gen-lang-client-0652061293.firebaseapp.com",
  projectId: "gen-lang-client-0652061293",
  storageBucket: "gen-lang-client-0652061293.firebasestorage.app",
  messagingSenderId: "523306255444",
  appId: "1:523306255444:web:f7098d75a7571043f3d9c1"
};

const app = initializeApp(firebaseConfig);

// Get Firestore instance with custom databaseId
export const db = getFirestore(app, "ai-studio-localtaxiwala-abb4534b-5df8-4892-b99a-0af5cf70a9ae");
