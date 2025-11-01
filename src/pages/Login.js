// src/pages/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { auth, provider } from "../firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Email/password login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      localStorage.setItem("user", JSON.stringify({ email: user.email, uid: user.uid }));
      navigate("/desktop");
    } catch (err) {
      console.error("Login error:", err);
      if (err.code === "auth/user-not-found") setError("User not found. Please sign up.");
      else if (err.code === "auth/wrong-password") setError("Incorrect password.");
      else setError("Login failed. Try again.");
    }
  };

  // Google login
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const user = result.user;

      localStorage.setItem("user", JSON.stringify({ email: user.email, uid: user.uid }));
      navigate("/desktop");
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError("Google login failed. Please try again.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>

        <button className="google-signin" onClick={handleGoogleLogin}>
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
            alt="Google"
          />
          Login with Google
        </button>

        {error && <p className="error">{error}</p>}

        <p>
          Don’t have an account? <a href="/signup">Sign up here</a>.
        </p>

        <button className="back-button" onClick={() => navigate("/desktop")}>
          ⬅ Back to Desktop
        </button>
      </div>
    </div>
  );
}

export default Login;
