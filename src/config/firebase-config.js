import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDeCaUQf-nXaKaBRB9h4-YaSPkOgFnS1-M",
  authDomain: "formal-folder-475608-q0.firebaseapp.com",
  projectId: "formal-folder-475608-q0",
  storageBucket: "formal-folder-475608-q0.firebasestorage.app",
  messagingSenderId: "898583273277",
  appId: "1:898583273277:web:6ae297ca86c0af4fd4ef54"
};
 
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);