const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function (req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
  return res.status(401).json({ message: "Invalid token format" });
}

  try {
    const decoded = jwt.verify(token, process.env.SUPER_SECRET);
    const user = await User.findById(decoded.userId).select("_id username email role");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.userId = user._id;
    req.user = user;
    req.userRole = user.role;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};