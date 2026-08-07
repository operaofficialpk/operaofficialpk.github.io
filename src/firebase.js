import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA0yE5VtTTY0WgQKBKXRyPxlG7q_3_-5xY",
  authDomain: "opera-official-pk.firebaseapp.com",
  projectId: "opera-official-pk",
  storageBucket: "opera-official-pk.firebasestorage.app",
  messagingSenderId: "94736107382",
  appId: "1:94736107382:web:eb288f48a438286b62dc57",
};

const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);
export const db = getFirestore(app);

export default app;