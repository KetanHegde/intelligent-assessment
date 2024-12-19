import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ResultsStudentPage = () => {
  const { evaluationId, usn } = useParams();
  const [studentResult, setStudentResult] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentResult = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/results/student/${evaluationId}/${usn}`);
        if (!response.ok) throw new Error("Failed to fetch student result");
        const data = await response.json();
        setStudentResult(data);
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchRankings = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/results/ranking/${evaluationId}`);
        if (!response.ok) throw new Error("Failed to fetch rankings");
        const data = await response.json();
        setRankings(data);
      } catch (err) {
        setError(err.message);
      }
    };

    Promise.all([fetchStudentResult(), fetchRankings()])
      .finally(() => setLoading(false));
  }, [evaluationId, usn]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p className="mb-0">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white py-3">
              <h1 className="h3 mb-0 text-center">Results for Evaluation</h1>
            </div>

            <div className="card-body">
              {studentResult ? (
                <div className="mb-5">
                  <div className="bg-light p-4 rounded-3 border">
                    <h2 className="h4 mb-4 text-primary">Your Result</h2>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="text-muted small">Student USN</label>
                          <p className="h5">{studentResult.evaluation.studentUSN}</p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="text-muted small">Marks Obtained</label>
                          <p className="h5">{studentResult.evaluation.marks}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="alert alert-warning">
                  No result found for this student in this evaluation.
                </div>
              )}

              <div className="mt-4">
                <h2 className="h4 mb-4 text-primary">All Student Rankings</h2>
                {rankings.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Rank</th>
                          <th>USN</th>
                          <th>Marks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rankings.map((result, index) => (
                          <tr key={index} className={result.evaluation.studentUSN === usn ? "table-primary" : ""}>
                            <td>
                              <span className="badge bg-secondary">{index + 1}</span>
                            </td>
                            <td>{result.evaluation.studentUSN}</td>
                            <td>
                              <span className="fw-bold">{result.evaluation.marks}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="alert alert-info">
                    No rankings available for this evaluation.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsStudentPage;