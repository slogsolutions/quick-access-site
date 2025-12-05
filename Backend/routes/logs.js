const express = require("express");
const Log = require("../models/Log");
const User = require("../models/User");
const { verifyToken } = require("./auth");

const router = express.Router();

// Middleware to log actions (to be added to existing routes)
const createLog = async (req, action, details = "") => {
  try {
    if (!req.user) return;
    
    const log = new Log({
      userId: req.user.userId,
      username: req.user.username || "Unknown",
      role: req.user.role,
      action,
      details,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'] || ""
    });
    
    await log.save();
    console.log(`Log created: ${action} by ${req.user.username}`);
  } catch (error) {
    console.error("Failed to create log:", error);
  }
};

// Admin only: Get all users with their latest activity
router.get("/users", verifyToken, async (req, res) => {
  try {
    const { role: userRole } = req.user;
    
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Only admin can view logs" });
    }

    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
    
    // Get latest activity for each user
    const usersWithActivity = await Promise.all(
      users.map(async (user) => {
        const latestLog = await Log.findOne({ userId: user._id })
          .sort({ timestamp: -1 })
          .select("action timestamp")
          .lean();
        
        return {
          ...user.toObject(),
          lastActivity: latestLog?.timestamp || user.createdAt,
          lastAction: latestLog?.action || "No activity"
        };
      })
    );

    res.json(usersWithActivity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin only: Get recent logs (paginated)
router.get("/recent", verifyToken, async (req, res) => {
  try {
    const { role: userRole } = req.user;
    
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Only admin can view logs" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const logs = await Log.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "username email role")
      .lean();

    const total = await Log.countDocuments();

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin only: Get logs for specific user
router.get("/user/:userId", verifyToken, async (req, res) => {
  try {
    const { role: userRole } = req.user;
    
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Only admin can view logs" });
    }

    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const logs = await Log.find({ userId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Log.countDocuments({ userId });

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
module.exports.createLog = createLog;