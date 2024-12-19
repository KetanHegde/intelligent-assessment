import React from "react";
import CreateExam from "./CreateExam"; // Adjust the import path as necessary
import ManageExams from "./ManageExams"; // Adjust the import path as necessary
const ExamManager = () => {
  return (
    <div className="flex flex-col md:flex-row p-6 max-w-6xl mx-auto">
      {/* MultiSelectStudentSelector Component */}
      <div className="flex-1 mb-4 md:mr-4">
        <CreateExam />
      </div>

      {/* GroupManagement Component */}
      <div className="flex-1 mb-4 md:ml-4">
        <ManageExams/>
      </div>
    </div>
  );
};

export default ExamManager;