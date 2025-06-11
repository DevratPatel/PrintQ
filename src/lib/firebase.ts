import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAIjUJUH8xNX3TfToEUrk-W73cYBn5pKNM",
  authDomain: "queue-management-web-app-b6199.firebaseapp.com",
  projectId: "queue-management-web-app-b6199",
  storageBucket: "queue-management-web-app-b6199.firebasestorage.app",
  messagingSenderId: "995696887927",
  appId: "1:995696887927:web:48e2d2db7b04aae17a1e72",
  measurementId: "G-P0KZFF6060",
};

// Initialize Firebase
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
