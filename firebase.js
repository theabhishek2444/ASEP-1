// firebase.js
// This uses the "compat" syntax which works with your HTML script tags.

const firebaseConfig = {
  apiKey: "AIzaSyCl02GQUuJ5r8F2IhmUwdkJWJAB-6o_xt0",
  authDomain: "asep-1-33adc.firebaseapp.com",
  databaseURL: "https://asep-1-33adc-default-rtdb.firebaseio.com",
  projectId: "asep-1-33adc",
  storageBucket: "asep-1-33adc.firebasestorage.app",
  messagingSenderId: "561363595971",
  appId: "1:561363595971:web:c79dfc4383fb57fd876876"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Make these available to other files
const db = firebase.database();
const auth = firebase.auth();