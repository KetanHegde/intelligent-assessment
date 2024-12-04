import React, { useState, useEffect } from 'react';
import '../css/Title.css'; 
import Description from './Description';

const TitleAndText = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isAvailable, setIsAvailable] = useState(null);
  const [debouncedName, setDebouncedName] = useState(name);
  const [showDescription, setShowDescription] = useState(false); 

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedName(name);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [name]);

  useEffect(() => {
    if (debouncedName.trim() !== '') {
      checkNameAvailability(debouncedName);
    } else {
      setMessage('');
      setIsAvailable(null);
    }
  }, [debouncedName]);

  const checkNameAvailability = async (inputName) => {
    try {
      const response = await fetch('http://localhost:5000/api/check-title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: inputName }),
      });
      const result = await response.json();
      setIsAvailable(result.available);
      setMessage(result.message);
    } catch (error) {
      console.error('Error checking name:', error);
      setMessage('An error occurred. Please try again.');
      setIsAvailable(null);
    }
  };

  const handleBlur = () => {
    if (name.trim() === '') {
      setMessage('This field is required.');
      setIsAvailable(null);
    }
  };

  const handleButtonClick = () => {
    if (isAvailable) {
      // Handle the schedule navigation logic if required
    } else {
      setShowDescription(true); 
    }
  };

  return (
    <div className="name-check-container">
      {!showDescription ? (
        <div className="name-check-content">
          <h2>Check Name Availability</h2>
          <input
            type="text"
            placeholder="Enter the title"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleBlur} 
          />
          {message && (
            <p className={`message ${isAvailable ? 'available' : 'required'}`}>
              {message}
            </p>
          )}
          {message && (
            <button onClick={handleButtonClick}>
              {isAvailable ? 'Go to Schedule' : 'Go to Description'}
            </button>
          )}
        </div>
      ) : (
        <Description/>
      )}
    </div>
  );
};

export default TitleAndText;
