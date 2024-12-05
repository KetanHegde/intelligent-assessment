import React, { useState } from "react";

function ToggleButton({ onToggle }) {
  const [isToggled, setIsToggled] = useState(false);

  const toggleHandler = () => {
    const newState = !isToggled;
    setIsToggled(newState);
    onToggle(newState); // Pass the new state to the parent
  };

  return (
    <div style={styles.container}>
      <div
        style={{
          ...styles.toggleSwitch,
          backgroundColor: isToggled ? "#4CAF50" : "#ccc",
        }}
        onClick={toggleHandler}
      ><p style={{...styles.statusText}}>Text</p>
      <p style={{...styles.statusText}}>File</p>
        <div
          style={{
            ...styles.toggleKnob,
            transform: isToggled ? "translateX(97%)" : "translateX(0)",
          }}
        ></div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    marginTop: "50px",
    width:"80%",
  },
  toggleSwitch: {
    width: "60%",
    height: "39px",
    borderRadius: "14px",
    position: "relative",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    display:"flex",
    alignItems:"center",
    justifyContent:"space-around",
  },
  toggleKnob: {
    
    width: "50%",
    height: "35px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    position: "absolute",
    top: "2px",
    left: "2px",
    transition: "transform 0.3s ease",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
  },
  statusText: {
    marginTop:"10px",
    zIndex:10,
    fontSize:"100%",
    fontWeight:"600",
  },
};

export default ToggleButton;
