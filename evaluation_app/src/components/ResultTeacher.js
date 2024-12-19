import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ResultsTeacherPage = () => {
  const { evaluationId } = useParams();
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/results/ranking/${evaluationId}`);
        if (!response.ok) throw new Error("Failed to fetch rankings");
        const data = await response.json();
        setRankings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [evaluationId]);

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

  // Calculate statistics
  const calculateStats = () => {
    if (rankings.length === 0) return null;
    
    const marks = rankings.map(r => r.evaluation.marks);
    return {
      highest: Math.max(...marks),
      lowest: Math.min(...marks),
      average: (marks.reduce((a, b) => a + b, 0) / marks.length).toFixed(2),
      totalStudents: marks.length
    };
  };

  const stats = calculateStats();

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white py-3">
              <h1 className="h3 mb-0 text-center">Evaluation Results Overview</h1>
            </div>

            <div className="card-body">
              {/* Statistics Cards */}
              {stats && (
                <div className="row mb-4">
                  <div className="col-md-3">
                    <div className="card border-0 bg-light">
                      <div className="card-body text-center">
                        <h6 className="text-muted mb-2">Highest Mark</h6>
                        <h4 className="mb-0 text-success">{stats.highest}</h4>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card border-0 bg-light">
                      <div className="card-body text-center">
                        <h6 className="text-muted mb-2">Lowest Mark</h6>
                        <h4 className="mb-0 text-danger">{stats.lowest}</h4>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card border-0 bg-light">
                      <div className="card-body text-center">
                        <h6 className="text-muted mb-2">Average</h6>
                        <h4 className="mb-0 text-primary">{stats.average}</h4>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card border-0 bg-light">
                      <div className="card-body text-center">
                        <h6 className="text-muted mb-2">Total Students</h6>
                        <h4 className="mb-0">{stats.totalStudents}</h4>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Rankings Table */}
              <div className="mt-4">
                <h2 className="h4 mb-4 text-primary">Student Rankings</h2>
                {rankings.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Rank</th>
                          <th>USN</th>
                          <th>Marks</th>
                          <th>Performance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rankings.map((result, index) => (
                          <tr key={index}>
                            <td>
                              <span className="badge bg-secondary">{index + 1}</span>
                            </td>
                            <td>{result.evaluation.studentUSN}</td>
                            <td>
                              <span className="fw-bold">{result.evaluation.marks}</span>
                            </td>
                            <td>
                              {result.evaluation.marks >= 90 ? (
                                <span className="badge bg-success">Excellent</span>
                              ) : result.evaluation.marks >= 75 ? (
                                <span className="badge bg-primary">Good</span>
                              ) : result.evaluation.marks >= 60 ? (
                                <span className="badge bg-warning">Average</span>
                              ) : (
                                <span className="badge bg-danger">Needs Improvement</span>
                              )}
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

export default ResultsTeacherPage;