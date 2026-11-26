import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, collection } from 'firebase/firestore';
import { ENV } from './env.js';

export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyDtJAls8nTfH8V4ACu16FviuVSEfTVfICI',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'ebike-c0a0b.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'ebike-c0a0b',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'ebike-c0a0b.firebasestorage.app',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '382514706329',
  appId: process.env.FIREBASE_WEB_APP_ID || '1:382514706329:web:d433fc4205a369fb070508',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'G-MH2DJJX5XL',
};

const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

export const db = getFirestore(app);

export function getStateDocRef() {
  return doc(db, 'artifacts', ENV.FIREBASE_APP_ID, 'public', 'data', 'park_state', 'main');
}

export function getHistoryColRef() {
  return collection(db, 'artifacts', ENV.FIREBASE_APP_ID, 'public', 'data', 'park_history');
}

export function getHistoryDocRef(historyId) {
  return doc(db, 'artifacts', ENV.FIREBASE_APP_ID, 'public', 'data', 'park_history', String(historyId));
}
