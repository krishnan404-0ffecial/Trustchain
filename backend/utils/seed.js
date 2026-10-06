// Run with: npm run seed
// Creates a default admin account (change credentials after first login).
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email: "admin@trustchain.local" });
  if (existing) {
    console.log("Admin already exists:", existing.email);
    process.exit(0);
  }

  const admin = await User.create({
    name: "TrustChain Admin",
    email: "admin@trustchain.local",
    password: "ChangeMe123!",
    role: "admin",
  });

  console.log("Admin created:");
  console.log("  email:   ", admin.email);
  console.log("  password: ChangeMe123!  (change this after logging in)");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
