import React, { useState } from "react";
import "../css/RegisterForm.css"; // External CSS file
import { Link } from 'react-router-dom';
const RegisterForm = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const role = "teacher";

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, name, email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("User created successfully!");
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setMessage("Error connecting to the server.");
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">User Registration</h2>
      <form onSubmit={handleSubmit}>
        {/* Username Field */}
        <div className="form-group">
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={username ? "input active" : "input"}
          />
          <label htmlFor="username" className="floating-label">
            Username
          </label>
        </div>

        {/* Name Field */}
        <div className="form-group">
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={name ? "input active" : "input"}
          />
          <label htmlFor="name" className="floating-label">
            Name
          </label>
        </div>

        {/* Email Field */}
        <div className="form-group">
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={email ? "input active" : "input"}
          />
          <label htmlFor="email" className="floating-label">
            Email
          </label>
        </div>

        {/* Password Field */}
        <div className="form-group">
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={password ? "input active" : "input"}
          />
          <label htmlFor="password" className="floating-label">
            Password
          </label>
        </div>

        <button type="submit" className="submit-btn">
          Register
        </button>
      </form>

      <div style={{textAlign:"center"}} className="mt-3">
        <p><Link to="/login">Click Here </Link>To Login</p>
      </div>

      {message && (
        <p
          className={`message ${
            message.includes("Error") ? "error" : "success"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default RegisterForm;

