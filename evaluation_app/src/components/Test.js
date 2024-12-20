import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

const TestPage = () => {
  const { evaluationId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [timeLimit, setTimeLimit] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      const usn = localStorage.getItem("username");
      await fetch("http://localhost:5000/api/submit-answers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usn,
          evaluationId,
          answers: Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer,
          })),
        }),
      });

      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch (err) {
          console.error("Error exiting fullscreen:", err);
        }
      }

      navigate("/student-dashboard");
    } catch (err) {
      console.error("Error submitting answers:", err);
      setIsSubmitting(false);
      navigate("/student-dashboard"); // Fallback navigation
    }
  }, [answers, evaluationId, navigate, isSubmitting]);

  const startTest = useCallback(async () => {
    try {
      const elem = document.documentElement;
      await elem.requestFullscreen();
      setHasStarted(true);
    } catch (err) {
      console.error("Fullscreen error:", err);
      alert(
        "Fullscreen mode is required to take this test. Please enable fullscreen permissions and try again."
      );
    }
  }, []);

  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && hasStarted && !isSubmitting) {
        handleSubmit();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [handleSubmit, hasStarted, isSubmitting]);

  // Monitor tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && hasStarted && !isSubmitting) {
        handleSubmit();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [handleSubmit, hasStarted, isSubmitting]);

  // Timer effect - only start when test has begun
  useEffect(() => {
    if (!hasStarted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1 && !isSubmitting) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleSubmit, hasStarted, isSubmitting]);

  // Fetch questions and timeLimit
  useEffect(() => {
    const fetchEvaluationDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/questions/${evaluationId}`
        );
        const data = await response.json();
        console.log(data);
        setQuestions(data.questions);
        setTimeLimit(data.timeLimit);
        setTimeRemaining(data.timeLimit * 60);
      } catch (err) {
        console.error("Error fetching evaluation details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvaluationDetails();
  }, [evaluationId]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = useCallback((questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }, []);

  const handleNextStep = () => setCurrentStep((prev) => prev + 1);
  const handlePreviousStep = () => setCurrentStep((prev) => prev - 1);

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

  if (!hasStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4 text-center">
            Ready to Start Test?
          </h1>
          <p className="mb-6 text-gray-600">
            This test requires fullscreen mode. Make sure you:
          </p>
          <ul className="list-disc pl-5 mb-6 text-gray-600 space-y-2">
            <li>Have a stable internet connection</li>
            <li>Won't be disturbed during the test</li>
            <li>Have {timeLimit} minutes available</li>
            <li>Have enabled fullscreen permissions</li>
          </ul>
          <button
            onClick={startTest}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Start Test in Fullscreen
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentStep - 1];

  return (
    <div className="min-h-screen bg-gray-50">
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
            <h2 className="text-xl font-semibold mb-4">
              Question {currentStep}
            </h2>
            <p className="text-gray-700 mb-6">{currentQuestion.question}</p>

            {currentQuestion.questionType === "MCQ" ? (
              <div className="space-y-4">
                {currentQuestion.options?.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center">
                    <input
                      type="radio"
                      id={`option-${optionIndex}`}
                      name={`question-${currentQuestion._id}`}
                      value={option}
                      checked={answers[currentQuestion._id] === option}
                      onChange={(e) =>
                        handleAnswerChange(currentQuestion._id, e.target.value)
                      }
                      className="h-4 w-4 text-blue-600"
                    />
                    <label
                      htmlFor={`option-${optionIndex}`}
                      className="ml-3 text-gray-700"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="6"
                value={answers[currentQuestion._id] || ""}
                onChange={(e) =>
                  handleAnswerChange(currentQuestion._id, e.target.value)
                }
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
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Test"}
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