import React from "react";
import StudentForm from "./StudentForm"; // Adjust the import path as necessary
import ManageStudent from "./ManageStudent"; // Adjust the import path as necessary
import '../css/StudentGroup.css';
const StudentGroupManager = () => {
  return (
    <div className="flex flex-col md:flex-row p-6 max-w-6xl mx-auto">
      {/* MultiSelectStudentSelector Component */}
      <div className="flex-1 mb-4 md:mr-4">
        <StudentForm/>
      </div>

      {/* GroupManagement Component */}
      <div className="flex-1 mb-4 md:ml-4">
        <ManageStudent />
      </div>
    </div>
  );
};

export default StudentGroupManager;