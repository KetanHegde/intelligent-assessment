// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/evaluation_db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Location Schema and Model
const titleSchema = new mongoose.Schema({
  name: String,
});
const Location = mongoose.model("Titles", titleSchema);


const studentSchema = new mongoose.Schema({
  USN: String,
  Name: String,
  Email: String,
});
const Student = mongoose.model("Students", studentSchema);


// API to get matching students
app.get("/students", async (req, res) => {
  const query = req.query.q; // User's search query
  if (!query) {
    return res.json([]);
  }

  const students = await Student.find({ 
    $or: [
      { Name: { $regex: query, $options: "i" } },
      { USN: { $regex: query, $options: "i" } },
      { Email: { $regex: query, $options: "i" } }
    ]
  }).limit(10);
  res.json(students);
});

// API to get matching locations
app.get("/locations", async (req, res) => {
  const query = req.query.q; // User's search query
  if (!query) {
    return res.json([]);
  }

  const locations = await Location.find({ name: { $regex: query, $options: "i" } }).limit(10);
  res.json(locations);
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
