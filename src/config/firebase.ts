// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC4l4hyrhoUawkwkCwHWB41wUKANsGpvV0",
    authDomain: "social-media-application-7b5fe.firebaseapp.com",
    projectId: "social-media-application-7b5fe",
    storageBucket: "social-media-application-7b5fe.appspot.com",
    messagingSenderId: "232885972924",
    appId: "1:232885972924:web:3fb38f69136a426ae745b9",
    measurementId: "G-RFM9D6JFSY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
export {auth, provider, db}