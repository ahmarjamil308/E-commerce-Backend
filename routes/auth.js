// routes/auth.js
import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  console.log("Signup request received");
  console.log("Request body:", req.body);
  console.log("Headers:", req.headers);

  const { name, email, password } = req.body;

  try {
    // Validation
    if (!name || !email || !password) {
      console.log("Missing required fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    console.log("Checking if user exists...");
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    console.log("Creating new user...");
    const user = await User.create({ name, email, password });
    console.log("User created successfully:", {
      id: user._id,
      name: user.name,
      email: user.email,
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret,
      {
        expiresIn: "7d",
      }
    );

    const response = {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };

    console.log("Sending success response");
    res.status(201).json(response);
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({
      message: "Server error during signup",
      error: err.message,
      details: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  console.log("Login request received");
  console.log("Request body:", { email: req.body.email, password: "***" });

  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    console.log("Looking for user:", email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("Checking password...");
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log("Password mismatch for user:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret,
      {
        expiresIn: "7d",
      }
    );

    const response = {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };

    console.log("Login successful for:", email);
    res.json(response);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      message: "Server error during login",
      error: err.message,
    });
  }
});

export default router;
