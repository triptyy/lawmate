// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCFWz9cj-rkYTIcybHp2m9RDyKaBaYrGAk",
  authDomain: "lawbot-7c921.firebaseapp.com",
  projectId: "lawbot-7c921",
  storageBucket: "lawbot-7c921.firebasestorage.app",
  messagingSenderId: "783835048563",
  appId: "1:783835048563:web:079d925201418393d15806",
  measurementId: "G-8X2BXNNE0J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, analytics };
