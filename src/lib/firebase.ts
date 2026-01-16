import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableMultiTabIndexedDbPersistence } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCi0a925RnMAqXDHvkeuc7AWFcWYlxI9FE",
    authDomain: "amora-fd022.firebaseapp.com",
    databaseURL: "https://amora-fd022-default-rtdb.firebaseio.com",
    projectId: "amora-fd022",
    storageBucket: "amora-fd022.firebasestorage.app",
    messagingSenderId: "186529120042",
    appId: "1:186529120042:web:e81405d079f5dfa2bd2853",
    measurementId: "G-CE5W02KD6V"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);

const isSecureContext = window.location.hostname === 'localhost' || window.location.protocol === 'https:';

if (typeof window !== "undefined" && isSecureContext) {
    enableMultiTabIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn('Firestore persistence failed: Multiple tabs open');
        } else if (err.code === 'unimplemented') {
            console.warn('Firestore persistence failed: Browser not supported');
        }
    });
}

export const storage = getStorage(app);
export let messaging: any = null;

if (typeof window !== "undefined" && isSecureContext) {
    try {
        messaging = getMessaging(app);
    } catch (error) {
        console.warn('Firebase Messaging not supported in this context:', error);
    }
}

// Initialize Analytics
export let analytics: any;
isSupported().then(yes => {
    if (yes) analytics = getAnalytics(app);
});
