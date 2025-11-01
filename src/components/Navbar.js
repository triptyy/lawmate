import { Link } from "react-router-dom";
import React from "react";
import "../styles/Desktop.css"; // Updated CSS

function Navbar() {
  return (
    <nav className="secondary-nav">
      <div className="nav-left">
        <Link to="/fundamentals" className="nav-link">About Us</Link>
      </div>

      <div className="nav-center">
        <h1 className="logo">LAW MATE</h1>
        <p className="logo-subtitle">Your Legal Companion</p>
      </div>

      <div className="nav-right">
        <Link to="/login" className="nav-link">Login</Link>
        <Link to="/signup" className="nav-link signup-link">Signup</Link>
        <Link to="/news" className="nav-link">News</Link>
      </div>
    </nav>
  );
}

export default Navbar;
