/* ==========================================================================
   NEXIFING — firebase-config.js
   ========================================================================== */
window.NEXIFING_FIREBASE_CONFIG = {
  apiKey: "AIzaSyA-7yMeF5wP0Tuy8hFxLaqmmXQ3NDX0HZk",
  authDomain: "nexifing-c3562.firebaseapp.com",
  projectId: "nexifing-c3562",
  storageBucket: "nexifing-c3562.firebasestorage.app",
  messagingSenderId: "367996073120",
  appId: "1:367996073120:web:37e1397c4fd04d08a605c5",
  measurementId: "G-9V3LTZMFJ2"
};

if (window.firebase) {
  if (!firebase.apps.length) {
    firebase.initializeApp(window.NEXIFING_FIREBASE_CONFIG);
  }
}
