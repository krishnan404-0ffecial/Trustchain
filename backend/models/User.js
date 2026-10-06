const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, trim: true },
    role: { type: String, enum: ["user", "worker", "admin"], default: "user" },
    avatar: { type: String, default: "" },

    // Worker-only fields
    skills: [{ type: String }],
    bio: { type: String, default: "" },
    hourlyRate: { type: Number, default: 0 },
    kycStatus: {
      type: String,
      enum: ["not_submitted", "pending", "verified", "rejected"],
      default: "not_submitted",
    },
    kycDocuments: [
      {
        docType: String, // e.g. "government_id", "address_proof"
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    kycRejectionReason: { type: String, default: "" },
    trustScore: { type: Number, default: 0 }, // 0-100 computed score
    avgRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },

    isActive: { type: Boolean, default: true },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Public-safe profile (never expose password)
userSchema.methods.toPublicProfile = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
