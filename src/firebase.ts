import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCdXnfcT4_nOrvOuPlASNdJ3WMDD6tPuq4",
  authDomain: "gen-lang-client-0424741570.firebaseapp.com",
  projectId: "gen-lang-client-0424741570",
  storageBucket: "gen-lang-client-0424741570.firebasestorage.app",
  messagingSenderId: "221611268233",
  appId: "1:221611268233:web:463b6258b1ea008405ce58"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with the specific database ID provisioned for this applet
export const db = getFirestore(app, "ai-studio-3702241a-b3be-4f10-88a5-711a4e98a73c");
