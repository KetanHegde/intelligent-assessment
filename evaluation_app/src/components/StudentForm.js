import React, { useState } from "react";
import ToggleButton from "./ToggleButton";

const StudentForm = () => {
  const [toggleState, setToggleState] = useState(false);
  const [message, setMessage] = useState("");

  const handleToggle = (state) => {
    setToggleState(state);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    const response = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: inputValues.USN, // Use the USN as the username
        name: inputValues.Name,
        password: "1234", // Use Email as the password or generate a password
        role: "student", // Set role as student
        email : inputValues.Email,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setMessage("Registration successful");
      setInputValues({
        USN: "",
        Name: "",
        Email: "",
      });
    } else {
      setMessage(`Registration failed: ${data.message}`);
    }

    try {
      const response = await fetch("http://localhost:5000/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ USN: inputValues.USN, Name: inputValues.Name }),
      });
    
      const data = await response.json();
    
      if (response.ok) {
        setMessage("Student added successfully!");
      } else {
        setMessage(data.message || "Failed to add student.");
      }
    } catch (error) {
      setMessage("Error occurred while adding student.");
      console.error("Error:", error);
    }    

  };

  return (
    <>

      <h2>Add Students</h2>
      <div
        className="card"
        style={{
          maxWidth: "600px",
          fontFamily: "'Poppins', sans-serif",
          background: "#fff",
          padding: "30px",
          borderRadius: "10px",
          border: "1.5px solid rgba(0,0,0,0.175)",
          color: "#333",
        }}
      >
        <div className="radio-group">
          <ToggleButton onToggle={handleToggle}></ToggleButton>
        </div>

        {!toggleState ? (
          <>
          <form onSubmit={handleSubmit}>
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
                    top:
                      focusedFields.USN || inputValues.USN ? "-10px" : "13px",
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
                    top:
                      focusedFields.Name || inputValues.Name ? "-10px" : "13px",
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
                    top:
                      focusedFields.Email || inputValues.Email
                        ? "-10px"
                        : "13px",
                  }}
                >
                  Email
                </label>
              </div>
            </div>
            <div style={{ marginBottom: "15px", textAlign: "center" }}>
              <button
                type="submit"
                style={styles.button}
                className="btn btn-primary"
              >
                Register
              </button>
            </div>
          </form>
{message && (
  <div className="text-center mb-4">
    {message}
  </div>
)}</>
        ) : (
          <form>
            <div style={{ marginBottom: "15px" }}>
              <label
                htmlFor="file"
                style={{
                  ...styles.label,
                  position: "relative", // Ensure the label position is relative, not absolute
                  marginBottom: "10px", // Add margin for spacing between the label and input field
                  left: "0px",
                  backgroundColor: "#fff",
                }}
              >
                Instructions for uploading a CSV file:
              </label>
              <div className="input-group mb-3">
                <input
                  style={{ border: "1px solid grey" }}
                  accept=".xlsx, .csv, .xls, .xlsb, .xltx, .xltm, .xlsm"
                  type="file"
                  className="form-control"
                  id="inputGroupFile02"
                />
              </div>
            </div>
            <div style={{ marginBottom: "15px", textAlign: "center" }}>
              <button
                type="submit"
                style={{ ...styles.uploadButton, backgroundColor: "#4CAF50" }}
              >
                Upload File
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

const styles = {
  label: (focused) => ({
    display: "block",
    fontWeight: "bold",
    color: focused ? "#1f6feb" : "#555", // Change label color when input is focused
    marginBottom: "5px",
    position: "absolute",
    left: "10px",
    backgroundColor: "#f9f9f9",
    padding: "0 5px",
    fontSize: focused ? "17px" : "13px",
    transition: "top 0.3s ease, color 0.3s ease", // Smooth color transition
    fontFamily: "sans-serif",
  }),
  input: (focused) => ({
    width: "100%",
    padding: "10px 10px", // Equal padding for top and bottom
    border: `${focused ? "2px" : "1px"} solid ${focused ? "#1f6feb" : "grey"}`, // Border color changes on focus
    borderRadius: "5px",
    fontSize: "16px",
    outline: "none",
    transition: "box-shadow 0.3s ease", // Smooth transition for box shadow
    fontFamily: "sans-serif",
  }),
  button: {
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
