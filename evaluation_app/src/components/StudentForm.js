import React, { useState } from "react";

const StudentForm = () => {
  const [uploadMode, setUploadMode] = useState(false);
  const [inputValues, setInputValues] = useState({
    USN: "",
    Name: "",
    Email: "",
  });
  const [focusedFields, setFocusedFields] = useState({
    USN: false,
    Name: false,
    Email: false,
  });

  const toggleUploadMode = () => {
    setUploadMode(!uploadMode);
  };

  const handleFieldFocus = (field) => {
    setFocusedFields((prevState) => ({
      ...prevState,
      [field]: true,
    }));
  };

  const handleFieldBlur = (field) => {
    setFocusedFields((prevState) => ({
      ...prevState,
      [field]: false,
    }));
  };

  const handleInputChange = (field, value) => {
    setInputValues((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  return (
    <div 
    className="card"
      style={{
        margin: "50px auto",
        maxWidth: "600px",
        fontFamily: "'Poppins', sans-serif",
        background: "#fff",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.1)",
        color: "#333",
      }}
    >
      <img
        src="https://img.freepik.com/free-vector/forms-concept-illustration_114360-4797.jpg?w=900&t=st=1689487826~exp=1689488426~hmac=94b9002ef356d64e1bbc3d71607d751176891502865312df69efad66c23a4697"
        alt="Student Registration"
        className="img-fluid"
        style={{
          width: "100%",
          height: "auto",
          objectFit: "cover",
          borderRadius: "10px 10px 0 0",
          // fontFamily: 
        }}
      />

      <button
        onClick={toggleUploadMode}
        style={{
          backgroundColor: "#3F51B5",
          color: "white",
          border: "none",
          borderRadius: "5px",
          padding: "10px 15px",
          cursor: "pointer",
          marginBottom: "20px",
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {uploadMode ? "Switch to Single Registration" : "Switch to CSV Upload"}
      </button>

      {!uploadMode ? (
        <form>
          <div style={{ marginBottom: "30px" }}>
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                id="USN"
                name="USN"
                required
                value={inputValues.USN}
                onChange={(e) => handleInputChange("USN", e.target.value)}
                onFocus={() => handleFieldFocus("USN")}
                onBlur={() => handleFieldBlur("USN")}
                style={styles.input(focusedFields.USN)}
              />
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMOO03AB_jIaQBY9zLM5iV_sgDNp61k0Kj5mF-G_hPSIeV-4GMe2RgDaWwM-b8MMYF5Co&usqp=CAU"
                alt="Name"
                style={{
                  position: "absolute",
                  right: "14px",
                  width: "30px",
                  height: "25px",
                }}
              />
              <label
                htmlFor="USN"
                style={{
                  ...styles.label(focusedFields.USN),
                  top: focusedFields.USN || inputValues.USN ? "-10px" : "13px",
                }}
              >
                USN
              </label>
            </div>
          </div>
          <div style={{ marginBottom: "30px" }}>
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                id="Name"
                name="Name"
                required
                value={inputValues.Name}
                onChange={(e) => handleInputChange("Name", e.target.value)}
                onFocus={() => handleFieldFocus("Name")}
                onBlur={() => handleFieldBlur("Name")}
                style={styles.input(focusedFields.Name)}
              />
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-VjjZUQp746IOlP5i2sJgEhoCekRodZlPQdQvqJiAVdFoKY5XOrcEY2EkzpUt1igWB4k&usqp=CAU"
                alt="Registration Number"
                style={{
                  position: "absolute",
                  right: "15px",
                  width: "30px",
                  height: "30px",
                }}
              />
              <label
                htmlFor="Name"
                style={{
                  ...styles.label(focusedFields.Name),
                  top: focusedFields.Name || inputValues.Name ? "-10px" : "13px",
                }}
              >
                Name
              </label>
            </div>
          </div>
          <div style={{ marginBottom: "30px" }}>
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                id="Email"
                name="Email"
                required
                value={inputValues.Email}
                onChange={(e) => handleInputChange("Email", e.target.value)}
                onFocus={() => handleFieldFocus("Email")}
                onBlur={() => handleFieldBlur("Email")}
                style={styles.input(focusedFields.Email)}
              />
              <img
                src="https://cdn.icon-icons.com/icons2/2437/PNG/512/email_envelope_icon_148215.png"
                alt="Course"
                style={{
                  position: "absolute",
                  right: "15px",
                  width: "30px",
                  height: "30px",
                  backgroundColor: "transparent",
                }}
              />
              <label
                htmlFor="Email"
                style={{
                  ...styles.label(focusedFields.Email),
                  top: focusedFields.Email || inputValues.Email ? "-10px" : "13px",
                }}
              >
                Email
              </label>
            </div>
          </div>
          <div style={{ marginBottom: "15px", textAlign: "center" }}>
            <button type="submit" style={styles.button}>
              Register
            </button>
          </div>
        </form>
      ) : (
        <form>
          <div style={{ marginBottom: "15px" }}>
            <label
              htmlFor="file"
              style={{
                ...styles.label,
                position: "relative", // Ensure the label position is relative, not absolute
                marginBottom: "10px",  // Add margin for spacing between the label and input field
                left: "0px",
                backgroundColor: "#fff",
              }}
            >
              Instructions for uploding a CSV file:
            </label><br></br>
            <input
              type="file"
              id="file"
              name="file"
              required
              style={{ ...styles.input, padding: "10px", width: "96%", border: "1px solid rgb(204, 204, 204)", borderRadius: "5px", fontSize: "16px", backgroundColor: "rgb(249, 249, 249)", transition: "0.3s", marginTop: "5px"}}
            />
          </div>
          <div style={{ marginBottom: "15px", textAlign: "center" }}>
            <button type="submit" style={{...styles.uploadButton, backgroundColor: "#4CAF50"}}>
              Upload File
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

const styles = {
  label: (focused) => ({
    display: "block",
    fontWeight: "bold",
    color: focused ? "#4CAF50" : "#555", // Change label color when input is focused
    marginBottom: "5px",
    position: "absolute",
    left: "10px",
    backgroundColor: "#f9f9f9",
    padding: "0 5px",
    fontSize: "12px",
    transition: "top 0.3s ease, color 0.3s ease", // Smooth color transition
    fontFamily: "sans-serif",
  }),
  input: (focused) => ({
    width: "100%",
    padding: "10px 10px", // Equal padding for top and bottom
    border: `1px solid ${focused ? "#4CAF50" : "#ccc"}`, // Border color changes on focus
    borderRadius: "5px",
    fontSize: "16px",
    backgroundColor: "#f9f9f9",
    outline: "none",
    transition: "box-shadow 0.3s ease", // Smooth transition for box shadow
    boxShadow: focused ? "0 0 5px rgba(76, 175, 80, 0.7)" : "none", // Add shadow on focus
    fontFamily: "sans-serif",
  }),
  button: {
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
  uploadButton: {
    backgroundColor: "#3f51b5",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default StudentForm;