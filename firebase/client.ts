import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBQfmcooVDOo6e83HZ1h-6DxtE43jqq4aw",
  authDomain: "prepfuture.firebaseapp.com",
  projectId: "prepfuture",
  storageBucket: "prepfuture.firebasestorage.app",
  messagingSenderId: "991242357240",
  appId: "1:991242357240:web:c819825e1f79a9ba472e0d",
  measurementId: "G-KLCECEJ5YS",
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);