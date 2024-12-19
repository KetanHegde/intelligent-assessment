const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../Models/User");
const router = express.Router();
require("dotenv").config();

// Register route
router.post("/register", async (req, res) => {
  const { username, name, password, role, email } = req.body;
  try {
    const userExists = await User.findOne({ username });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const user = new User({ username, name, password, role, email });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role, name:user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    
    res.status(200).json({ token, role: user.role, username: user.username, name:user.name }); // Include role in the response
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
