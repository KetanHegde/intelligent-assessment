import React, { useState } from "react";
import ToggleButton from "./ToggleButton";
function DescriptionContent() {
    const [toggleState, setToggleState] = useState(false);

    const handleToggle = (state) => {
      setToggleState(state);
      console.log("Toggle State:", state); 
    };

  return (
    <div className="description-content" style={styles.container}>
      <h2 style={styles.heading}>Provide Your Input</h2>
      <div style={styles.radioGroup}>
        <ToggleButton onToggle={handleToggle}></ToggleButton>
      </div>

      {toggleState === false ? (
        <textarea
          style={styles.textarea}
          placeholder="Enter your description here..."
          rows="8"
        ></textarea>
      ) : (
        <div style={styles.fileUpload}>
          <input
            type="file"
            id="file-input"
            accept=".pdf,.txt"
            style={styles.fileInput}
          />
          <label htmlFor="file-input" style={styles.label}>
            Upload File
          </label>
        </div>
      )}

      <button style={styles.button}>Submit</button>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    width: "50%",
    margin: "0 auto",
    textAlign: "center",
    marginTop: "10vh",
  },
  heading: {
    color: "#333",
    marginBottom: "15px",
  },
  radioGroup: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "15px",
  },
  radioLabel: {
    marginRight: "10px",
    fontSize: "14px",
    cursor: "pointer",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    resize: "none",
    outline: "none",
    fontSize: "14px",
    marginBottom: "15px",
  },
  fileUpload: {
    marginBottom: "15px",
  },
  fileInput: {
    display: "none",
  },
  label: {
    backgroundColor: "#007BFF",
    color: "#fff",
    padding: "10px 15px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
  },
  button: {
    backgroundColor: "#28a745",
    color: "#fff",
    padding: "10px 15px",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default DescriptionContent;
