const jwt = require("jsonwebtoken");
require('dotenv').config();

// Middleware to authenticate the JWT token
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Expecting "Bearer <token>"
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use the same secret key used for signing the token
    req.user = decoded; // Attach the user info (from the token) to the req object
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = authenticate;
