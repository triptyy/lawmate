// src/pages/Rights.js
import React from "react";
import { useNavigate } from "react-router-dom"; // ✅ import navigate
import "../styles/Rights.css";

export default function Rights() {
  const navigate = useNavigate(); // ✅ hook for navigation

  const rights = [
    {
      title: "Right to Equality (Articles 14-18)",
      description:
        "Ensures equality before the law, prohibits discrimination on grounds of religion, race, caste, sex, or place of birth."
    },
    {
      title: "Right to Freedom (Articles 19-22)",
      description:
        "Includes freedom of speech, expression, assembly, association, movement, residence, and profession. Also protects against arbitrary arrest."
    },
    {
      title: "Right against Exploitation (Articles 23-24)",
      description:
        "Prohibits human trafficking, forced labour, and child labour below the age of 14 in hazardous occupations."
    },
    {
      title: "Right to Freedom of Religion (Articles 25-28)",
      description:
        "Guarantees freedom of conscience and the right to freely profess, practice, and propagate religion."
    },
    {
      title: "Cultural and Educational Rights (Articles 29-30)",
      description:
        "Protects the rights of minorities to conserve their culture, language, and script, and to establish and administer educational institutions."
    },
    {
      title: "Right to Constitutional Remedies (Article 32)",
      description:
        "Allows individuals to move the Supreme Court or High Courts to enforce Fundamental Rights (Dr. Ambedkar called this the heart of the Constitution)."
    }
  ];

  return (
    <div className="rights-container">
      <h1>Fundamental Rights of India</h1>
      <p className="intro">
        The Constitution of India guarantees Fundamental Rights to all its citizens.
        These rights are essential for the development of individuals and to ensure
        justice, equality, and freedom in society.
      </p>

      <div className="rights-list">
        {rights.map((right, index) => (
          <div key={index} className="right-card">
            <h2>{right.title}</h2>
            <p>{right.description}</p>
          </div>
        ))}
      </div>

      {/* ✅ Back Button */}
      <div className="back-button-container">
        <button onClick={() => navigate("/")} className="back-button">
          ⬅ Back to Desktop
        </button>
      </div>
    </div>
  );
}
