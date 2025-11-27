const mongoose = require("mongoose");
const User = require("../models/User"); // adjust path if needed
require("dotenv").config();

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://SLOG:aVTJUIBvSraMwARc@cluster0.ii34a.mongodb.net/quickaccess", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected");

    const adminExists = await User.findOne({ email: "admin@example.com" });

    if (adminExists) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const admin = new User({
      username: "admin",
      email: "admin@example.com",
      password: "Admin@123", // will be hashed automatically
      role: "admin",
    });

    await admin.save();

    console.log("Admin user created successfully!");
    console.log(`Login: admin / Admin@123`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
}

seedAdmin();
