const express = require("express");
const Role = require("../models/Role");
const { verifyToken } = require("./auth");

const router = express.Router();

const slugify = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Public - list all roles
router.get("/", async (_req, res) => {
  try {
    const roles = await Role.find().sort({ assignable: -1, name: 1 });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin - create new role
router.post("/", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can create roles" });
    }

    const { name, accent } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Role name is required" });
    }

    const slug = slugify(name);
    if (!slug || slug === "other") {
      return res.status(400).json({ message: "Invalid role name" });
    }

    const existing = await Role.findOne({ slug });
    if (existing) {
      return res.status(409).json({ message: "Role already exists" });
    }

    const role = await Role.create({
      name: name.trim(),
      slug,
      accent: accent || "#6366f1",
      assignable: true,
    });

    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

