// src/pages/Signup.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Signup.css";
import { auth, provider } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      localStorage.setItem("user", JSON.stringify({ email: user.email, uid: user.uid }));
      navigate("/desktop");
    } catch (err) {
      console.error("Signup error:", err);
      if (err.code === "auth/email-already-in-use")
        setError("Email already registered. Try logging in.");
      else setError("Signup failed. Please try again.");
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const user = result.user;

      localStorage.setItem("user", JSON.stringify({ email: user.email, uid: user.uid }));
      navigate("/desktop");
    } catch (err) {
      console.error("Google signup error:", err);
      setError("Google sign-up failed. Please try again.");
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-container">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit">Sign Up</button>
        </form>

        <div className="google-signin" onClick={handleGoogleSignup}>
          <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            alt="Google"
          />
          Sign up with Google
        </div>

        {error && <p className="error">{error}</p>}

        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
