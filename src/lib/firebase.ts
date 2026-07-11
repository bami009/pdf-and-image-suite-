import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const metaEnv = (import.meta as any).env || {};

const firebaseConfig = {
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0965231025",
  appId: metaEnv.VITE_FIREBASE_APP_ID || "1:732186751051:web:a8ef092a6253ab72565dce",
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || "AIzaSyCtMib2RAWT2nvmlczymHfQSoZNl11BpkQ",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0965231025.firebaseapp.com",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0965231025.firebasestorage.app",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "732186751051"
};

const databaseId = metaEnv.VITE_FIREBASE_DATABASE_ID || "ai-studio-2a8b1451-2db4-40b3-8230-7c03a4d20c7c";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID
export const db = getFirestore(app, databaseId);

// Initialize Auth with local persistence
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error("Auth persistence error:", err);
});

export const googleProvider = new GoogleAuthProvider();
