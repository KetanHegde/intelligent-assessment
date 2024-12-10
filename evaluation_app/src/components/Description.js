import React, { useState } from "react";
import "../css/Description.css";
import ToggleButton from "./ToggleButton";

function Description({ title, setShowDesc }) {
  const [toggleState, setToggleState] = useState(false);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [statusColor, setMessageColor] = useState(false);
  const [message, setMessage] = useState("");
  const [isShowBtn, setShowBtn] = useState(true);

  
  const handleToggle = (state) => {
    setToggleState(state);
    setMessage("");
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!description && !file) {
      setMessage("Please provide a description or upload a file.");
      setMessageColor(true);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    if (toggleState) {
      formData.append("file", file);
    } else {
      formData.append("description", description);
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/save-description",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        setShowBtn(false);
        setMessage("Description saved successfully!");
        setMessageColor(false);
        setTimeout(() => {
          setMessage("Redirecting back...");
          setTimeout(() => {
            setShowDesc();
          }, 5000); 
        }, 5000);
      } else {
        const result = await response.json();
        setMessage(result.message || "Failed to save the description.");
        setMessageColor(true);
      }
    } catch (error) {
      console.error("Error saving description:", error);
      setMessage("An error occurred. Please try again.");
      setMessageColor(true);
    }
  };

  return (
    <div className="description-content">
      <form onSubmit={handleSubmit}>
        <h2>Provide Your Input</h2>
        <div className="radio-group">
          <ToggleButton onToggle={handleToggle}></ToggleButton>
        </div>

        {!toggleState ? (
          <textarea
            className="textarea"
            placeholder="Type or Paste the Text Here"
            rows="8"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        ) : (
          <div
            className="input-group mb-3"
            style={{ width: "70%", justifySelf: "center" }}
          >
            <input
              style={{ border: "1px solid grey" }}
              type="file"
              name = "file"
              accept=".pdf,.txt"
              className="form-control"
              id="file-inp"
              onChange={handleFileChange}
            />
          </div>
        )}

        {message && (
          <p className="message" style={{ textAlign: "center", color: statusColor ? "red" : "green"}}>
            {message}
          </p>
        )}
        <button type="submit" className="submit-button mt-3" style={{display: isShowBtn ? "initial" : "none"}}>
          Submit
        </button>
      </form>
    </div>
  );
}

export default Description;
