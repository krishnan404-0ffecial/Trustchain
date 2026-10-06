const User = require("../models/User");
const Job = require("../models/Job");
const Notification = require("../models/Notification");

// @route GET /api/admin/kyc/pending
const listPendingKYC = async (req, res, next) => {
  try {
    const workers = await User.find({ role: "worker", kycStatus: "pending" }).select(
      "name email phone kycDocuments createdAt"
    );
    res.json({ count: workers.length, workers });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/admin/kyc/:workerId
const getKYCDetail = async (req, res, next) => {
  try {
    const worker = await User.findOne({ _id: req.params.workerId, role: "worker" }).select(
      "-password"
    );
    if (!worker) return res.status(404).json({ message: "Worker not found" });
    res.json({ worker });
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/admin/kyc/:workerId  { decision: "verified" | "rejected", reason }
const decideKYC = async (req, res, next) => {
  try {
    const { decision, reason } = req.body;
    if (!["verified", "rejected"].includes(decision)) {
      return res.status(400).json({ message: "decision must be 'verified' or 'rejected'" });
    }

    const worker = await User.findOne({ _id: req.params.workerId, role: "worker" });
    if (!worker) return res.status(404).json({ message: "Worker not found" });

    worker.kycStatus = decision;
    worker.kycRejectionReason = decision === "rejected" ? reason || "Not specified" : "";
    await worker.save();

    const notif = await Notification.create({
      recipient: worker._id,
      type: decision === "verified" ? "kyc_verified" : "kyc_rejected",
      title: decision === "verified" ? "KYC Verified ✔" : "KYC Rejected",
      body:
        decision === "verified"
          ? "Your identity has been verified. You can now receive job requests."
          : `Your KYC was rejected: ${worker.kycRejectionReason}`,
      link: "/worker/dashboard",
    });

    const io = req.app.get("io");
    io.to(worker._id.toString()).emit("notification", notif);
    io.to(worker._id.toString()).emit("kyc:statusUpdated", { kycStatus: decision });

    res.json({ message: `Worker KYC ${decision}`, worker: worker.toPublicProfile() });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/admin/users?role=&search=
const listUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.name = { $regex: search, $options: "i" };

    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    res.json({ count: users.length, users });
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/admin/users/:id/toggle-active
const toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot deactivate an admin account" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `User ${user.isActive ? "activated" : "deactivated"}`, user: user.toPublicProfile() });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/admin/stats  (dashboard overview)
const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalWorkers, pendingKYC, verifiedWorkers, totalJobs, completedJobs] =
      await Promise.all([
        User.countDocuments({ role: "user" }),
        User.countDocuments({ role: "worker" }),
        User.countDocuments({ role: "worker", kycStatus: "pending" }),
        User.countDocuments({ role: "worker", kycStatus: "verified" }),
        Job.countDocuments({}),
        Job.countDocuments({ status: "completed" }),
      ]);

    res.json({
      totalUsers,
      totalWorkers,
      pendingKYC,
      verifiedWorkers,
      totalJobs,
      completedJobs,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listPendingKYC,
  getKYCDetail,
  decideKYC,
  listUsers,
  toggleUserActive,
  getStats,
};
