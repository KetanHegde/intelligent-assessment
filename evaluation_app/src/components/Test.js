import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const TestPage = ({ timeLimit = 60 }) => {
  const { evaluationId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();

  // Define submit function first without dependencies on enterFullscreen
  const handleSubmit = useCallback(async () => {
    try {
      const usn = localStorage.getItem('username');
      await fetch('http://localhost:5000/api/submit-answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usn,
          evaluationId,
          answers: Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer
          }))
        })
      });
      
      // Exit fullscreen before navigating
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      }
      
      navigate('/student-dashboard');
    } catch (err) {
      console.error('Error submitting answers:', err);
    }
  }, [answers, evaluationId, navigate]);

  // Now enterFullscreen can depend on handleSubmit
  const enterFullscreen = useCallback(async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch (err) {
      console.error('Fullscreen error:', err);
      handleSubmit(); // Force submit if fullscreen fails
    }
  }, [handleSubmit]);

  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = document.fullscreenElement !== null;
      setIsFullscreen(isCurrentlyFullscreen);
      
      if (!isCurrentlyFullscreen) {
        handleSubmit(); // Auto-submit if fullscreen is exited
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [handleSubmit]);

  // Monitor keyboard shortcuts and tab visibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Allow only essential keys
      const allowedKeys = [
        'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        'Tab', 'Enter', 'Shift', 'Control', 'Alt'
      ];
      
      if (!allowedKeys.includes(e.key) && 
          !(e.key.length === 1 && /[\w\s.,?!@#$%^&*()_+=\-;:'"[\]{}|\\/<>]/.test(e.key))) {
        e.preventDefault();
        return false;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleSubmit(); // Auto-submit if tab/window loses focus
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleSubmit]);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleSubmit]);

  // Fetch questions and enter fullscreen
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:5000/api/questions/${evaluationId}`);
        const data = await response.json();
        setQuestions(data);
        await enterFullscreen(); // Enter fullscreen after questions are loaded
      } catch (err) {
        console.error('Error fetching questions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [evaluationId, enterFullscreen]); // Now includes enterFullscreen dependency

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNextStep = () => setCurrentStep(prev => prev + 1);
  const handlePreviousStep = () => setCurrentStep(prev => prev - 1);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="h-screen p-4">
        <p>No questions available.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentStep - 1];

  return (
    <div className="min-h-screen bg-gray-50">
      {!isFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md text-center">
            <h2 className="text-xl font-bold mb-4">Fullscreen Required</h2>
            <p className="mb-4">This test must be taken in fullscreen mode. Click the button below to continue.</p>
            <button
              onClick={enterFullscreen}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Enter Fullscreen
            </button>
          </div>
        </div>
      )}

      <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold">
              Question {currentStep} of {questions.length}
            </div>
            <div className="text-lg font-bold text-red-600">
              Time Remaining: {formatTime(timeRemaining)}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Question {currentStep}</h2>
            <p className="text-gray-700 mb-6">{currentQuestion.question}</p>
            
            {currentQuestion.questionType === 'MCQ' ? (
              <div className="space-y-4">
                {currentQuestion.options?.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center">
                    <input
                      type="radio"
                      id={`option-${optionIndex}`}
                      name={`question-${currentQuestion._id}`}
                      value={option}
                      checked={answers[currentQuestion._id] === option}
                      onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <label htmlFor={`option-${optionIndex}`} className="ml-3 text-gray-700">
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="6"
                value={answers[currentQuestion._id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                placeholder="Enter your answer here..."
              />
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between">
            <button
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
              onClick={handlePreviousStep}
              disabled={currentStep === 1}
            >
              Previous
            </button>
            
            {currentStep === questions.length ? (
              <button 
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                onClick={handleSubmit}
              >
                Submit Test
              </button>
            ) : (
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handleNextStep}
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;