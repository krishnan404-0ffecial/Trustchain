const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @route POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, skills } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const allowedRoles = ["user", "worker"]; // admins are seeded/promoted, not self-registered
    const finalRole = allowedRoles.includes(role) ? role : "user";

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: finalRole,
      skills: finalRole === "worker" ? skills || [] : [],
      kycStatus: finalRole === "worker" ? "not_submitted" : "not_submitted",
    });

    const token = generateToken(user._id, user.role);
    res.status(201).json({ token, user: user.toPublicProfile() });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: "This account has been deactivated" });
    }

    user.lastSeen = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);
    res.json({ token, user: user.toPublicProfile() });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    res.json({ user: req.user.toPublicProfile() });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/auth/user/:id  (public profile lookup for chat deep-links)
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("name avatar role kycStatus");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, getUserById };
