// Import the functions you need from the SDKs you need
//import { getAnalytics } 
    //from "https://www.gstatic.com/firebasejs/12.17.1/firebase-analytics.js";
import { initializeApp } 
    from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import { getAuth } 
    from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import { getFirestore } 
    from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDTxssi_UDjT6RAQSwHDht788Kb48idtNY",
  authDomain: "site-confrerie.firebaseapp.com",
  projectId: "site-confrerie",
  storageBucket: "site-confrerie.firebasestorage.app",
  messagingSenderId: "316097185260",
  appId: "1:316097185260:web:dc1d6db015ca084acbacc9",
  measurementId: "G-FNXQYPTKKP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

export const auth = getAuth(app);

export const db = getFirestore(app);