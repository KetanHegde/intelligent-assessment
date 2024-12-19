const jwt = require("jsonwebtoken");
require('dotenv').config();

const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).send("Access Denied: No Token Provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the payload to req.user
    next();
  } catch (err) {
    res.status(400).send("Invalid Token");
  }
};

module.exports = authenticate;
