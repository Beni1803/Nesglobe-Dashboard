// Firebase Configuration
var firebaseConfig = {
    apiKey: "AIzaSyCHxuJa5U7o7Qaf48lwBgiEiyQVP58LeY8",
    authDomain: "nesglobe-dashboard.firebaseapp.com",
    projectId: "nesglobe-dashboard",
    storageBucket: "nesglobe-dashboard.appspot.com",
    messagingSenderId: "285155144844",
    appId: "1:285155144844:web:5f97e69130fc4b862637a9",
    measurementId: "G-CNCQEGXG6J"
  };
  
  // Initialize Firebase
  const app = firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const analytics = firebase.analytics();
  var db = firebase.firestore();