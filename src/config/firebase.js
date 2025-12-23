// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBcJGFgJqhMUSbBjOAJcUXXT2Cptl8sFDo",
  authDomain: "nugepsistema.firebaseapp.com",
  projectId: "nugepsistema",
  storageBucket: "nugepsistema.firebasestorage.app",
  messagingSenderId: "324001063842",
  appId: "1:324001063842:web:1fb9c00ed1b7dcedff08fb",
  measurementId: "G-J3SHPEQ9S1"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = 'nugep-oficial'; // ID do ambiente
export const INSTITUTION_ACCESS_CODE = "NUGEP2025";
