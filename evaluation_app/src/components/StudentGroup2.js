import React, { useState } from "react";
import axios from "axios";

const GroupManagement = () => {
  const [searchGroupName, setSearchGroupName] = useState("");
  const [group, setGroup] = useState(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [availableStudents, setAvailableStudents] = useState([]);
  const [message, setMessage] = useState("");
  const [errorStatus, setErrorStatus] = useState(false);

  // Searching for a group
const handleSearchGroup = async () => {
  if (!searchGroupName) {
    setMessage("Please enter a group name");
    setErrorStatus(true);
    return;
  }

  try {
    const response = await axios.get("http://localhost:5000/groups/search", {
      params: { groupName: searchGroupName },
    });
    setErrorStatus(false);
    setMessage("");
    setGroup(response.data); // Ensure response.data is a valid group
  } catch (error) {
    if (error.response?.status === 404) {
      setMessage("Group not found");
    } else {
      setMessage(error.response?.data?.error || "Error searching group");
    }
    setErrorStatus(true);
  }
};

  // Rename group
  const handleRenameGroup = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5000/groups/${group._id}/rename`,
        {
          newGroupName,
        }
      );
      setGroup(response.data);
      setNewGroupName("");
      setMessage("");
    } catch (error) {
      setMessage(error.response?.data?.error || "Error renaming group");
      setErrorStatus(true);
    }
  };

  // Search available students to add
  const handleStudentSearch = async () => {
    try {
      const response = await axios.get("http://localhost:5000/students", {
        params: { q: studentSearchQuery },
      });

      // Filter out already added students
      const filteredStudents = response.data.filter(
        (student) =>
          !group.students.some(
            (groupStudent) => groupStudent._id === student._id
          )
      );

      setAvailableStudents(filteredStudents);
      setMessage("");
    } catch (error) {
      setMessage("Error searching students");
      setErrorStatus(true);
    }
  };

  // Add students to group
  const handleAddStudents = async (studentIds) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/groups/${group._id}/add-students`,
        {
          studentIds,
        }
      );
      setGroup(response.data);
      setAvailableStudents([]);
      setMessage("");
      setStudentSearchQuery("");
    } catch (error) {
      setMessage(error.response?.data?.error || "Error adding students");
      setErrorStatus(true);
    }
  };


  // Remove student from group
const handleRemoveStudent = async (studentId) => {
  if (!group || !group._id) {
    setMessage("Group not found or invalid group");
    setErrorStatus(true);
    return;
  }

  try {
    const response = await axios.delete(
      `http://localhost:5000/groups/${group._id}/students/${studentId}`
    );
    setGroup(response.data);
    setMessage("");
  } catch (error) {
    setMessage(error.response?.data?.error || "Error removing student");
    setErrorStatus(true);
  }
};


  // Delete entire group
  const handleDeleteGroup = async () => {
    try {
      await axios.delete(`http://localhost:5000/groups/${group._id}`);
      setMessage("Group deleted successfully");
      setErrorStatus(false);
      setGroup(null);
    } catch (error) {
      setMessage(error.response?.data?.error || "Error deleting group");
      setErrorStatus(true);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto mt-4">
      <h2 className="text-2xl font-bold mb-4">Manage Group</h2>

      {/* Group Search */}
      <div
        className="mb-4 flex"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <input
          type="text"
          placeholder="Enter Group Name"
          value={searchGroupName}
          onChange={(e) => setSearchGroupName(e.target.value)}
          className="inpFocus1"
        />
        <button
          onClick={handleSearchGroup}
          className="searchBtn bg-blue-500 text-white hover:bg-blue-600"
        >
          Search
        </button>
      </div>

      {message && (
        <p
          style={{
            textAlign: "center",
            color: errorStatus ? "red" : "green",
          }}
        >
          {message}
        </p>
      )}

      {/* Group Details */}
      {group && !errorStatus && (
        <div className="bg-white card rounded p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">{group.groupName}</h3>
            <button
              onClick={handleDeleteGroup}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Delete Group
            </button>
          </div>

          <div className="mb-4 flex">
            <input
              type="text"
              placeholder="New Group Name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="flex-grow p-2 inpFocus4"
            />
            <button
              onClick={handleRenameGroup}
              className="bg-green-500 text-white p-2 rounded-r searchBtn"
            >
              Rename Group
            </button>
          </div>

          {/* Current Students */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Group Members</h4>
            <div className="overflow-auto" style={{ maxHeight: "24vh" }}>
              {group.students.map((student) => (
                <div
                  key={student._id}
                  className="flex justify-between items-center p-2 border-b"
                >
                  <div>
                    <span>{student.Name}</span>
                    <span className="text-gray-500 ml-2">{student.USN}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveStudent(student._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add Students */}
          <div className="mb-4 flex">
            <input
              type="text"
              placeholder="Search students to add"
              value={studentSearchQuery}
              onChange={(e) => setStudentSearchQuery(e.target.value)}
              className="flex-grow p-2 border rounded-l"
            />
            <button
              onClick={handleStudentSearch}
              className="bg-blue-500 text-white p-2 rounded-r"
            >
              Search
            </button>
          </div>

          {/* Available Students to Add */}
          {availableStudents.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Available Students</h4>
              {availableStudents.map((student) => (
                <div
                  key={student._id}
                  className="flex justify-between items-center p-2 border-b"
                >
                  <div>
                    <span>{student.Name}</span>
                    <span className="text-gray-500 ml-2">{student.USN}</span>
                  </div>
                  <button
                    onClick={() => handleAddStudents([student._id])}
                    className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupManagement;

