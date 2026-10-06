const User = require("../models/User");
const Job = require("../models/Job");
const Notification = require("../models/Notification");

// @route POST /api/workers/kyc  (multipart form: docType fields + files[])
const submitKYC = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one KYC document is required" });
    }

    const worker = req.user;
    const docTypes = Array.isArray(req.body.docTypes) ? req.body.docTypes : [req.body.docTypes];

    const newDocs = req.files.map((file, idx) => ({
      docType: docTypes[idx] || "document",
      fileUrl: `/uploads/kyc/${file.filename}`,
    }));

    worker.kycDocuments.push(...newDocs);
    worker.kycStatus = "pending";
    worker.kycRejectionReason = "";
    await worker.save();

    // Notify all admins
    const admins = await User.find({ role: "admin" });
    const io = req.app.get("io");
    for (const admin of admins) {
      const notif = await Notification.create({
        recipient: admin._id,
        type: "kyc_submitted",
        title: "New KYC submission",
        body: `${worker.name} submitted documents for verification`,
        link: `/admin/kyc/${worker._id}`,
      });
      io.to(admin._id.toString()).emit("notification", notif);
    }
    io.to(worker._id.toString()).emit("kyc:statusUpdated", { kycStatus: "pending" });

    res.status(201).json({ message: "KYC documents submitted for review", kycStatus: "pending" });
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/workers/profile  { skills, bio, hourlyRate, isAvailable }
const updateProfile = async (req, res, next) => {
  try {
    const { skills, bio, hourlyRate, isAvailable, phone, avatar } = req.body;
    const worker = req.user;

    if (skills !== undefined) worker.skills = skills;
    if (bio !== undefined) worker.bio = bio;
    if (hourlyRate !== undefined) worker.hourlyRate = hourlyRate;
    if (isAvailable !== undefined) worker.isAvailable = isAvailable;
    if (phone !== undefined) worker.phone = phone;
    if (avatar !== undefined) worker.avatar = avatar;

    await worker.save();
    res.json({ user: worker.toPublicProfile() });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/workers/jobs (jobs assigned to me)
const myAssignedJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ worker: req.user._id })
      .populate("user", "name avatar phone")
      .sort({ createdAt: -1 });
    res.json({ jobs });
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/workers/jobs/:id/status  { status }
const updateJobStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ["accepted", "in_progress", "completed", "rejected"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${allowed.join(", ")}` });
    }

    const job = await Job.findOne({ _id: req.params.id, worker: req.user._id });
    if (!job) return res.status(404).json({ message: "Job not found" });

    job.status = status;
    job.statusHistory.push({ status, changedBy: req.user._id });
    await job.save();

    const notif = await Notification.create({
      recipient: job.user,
      type: "job_status_changed",
      title: "Job status updated",
      body: `Your job "${job.title}" is now ${status.replace("_", " ")}`,
      link: `/user/jobs/${job._id}`,
    });

    const io = req.app.get("io");
    io.to(job.user.toString()).emit("notification", notif);
    io.to(job.user.toString()).emit("job:statusUpdated", { jobId: job._id, status });

    res.json({ job });
  } catch (err) {
    next(err);
  }
};

module.exports = { submitKYC, updateProfile, myAssignedJobs, updateJobStatus };
