import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBALFFBpqNLMhtNmAXz0wiPIhFVmBz3fPI",
  authDomain: "eic-relatorios-d7d9e.firebaseapp.com",
  projectId: "eic-relatorios-d7d9e",
  storageBucket: "eic-relatorios-d7d9e.firebasestorage.app",
  messagingSenderId: "214650677656",
  appId: "1:214650677656:web:4db01b4b035084f0efa3ed",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
