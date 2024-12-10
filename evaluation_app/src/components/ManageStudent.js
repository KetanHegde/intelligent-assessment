import React, { useState } from 'react';
import axios from 'axios';
import '../css/StudentGroup.css';
const StudentSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [editingStudentUSN, setEditingStudentUSN] = useState(null);
  const [updatedStudent, setUpdatedStudent] = useState({});

  // Fetch students based on search query
  const handleSearch = async () => {
    try {
      const response = await axios.get("http://localhost:5000/students", {
        params: { q: searchQuery },
      });
      setStudents(response.data);
      console.log(response);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  // Update student details
  const handleEditSave = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/students/${updatedStudent.USN}`,
        updatedStudent
      );
      alert('Student details updated successfully');
      console.log(response);
      setEditingStudentUSN(null); // Collapse the expanded form
      handleSearch(); // Refresh the list
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Failed to update student details');
    }
  };

  // Delete student
  const handleDelete = async (USN) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/students/${USN}`);
      alert('Student deleted successfully');
      handleSearch();
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Failed to delete student');
    }
  };

  // Handle editing student
  const handleEditClick = (student) => {
    setEditingStudentUSN(student.USN);
    setUpdatedStudent({ ...student });
  };

  return (
    <><h2>Manage Students</h2>
    <div
      className="card"
      style={{
        maxWidth: '600px',
        fontFamily: "'Poppins', sans-serif",
        background: '#fff',
        padding: '30px',
        borderRadius: '10px',
        border: '1.5px solid rgba(0, 0, 0, 0.176)',
      }}
    >
      <div style={{ marginBottom: '20px' }}>
        <input
        className='inpFocus'
          type="text"
          placeholder="Search by Name or USN"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            marginBottom: '10px',
          }}
        />
        <button
        className="btn btn-primary"
          onClick={handleSearch}
          style={{
            width: '100%',
            padding: '10px',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          Search Students
        </button>
      </div>

      {students.length > 0 && (
        <div>
          {students.map((student) => (
            <div
              key={student.USN}
              style={{
                padding: '10px 15px',
                border: '1px solid #eee',
                borderRadius: '5px',
                marginBottom: '10px',
                backgroundColor: '#f9f9f9',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>{student.Name}</strong>
                  <div style={{marginBottom:"0"}}>{student.USN}</div>
                </div>
                <div style={{display:"flex", justifyContent:"center", alignItems:"center"
                }}>
                  <button
                    onClick={() => handleEditClick(student)}
                    style={{
                      backgroundColor: '#FFC107',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '5px',
                      marginRight: '10px',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(student.USN)}
                    style={{
                      backgroundColor: '#F44336',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '5px',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              {editingStudentUSN === student.USN && (
                <div style={{ marginTop: '10px' }}>
                  <input
                    type="text"
                    placeholder="Name"
                    value={updatedStudent.Name}
                    onChange={(e) =>
                      setUpdatedStudent({ ...updatedStudent, Name: e.target.value })
                    }
                    style={styles.input}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={updatedStudent.Email}
                    onChange={(e) =>
                      setUpdatedStudent({ ...updatedStudent, Email: e.target.value })
                    }
                    style={styles.input}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button
                      onClick={handleEditSave}
                      style={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '5px',
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingStudentUSN(null)}
                      style={{
                        backgroundColor: '#9E9E9E',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '5px',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
};

const styles = {
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
};

export default StudentSearch;
