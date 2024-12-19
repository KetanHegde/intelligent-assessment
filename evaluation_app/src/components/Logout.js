import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logoutUser = async () => {
      try {
        // Call the backend /logout route to clear any server-side session or perform any required actions
        await axios.post('http://localhost:5000/logout');

        // Remove the JWT token from localStorage to log the user out
        localStorage.removeItem('jwtToken');

        // Optionally, redirect the user to the login page after logout
        navigate('/login');  // Adjust to the actual login route in your app
      } catch (error) {
        console.error("Error logging out:", error);
      }
    };

    // Call the logout function as soon as the component is rendered
    logoutUser();
  }, [navigate]);

  return (
    <div>
      <h2>Logging out...</h2>
      {/* You can display a loading spinner here or a message saying "Logging out..." */}
    </div>
  );
};

export default Logout;
