
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBF4_4G5Zcw2XMZBh7ms_CQv_1Fl6uaPK8",
  authDomain: "salimtravail.firebaseapp.com",
  projectId: "salimtravail",
  storageBucket: "salimtravail.firebasestorage.app",
  messagingSenderId: "964240490719",
  appId: "1:964240490719:web:1d3f220eeb6d95c1d1a96a"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app, 'default');
