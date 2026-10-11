import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAWaKCwwhwtHWilhAWLgufEWYTiizb8HQo",
  authDomain: "university-reports-9ca01.firebaseapp.com",
  projectId: "university-reports-9ca01",
  storageBucket: "university-reports-9ca01.firebasestorage.app",
  messagingSenderId: "784396050249",
  appId: "1:784396050249:web:d9582c8997e0e294868498"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const authSection = document.getElementById("authSection");

function attachLoginHandler() {
  const btn = document.getElementById("loginBtn");
  if (!btn) return;
  btn.addEventListener("click", function () {
    signInWithPopup(auth, provider)
      .then(function (result) {
        console.log("User signed in:", result.user.displayName);
      })
      .catch(function (error) {
        console.error("Sign in error:", error);
        alert("فشل تسجيل الدخول: " + error.message);
      });
  });
}

onAuthStateChanged(auth, function (user) {
  if (!authSection) return;

  if (user) {
    authSection.innerHTML = `
      <div class="user-menu">
        <button class="user-btn" id="userBtn">
          👤 ${user.displayName || "المستخدم"} ▼
        </button>
        <div class="user-dropdown hidden" id="userDropdown">
          <a href="#" class="dropdown-item">📄 تقاريري</a>
          <a href="#" class="dropdown-item">⚙️ حسابي</a>
          <button class="dropdown-item logout-btn" id="logoutBtn">🚪 تسجيل خروج</button>
        </div>
      </div>
    `;

    const userBtn = document.getElementById("userBtn");
    const userDropdown = document.getElementById("userDropdown");

    userBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      userDropdown.classList.toggle("hidden");
    });

    document.addEventListener("click", function () {
      userDropdown.classList.add("hidden");
    });

    document.getElementById("logoutBtn").addEventListener("click", function () {
      signOut(auth).then(function () {
        console.log("User signed out");
      });
    });

    window.currentUser = {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      photo: user.photoURL
    };

  } else {
    authSection.innerHTML = `<button id="loginBtn" class="auth-btn">🔐 تسجيل دخول</button>`;
    attachLoginHandler();
    window.currentUser = null;
  }
});

attachLoginHandler();
console.log("Firebase Auth initialized ✓");