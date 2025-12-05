const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const linkRoutes = require("./routes/links");
const logoRoutes = require("./routes/logo");
const roleRoutes = require("./routes/roles");
const Role = require("./models/Role");
const logRoutes = require("./routes/logs");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const defaultRoles = [
  { name: "Admin", slug: "admin", accent: "#fbbf24", assignable: true },
  { name: "Marketer", slug: "marketer", accent: "#c084fc", assignable: true },
  { name: "HR", slug: "hr", accent: "#34d399", assignable: true },
  { name: "Employee", slug: "employee", accent: "#60a5fa", assignable: true },
  { name: "Other", slug: "other", accent: "#9ca3af", assignable: false },
];

async function seedRoles() {
  try {
    for (const role of defaultRoles) {
      const existing = await Role.findOne({ slug: role.slug });
      if (!existing) {
        await Role.create(role);
      }
    }
  } catch (error) {
    console.error("Failed to seed roles", error);
  }
}

mongoose
  .connect(
    process.env.MONGODB_URI ||
      "mongodb+srv://SLOG:aVTJUIBvSraMwARc@cluster0.ii34a.mongodb.net/quickaccess",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(async () => {
    console.log("MongoDB Connected");
    await seedRoles();
  })
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/links", linkRoutes);
app.use("/api/logo", logoRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/logs", logRoutes);

app.get("/test", (_, res) => {
  res.send("Server is Running");
});

app.listen(PORT, () => {
  console.log(`Server is Running on ${PORT}`);
});