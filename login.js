import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getAuth, signInWithEmailAndPassword } from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 🔵 Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB1iTl6zR2JR7T8o_JzuWQTWYBnjZRgrZo",
  authDomain: "smart-tailoring-system-274fe.firebaseapp.com",
  projectId: "smart-tailoring-system-274fe",
  storageBucket: "smart-tailoring-system-274fe.firebasestorage.app",
  messagingSenderId: "1074418745199",
  appId: "1:1074418745199:web:8b3083ba9881dae58bb29a",
  measurementId: "G-JYBFRJNH5X"
};

// 🔵 Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🔵 Login form handling
document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        alert("Login Successful!");
        window.location.href = "dashboard.html";
    })
    .catch((error) => {
        alert("Invalid Email or Password!");
        console.log(error.message);
    });
});