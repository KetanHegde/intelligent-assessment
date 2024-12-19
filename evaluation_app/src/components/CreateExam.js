import React, { useState, useEffect } from "react";
import axios from "axios";

const EvaluationCreationForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    topic: "",
    group: null,
    scheduleType: null,
    questionTypes: [],
    questionDistribution: {
      easy: 0,
      medium: 0,
      difficult: 0,
    },
    timeLimit: 0,
    finishDateTime: "", // New field for test finishing date and time
  });
  const [topics, setTopics] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTopicsAndGroups = async () => {
      try {
        const topicsResponse = await axios.get(
          "http://localhost:5000/api/titles"
        );
        const groupsResponse = await axios.get(
          "http://localhost:5000/api/groups"
        );

        setTopics(topicsResponse.data);
        setGroups(groupsResponse.data);
      } catch (error) {
        console.error("Detailed error:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers,
        });
      }
    };

    fetchTopicsAndGroups();
  }, []);

  const handleNextStep = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const handlePreviousStep = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/create-evaluation",
        formData
      );
      alert("Evaluation created successfully!");
      console.log(response);
      setFormData({
        title: "",
        topic: "",
        group: null,
        scheduleType: null,
        questionTypes: [],
        questionDistribution: {
          easy: 0,
          medium: 0,
          difficult: 0,
        },
        timeLimit: 0,
        finishDateTime: "", // Reset finish date and time
      });
      setStep(1);
    } catch (error) {
      console.error("Error creating evaluation:", error);
      alert("Failed to create evaluation");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="p-6">
            <h2 className="text-2xl mb-4">Enter Evaluation Title</h2>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full p-2 border rounded"
              placeholder="Enter evaluation title"
            />
            <button
              onClick={handleNextStep}
              disabled={!formData.title}
              className="mt-4 bg-blue-500 text-white p-2 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        );

      case 2:
        return (
          <div className="p-6">
            <h2 className="text-2xl mb-4">Select Topic</h2>
            <select
              value={formData.topic}
              onChange={(e) =>
                setFormData({ ...formData, topic: e.target.value })
              }
              className="w-full p-2 border rounded"
            >
              <option value="">Select a Topic</option>
              {topics.map((topic) => (
                <option key={topic._id} value={topic.name}>
                  {topic.name}
                </option>
              ))}
            </select>
            <div className="flex justify-between mt-4">
              <button
                onClick={handlePreviousStep}
                className="bg-gray-300 text-black p-2 rounded"
              >
                Previous
              </button>
              <button
                onClick={handleNextStep}
                disabled={!formData.topic}
                className="bg-blue-500 text-white p-2 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="p-6">
            <h2 className="text-2xl mb-4">Select Group</h2>
            <select
              value={formData.group || ""}
              onChange={(e) =>
                setFormData({ ...formData, group: e.target.value })
              }
              className="w-full p-2 border rounded"
            >
              <option value="">Select a Group</option>
              {groups.map((group) => (
                <option key={group._id} value={group.groupName}>
                  {group.groupName}
                </option>
              ))}
            </select>
            <div className="flex justify-between mt-4">
              <button
                onClick={handlePreviousStep}
                className="bg-gray-300 text-black p-2 rounded"
              >
                Previous
              </button>
              <button
                onClick={handleNextStep}
                disabled={!formData.group}
                className="bg-blue-500 text-white p-2 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="p-6">
            <h2 className="text-2xl mb-4">Schedule Evaluation</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setFormData({ ...formData, scheduleType: "now" });
                  handleNextStep();
                }}
                className="bg-green-500 text-white p-2 rounded flex-1"
              >
                Schedule Now
              </button>
              <button
                onClick={() => {
                  setFormData({ ...formData, scheduleType: "later" });
                  handleNextStep();
                }}
                className="bg-blue-500 text-white p-2 rounded flex-1"
              >
                Schedule Later
              </button>
            </div>
            <button
              onClick={handlePreviousStep}
              className="mt-4 bg-gray-300 text-black p-2 rounded"
            >
              Previous
            </button>
          </div>
        );

      case 5:
        return (
          <div className="p-6">
            <h2 className="text-2xl mb-4">Select Question Types</h2>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.questionTypes.includes("mcq")}
                  onChange={(e) => {
                    const types = e.target.checked
                      ? [...formData.questionTypes, "mcq"]
                      : formData.questionTypes.filter((type) => type !== "mcq");
                    setFormData({ ...formData, questionTypes: types });
                  }}
                  className="mr-2"
                />
                Multiple Choice Questions (MCQ)
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.questionTypes.includes("descriptive")}
                  onChange={(e) => {
                    const types = e.target.checked
                      ? [...formData.questionTypes, "descriptive"]
                      : formData.questionTypes.filter(
                          (type) => type !== "descriptive"
                        );
                    setFormData({ ...formData, questionTypes: types });
                  }}
                  className="mr-2"
                />
                Descriptive Questions
              </label>
            </div>
            <div className="flex justify-between mt-4">
              <button
                onClick={handlePreviousStep}
                className="bg-gray-300 text-black p-2 rounded"
              >
                Previous
              </button>
              <button
                onClick={handleNextStep}
                disabled={formData.questionTypes.length === 0}
                className="bg-blue-500 text-white p-2 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="p-6">
            <h2 className="text-2xl mb-4">Question Difficulty Distribution</h2>
            <div className="space-y-4">
              <div>
                <label>Easy Questions</label>
                <input
                  type="number"
                  value={formData.questionDistribution.easy}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      questionDistribution: {
                        ...formData.questionDistribution,
                        easy: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full p-2 border rounded"
                  min="0"
                />
              </div>
              <div>
                <label>Medium Questions</label>
                <input
                  type="number"
                  value={formData.questionDistribution.medium}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      questionDistribution: {
                        ...formData.questionDistribution,
                        medium: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full p-2 border rounded"
                  min="0"
                />
              </div>
              <div>
                <label>Difficult Questions</label>
                <input
                  type="number"
                  value={formData.questionDistribution.difficult}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      questionDistribution: {
                        ...formData.questionDistribution,
                        difficult: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full p-2 border rounded"
                  min="0"
                />
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <button
                onClick={handlePreviousStep}
                className="bg-gray-300 text-black p-2 rounded"
              >
                Previous
              </button>
              <button
                onClick={handleNextStep}
                disabled={
                  formData.questionDistribution.easy +
                    formData.questionDistribution.medium +
                    formData.questionDistribution.difficult ===
                  0
                }
                className="bg-blue-500 text-white p-2 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="p-6">
            <h2 className="text-2xl mb-4">Set Time Limit</h2>
            <input
              type="number"
              value={formData.timeLimit}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  timeLimit: parseInt(e.target.value) || 0,
                })
              }
              className="w-full p-2 border rounded"
              placeholder="Time limit in minutes"
              min="0"
            />
            <div className="flex justify-between mt-4">
              <button
                onClick={handlePreviousStep}
                className="bg-gray-300 text-black p-2 rounded"
              >
                Previous
              </button>
              <button
                onClick={handleNextStep}
                disabled={formData.timeLimit === 0}
                className="bg-blue-500 text-white p-2 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="p-6">
            <h2 className="text-2xl mb-4">Set Test Finishing Date & Time</h2>
            <input
              type="datetime-local"
              value={formData.finishDateTime}
              onChange={(e) =>
                setFormData({ ...formData, finishDateTime: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
            <div className="flex justify-between mt-4">
              <button
                onClick={handlePreviousStep}
                className="bg-gray-300 text-black p-2 rounded"
              >
                Previous
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.finishDateTime}
                className="bg-green-500 text-white p-2 rounded disabled:opacity-50"
              >
                Create Evaluation
              </button>
            </div>
            {loading && (
              <div className="mt-4 text-center">
                <div
                  className="spinner-border animate-spin inline-block w-6 h-6 border-4 border-current border-t-transparent rounded-full"
                  role="status"
                ></div>
                <span className="ml-2">Creating...</span>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow-md rounded-lg">
      <div className="p-4 bg-blue-100 text-center">
        <h1 className="text-3xl font-bold">Create Evaluation</h1>
        <div className="mt-2">Step {step} of 8</div>
      </div>
      {renderStep()}
    </div>
  );
};

export default EvaluationCreationForm;
