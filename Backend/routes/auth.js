const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");
const Log = require("../models/Log");

const router = express.Router();

async function getAssignableRoleSlugs() {
  const roles = await Role.find({ assignable: true }).lean();
  if (!roles.length) {
    return ["admin", "marketer", "hr", "employee"];
  }
  return roles.map((role) => role.slug);
}

// Register (for initial setup - can be removed later)
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const allowedRoles = await getAssignableRoleSlugs();
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = new User({ username, email, password, role });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    // Log the login action
    try {
      const log = new Log({
        userId: user._id,
        username: user.username,
        role: user.role,
        action: "login",
        details: `User logged in successfully`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'] || ""
      });
      await log.save();
    } catch (logError) {
      console.error("Failed to create login log:", logError);
      // Don't fail the login if logging fails
    }

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

router.get("/verify", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

// Admin-only: Register new user
router.post("/register-user", verifyToken, async (req, res) => {
  try {
    const { role: userRole } = req.user;
    
    // Only admin can register users
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Only admin can register users" });
    }

    const { username, email, password, role } = req.body;

    const allowedRoles = await getAssignableRoleSlugs();
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    
    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const validRoles = ["admin", "employee", "marketer", "hr"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({ username, email, password, role });
    await user.save();

    // Log user registration
    try {
      const log = new Log({
        userId: req.user.userId, // Admin who created the user
        username: req.user.username || "admin",
        role: req.user.role,
        action: "user_registered",
        details: `Created new user: ${username} (${role})`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'] || ""
      });
      await log.save();
    } catch (logError) {
      console.error("Failed to create registration log:", logError);
    }

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin-only: Get all users
router.get("/users", verifyToken, async (req, res) => {
  try {
    const { role: userRole } = req.user;
    
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Only admin can view users" });
    }

    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Logout (with logging)
router.post("/logout", verifyToken, async (req, res) => {
  try {
    // Log the logout action
    try {
      const log = new Log({
        userId: req.user.userId,
        username: req.user.username || "Unknown",
        role: req.user.role,
        action: "logout",
        details: "User logged out",
        ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'] || ""
      });
      await log.save();
    } catch (logError) {
      console.error("Failed to create logout log:", logError);
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
module.exports.verifyToken = verifyToken;

