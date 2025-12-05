const express = require("express");
const Link = require("../models/Link");
const Role = require("../models/Role");
const Log = require("../models/Log");
const { verifyToken } = require("./auth");

const router = express.Router();

async function getAllowedCategories() {
  const roles = await Role.find().lean();
  const assignable = roles.filter((role) => role.assignable).map((role) => role.slug);
  const others = roles.some((role) => role.slug === "other") ? ["other"] : [];
  return [...new Set([...assignable, ...others])];
}

// Get all links based on user role
router.get("/", verifyToken, async (req, res) => {
  try {
    const { role } = req.user;
    const allowedCategories = await getAllowedCategories();
    const categories =
      role === "admin" ? allowedCategories : [role, ...allowedCategories.filter((cat) => cat === "other")];

    const links = await Link.find({ category: { $in: categories } })
      .populate("createdBy", "username")
      .sort({ createdAt: -1 });

    res.json(links);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new link
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, url, description, logo, category } = req.body;
    const { userId, role } = req.user;

    const allowedCategories = await getAllowedCategories();
    const canManage = role === "admin" ? allowedCategories : [role, "other"];

    if (!canManage.includes(category)) {
      return res.status(403).json({
        message: "You don't have permission to add links to this category",
      });
    }

    const link = new Link({
      title,
      url,
      description,
      logo: logo || "",
      category,
      createdBy: userId
    });

    await link.save();
    const populatedLink = await Link.findById(link._id).populate("createdBy", "username");

    // Log link creation
    try {
      const log = new Log({
        userId,
        username: req.user.username || "Unknown",
        role,
        action: "link_added",
        details: `Added link: ${title} (${url}) to category: ${category}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'] || ""
      });
      await log.save();
    } catch (logError) {
      console.error("Failed to create link log:", logError);
    }

    res.status(201).json(populatedLink);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update link
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url, description, logo, category } = req.body;
    const { userId, role } = req.user;

    const link = await Link.findById(id);
    if (!link) {
      return res.status(404).json({ message: "Link not found" });
    }

    // Check permissions
    if (link.createdBy.toString() !== userId && role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (category) {
      const allowedCategories = await getAllowedCategories();
      const canManage = role === "admin" ? allowedCategories : [role, "other"];
      if (!canManage.includes(category)) {
        return res.status(403).json({
          message: "You don't have permission to set this category",
        });
      }
    }

    link.title = title || link.title;
    link.url = url || link.url;
    link.description = description || link.description;
    link.logo = logo || link.logo;
    if (category) link.category = category;

    await link.save();
    const updatedLink = await Link.findById(id).populate("createdBy", "username");

    res.json(updatedLink);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete link
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;

    const link = await Link.findById(id);
    if (!link) {
      return res.status(404).json({ message: "Link not found" });
    }

    if (link.createdBy.toString() !== userId && role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Log link deletion before deleting
    try {
      const log = new Log({
        userId,
        username: req.user.username || "Unknown",
        role,
        action: "link_deleted",
        details: `Deleted link: ${link.title} (${link.url})`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'] || ""
      });
      await log.save();
    } catch (logError) {
      console.error("Failed to create deletion log:", logError);
    }

    await Link.findByIdAndDelete(id);
    res.json({ message: "Link deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;

