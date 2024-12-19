import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Create navigate instance

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json(); // Extract response data

      if (response.ok) {
        
        const { token, role, name, username } = data; // Destructure from response data
        // Store JWT, role, and username in localStorage
        localStorage.setItem("jwtToken", token);  // JWT token
        localStorage.setItem("role", role);  // User role
        localStorage.setItem("name", name);  // Username
        localStorage.setItem("username", username);
        // Redirect based on user role
        if (role === "teacher") {
          navigate("/teacher-dashboard");
        } else if (role === "student") {
          navigate("/student-dashboard");
        }
      } else {
        alert(`Login failed: ${data.message}`); // Display error if login fails
      }
    } catch (error) {
      alert("An error occurred while logging in. Please try again."); // Handle network errors
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            id="username"
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder=" "
            required
          />
          <label htmlFor="username" className="floating-label">Username</label>
        </div>
        <div className="form-group">
          <input
            type="password"
            id="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder=" "
            required
          />
          <label htmlFor="password" className="floating-label">Password</label>
        </div>
        <button type="submit" className="submit-btn">Login</button>
      </form>
    </div>
  );
};

export default LoginForm;

/* Styles for the LoginForm component */
const styles = `
/* Container for the form */
.form-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1.5px solid rgba(0, 0, 0, 0.175);
  border-radius: 15px;
  margin-top: 20vh;
  background: #fff;
}

/* Title for the form */
.form-title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

/* Form group container */
.form-group {
  position: relative;
  margin-bottom: 20px;
}

/* Input field styling */
.input {
  width: 100%;
  padding: 10px 10px 10px 5px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
  background: white;
  transition: border-color 0.3s, padding 0.3s;
  box-sizing: border-box;
}

/* Input focus state */
.input:focus {
  border: 2px solid #0d6efd;
  padding: 9px 9px 9px 4px; /* Adjust padding for thicker border */
}

/* Floating label styling */
.floating-label {
  position: absolute;
  top: 12px; /* Adjust label position */
  left: 5px;
  font-size: 16px;
  color: #aaa;
  pointer-events: none;
  transition: all 0.2s ease-out;
  background-color: #fff;
  padding: 0 5px; /* Prevent overlap with the border */
}

/* Floating label active state */
.input:focus + .floating-label,
.input:not(:placeholder-shown) + .floating-label {
  top: -10px;
  font-size: 12px;
  color: #0d6efd;
}

/* Submit button */
.submit-btn {
  width: 100%;
  padding: 10px;
  background-color: #0d6efd;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

/* Hover effect for submit button */
.submit-btn:hover {
  background-color: #0056b3;
}

/* Message styles */
.message {
  text-align: center;
  margin-top: 20px;
  font-size: 16px;
}

/* Success message */
.message.success {
  color: blue;
}

/* Error message */
.message.error {
  color: red;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .form-container {
    width: 90%;
    padding: 15px;
  }
}
`;

// Inject styles into the document head
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
