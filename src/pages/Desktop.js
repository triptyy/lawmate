// src/pages/Desktop.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Desktop.css";

export default function Desktop() {
  const navigate = useNavigate();

  return (
    <div className="desktop">
      {/* Navigation Bar */}
      <nav className="secondary-nav">
        <div className="nav-left">
          <a href="/about" className="nav-link">About Us</a>
        </div>

        <div className="nav-center">
          <h1 className="logo">LAW MATE</h1>
          <p className="logo-subtitle">Your Legal Companion</p>
        </div>

        <div className="nav-right">
          <a href="/login" className="nav-link">Login</a>
          <a href="/signup" className="nav-link">Signup</a>
        </div>
      </nav>

      {/* Hero Banner */}
      <section className="hero-banner">
        <img
          src="/images/front.jpg"
          alt="Law background"
          className="hero-bg-img"
        />
        <div className="hero-overlay" />
      </section>

      {/* Carousel Section */}
      <section className="carousel-section">
        <h2 className="carousel-title">Our Core Services</h2>
        <div className="carousel-container">
          <div className="carousel-track">

            {/* AI Chatbot */}
            <div
              className="carousel-item"
              onClick={() => navigate("/chatbot")}
              style={{ cursor: "pointer" }}
            >
              <img src="/images/chatbot.png" alt="AI Chatbot" />
              <span>AI Chatbot</span>
              <p>
                Interactive AI-powered LawBot that answers user queries,
                explains laws in simple language, and gives step-by-step
                guidance.
              </p>
            </div>

            {/* Legal News */}
            <div
              className="carousel-item"
              style={{ cursor: "pointer" }}
              onClick={() =>
                window.open("https://www.livelaw.in/", "_blank")
              }
            >
              <img src="/images/log-in.png" alt="Legal News" />
              <span>Legal News</span>
              <p>
                Get daily updates on court rulings, judgments, and policy changes from trusted sources.
              </p>
            </div>

            {/* Fundamental Rights */}
            <div
              className="carousel-item fundamental-rights"
              onClick={() => navigate("/rights")}
              style={{ cursor: "pointer" }}
            >
              <img src="/images/human-rights.png" alt="Fundamental Rights" />
              <span>Fundamental Rights</span>
              <p>
                A quick guide to the key rights guaranteed under the Indian Constitution.
              </p>
            </div>

            {/* Repeated AI Chatbot */}
            <div
              className="carousel-item"
              onClick={() => navigate("/chatbot")}
              style={{ cursor: "pointer" }}
            >
              <img src="/images/chatbot.png" alt="AI Chatbot" />
              <span>AI Chatbot</span>
              <p>
                Interactive AI-powered LawBot that answers user queries,
                explains laws in simple language, and gives step-by-step
                guidance.
              </p>
            </div>

            {/* Repeated Legal News */}
            <div
              className="carousel-item"
              style={{ cursor: "pointer" }}
              onClick={() =>
                window.open("https://www.barandbench.com/", "_blank")
              }
            >
              <img src="/images/log-in.png" alt="Legal News" />
              <span>Legal News</span>
              <p>
                Stay updated with simplified legal news and developments in India.
              </p>
            </div>

            {/* Repeated Fundamental Rights */}
            <div
              className="carousel-item fundamental-rights"
              onClick={() => navigate("/rights")}
              style={{ cursor: "pointer" }}
            >
              <img src="/images/human-rights.png" alt="Fundamental Rights" />
              <span>Fundamental Rights</span>
              <p>
                Explore the essential rights provided to every citizen by the Constitution.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
