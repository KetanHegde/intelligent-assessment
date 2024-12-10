import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Title.css';
import Description from './Description';

const TitleAndText = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isAvailable, setIsAvailable] = useState(null);
  const [debouncedName, setDebouncedName] = useState(name);
  const [showDescription, setShowDescription] = useState(false);
  const [errorMessageStatus, setErrorMsgStatus] = useState(false);


  const handleDescriptionSaved = () => {
    setShowDescription(false);
    setName("");
  };

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
      setErrorMsgStatus(false);
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
      setErrorMsgStatus(false);
    } catch (error) {
      console.error('Error checking name:', error);
      setMessage('An error occurred. Please try again.');
      setErrorMsgStatus(true);
      setIsAvailable(null);
    }
  };

  const handleBlur = () => {
    if (name.trim() === '') {
      setMessage('This field is required.');
      setErrorMsgStatus(true);
      setIsAvailable(null);
    }
  };

  const handleButtonClick = () => {
    if (isAvailable) {
      setShowDescription(true);
    }
    else 
    {
      navigate('/schedule-test-2');
    }
  };

  return (
    <>
      {!showDescription ? (
        <div className="name-check-container" style={{marginTop:"20vh"}}>
        <div className="name-check-content">
          <h2>Check Title Availability</h2>
          <input
            type="text"
            placeholder="Enter a topic for your test"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleBlur}
            className="name-input"
          />
          {message && (
            <p className={`message ${isAvailable ? 'available' : 'error'} ${errorMessageStatus ? 'alert1' : ''}`}>
              {message}
            </p>
          )}
          {name.trim() !== '' && message && (
            <button onClick={handleButtonClick} className={`action-button ${isAvailable ? 'available' : 'error'}`}>
              {isAvailable ?'Continue to add Description': 'Schedule Test Now'}
            </button>
          )}
        </div>
        </div>
      ) : (
        <Description title={name}  setShowDesc={handleDescriptionSaved}/>
      )}
      </>

  );
};

export default TitleAndText;