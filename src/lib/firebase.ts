import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0965231025",
  appId: "1:732186751051:web:a8ef092a6253ab72565dce",
  apiKey: "AIzaSyCtMib2RAWT2nvmlczymHfQSoZNl11BpkQ",
  authDomain: "gen-lang-client-0965231025.firebaseapp.com",
  storageBucket: "gen-lang-client-0965231025.firebasestorage.app",
  messagingSenderId: "732186751051"
};

const databaseId = "ai-studio-2a8b1451-2db4-40b3-8230-7c03a4d20c7c";

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
