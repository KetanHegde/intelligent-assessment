import React from "react";
import MultiSelectStudentSelector from "./StudentGroup1"; // Adjust the import path as necessary
import GroupManagement from "./StudentGroup2"; // Adjust the import path as necessary
import '../css/StudentGroup.css';
const StudentGroupManager = () => {
  return (
    <div className="flex flex-col md:flex-row p-6 max-w-6xl mx-auto">
      {/* MultiSelectStudentSelector Component */}
      <div className="flex-1 mb-4 md:mr-4">
        <MultiSelectStudentSelector />
      </div>

      {/* GroupManagement Component */}
      <div className="flex-1 mb-4 md:ml-4">
        <GroupManagement />
      </div>
    </div>
  );
};

export default StudentGroupManager;