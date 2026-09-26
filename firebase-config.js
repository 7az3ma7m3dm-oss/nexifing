/* ==========================================================================
   NEXIFING — firebase-config.js
   Initializes Firebase. Keep this file private-ish.
   ========================================================================== */
window.NEXIFING_FIREBASE_CONFIG = {
  apiKey: "AIzaSyA-7yMgFwP0Tuy8hFXLaqmmXQ3NDbX8HZk",
  authDomain: "nexifing-c3562.firebaseapp.com",
  projectId: "nexifing-c3562",
  storageBucket: "nexifing-c3562.firebasestorage.app",
  messagingSenderId: "367996673120",
  appId: "1:367996673120:web:37e1397c4fd04d08a605c5",
  measurementId: "G-9V3ZLZMFJ2"
};

// Initialize Firebase (compat SDK)
if (window.firebase) {
  if (!firebase.apps.length) {
    firebase.initializeApp(window.NEXIFING_FIREBASE_CONFIG);
  }
}
