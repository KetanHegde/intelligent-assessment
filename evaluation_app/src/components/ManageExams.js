import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EvaluationsList = () => {
  const [evaluations1, setEvaluations1] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/evaluations');
        console.log('API Response:', response.data);

        if (response.data.success) {
          setEvaluations1(response.data.data); // Access evaluations from response.data.data
          setError(null);
        } else {
          setError('Failed to load evaluations');
        }
      } catch (err) {
        console.error('Error fetching evaluations1:', err);
        setError('Failed to load evaluations');
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, []);

  // Function to handle status update
  const updateStatus = async (evaluationId, newStatus) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/evaluations/${evaluationId}/status`, { status: newStatus });
      if (response.data.success) {
        // Update the local state with the new evaluation data
        const updatedEvaluations = evaluations1.map((evaluation) =>
          evaluation._id === evaluationId ? { ...evaluation, status: newStatus } : evaluation
        );
        setEvaluations1(updatedEvaluations);
        setMessage(`Evaluation status updated to '${newStatus}'!`);
      }
    } catch (err) {
      console.error('Error updating evaluation status:', err);
      setError('Failed to update evaluation status');
    }
  };

  const handleButtonClick = (status, evaluationId) => {
    switch(status) {
      case 'draft':
        updateStatus(evaluationId, 'active'); // Change status to 'active'
        break;
      case 'active':
        setMessage('Please wait until the time is completed.');
        break;
      case 'completed':
        updateStatus(evaluationId, 'evaluated'); // Change status to 'evaluated'
        break;
      case 'evaluated':
        setMessage('Displaying the evaluation results...');
        break;
      default:
        setMessage('');
        break;
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="text-center mt-5 alert alert-danger">Error: {error}</div>;

  return (
    <div className="container-fluid mt-5 px-4">
      <h1 className="text-center mb-4">Evaluations</h1>
      {message && (
        <div className="alert alert-info text-center mb-4">
          {message}
        </div>
      )}
      {evaluations1.length === 0 ? (
        <div className="alert alert-info text-center">No evaluations found</div>
      ) : (
        <div className="flex flex-wrap gap-4" style={{maxHeight:"65vh", overflowY:"scroll"}}>
          {evaluations1.map((evaluation1) => (
            <div 
              key={evaluation1._id} 
              className="w-full mb-4"  // Ensure it takes full width
            >
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex flex-column">
                      <h5 className="card-title">{evaluation1.title}</h5>
                      <p className="card-text">
                        <strong>Topic:</strong> {evaluation1.topic}
                      </p>
                      <p className="card-text">
                        <strong>Group:</strong> {evaluation1.group}
                      </p>
                      <p className="card-text">
                        <strong>Created On:</strong> {new Date(evaluation1.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="d-flex flex-column justify-content-between align-items-end">
                      <p className="card-text">
                        <strong>Status:</strong>
                        <span className={`badge ${evaluation1.status === 'active' ? 'bg-success' : evaluation1.status === 'draft' ? 'bg-warning' : evaluation1.status === 'completed' ? 'bg-primary' : 'bg-secondary'}`}>
                          {evaluation1.status.charAt(0).toUpperCase() + evaluation1.status.slice(1)}
                        </span>
                      </p>
                      <button 
                        className="btn btn-primary mt-2"
                        onClick={() => handleButtonClick(evaluation1.status, evaluation1._id)}
                      >
                        {evaluation1.status === 'draft' && 'Schedule Now'}
                        {evaluation1.status === 'active' && 'Wait until time is completed'}
                        {evaluation1.status === 'completed' && 'Create Evaluations'}
                        {evaluation1.status === 'evaluated' && 'See Results'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EvaluationsList;
