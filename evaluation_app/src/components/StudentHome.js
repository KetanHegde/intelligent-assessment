import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Welcome from "./Welcome";
import Navbar from "./Navbar";
import "../css/StudentHome.css"; // Import CSS file
import { Link } from 'react-router-dom';
const StudentHome = () => {
  const [usn, setUSN]= useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [groups, setGroups] = useState([]);
  const [student, setStudent] = useState(null);
  const [studentName, setStudentName] = useState(null);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("jwtToken");

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/evaluations/home",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(response.data.evaluations);

        setStudent(response.data.student);
        setStudentName(response.data.student.Name);
        setUSN(response.data.student.USN);
        setGroups(response.data.groups || []);
        setEvaluations(response.data.evaluations || []);
        setLoginSuccess(true);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoginSuccess(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  // Navigation handlers
  const handleTestClick = (evaluationId) => {
    navigate(`/test/${evaluationId}`);
  };

  const handleResultsClick = (evaluationId) => {
    navigate(`/results/${evaluationId}/${usn}`);
  };

  // Render logic if not logged in
  if (!loginSuccess) {
    return (
      <div className="message-container">
        Please log in to continue.
        <br />
        <Link to="/login">Go to Login Page</Link>
      </div>
    );
  }

  // Render logic if student info is not found
  if (!student) {
    return (
      <div className="message-container">Student information not found.</div>
    );
  }

  return (
    <>
      {/* Navbar and Welcome Section */}
      <Navbar />
      <Welcome title="EduAssessMate" username={studentName} />

      {/* Groups Section */}
      <div className="section mx-5 mt-3">
        <h3>Your Groups</h3>
        {groups.length > 0 ? (
          <div className="card-grid">
            {groups.map((group) => (
              <div key={group._id} className="card">
                <h5 className="card-title">{group.groupName}</h5>
                <p className="card-text">Members: {group.students.length}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-message">No groups found.</p>
        )}
      </div>

      {/* Evaluations Section */}
      <div className="section mx-5">
        <h3>Your Assessments</h3>
        {evaluations.length > 0 ? (
          <div className="card-grid">
            {evaluations.map((evaluation) => (
              <div key={evaluation._id} className="card">
                <h5 className="card-title">{evaluation.title}</h5>
                <p className="card-text">Topic: {evaluation.topic}</p>
                <p className="card-text">
                  Scheduled For: {evaluation.scheduleType}
                </p>
                <p className="card-text">
                  Time Limit: {evaluation.timeLimit} minutes
                </p>
                {evaluation.status === "active" && (
                  <button
                    onClick={() => handleTestClick(evaluation._id)}
                    className="btn primary"
                  >
                    Take Test
                  </button>
                )}
                {evaluation.status === "completed" && (
                  <button className="btn secondary" disabled>
                    Evaluation Pending
                  </button>
                )}
                {evaluation.status === "evaluated" && (
                  <button
                    onClick={() => handleResultsClick(evaluation._id)}
                    className="btn success"
                  >
                    See Results
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-message">No Assessments found.</p>
        )}
      </div>
    </>
  );
};

export default StudentHome;
