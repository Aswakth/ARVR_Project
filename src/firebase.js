import { initializeApp } from "firebase/app";
import { getAuth, signOut } from "firebase/auth";
import Cookies from "js-cookie";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// const firebaseConfig = {
//   apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
//   authDomain: "ar-fitness3.firebaseapp.com",
//   projectId: "ar-fitness3",
//   storageBucket: "ar-fitness3.appspot.com",
//   messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGE_ID,
//   appId: process.env.REACT_APP_FIREBASE_APP_ID,
// };

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBMVlDS5jUVemW-qCSbSISnaSkTR8J6seM",
  authDomain: "arvr-project-aa4e0.firebaseapp.com",
  projectId: "arvr-project-aa4e0",
  storageBucket: "arvr-project-aa4e0.firebasestorage.app",
  messagingSenderId: "595476315153",
  appId: "1:595476315153:web:d59c9b99b42a1220d885b0",
  measurementId: "G-W1XH05PVR8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Authentication helper removed; project uses local cookie-based login now.

//   Logout Fucntion
export const logout = () => {
  try {
    signOut(auth);
  } catch (e) {
    // ignore if auth signOut fails or not configured
  }
  localStorage.clear();
  Cookies.remove("userID");
  // 'uat' cookie deprecated/unused. If you need to clear another cookie, add it here.
};
