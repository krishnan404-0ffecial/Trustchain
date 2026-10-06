const User = require("../models/User");
const Job = require("../models/Job");
const Rating = require("../models/Rating");
const Notification = require("../models/Notification");

// @route GET /api/users/workers  (browse verified workers, optional ?skill=&search=)
const listVerifiedWorkers = async (req, res, next) => {
  try {
    const { skill, search } = req.query;
    const filter = { role: "worker", kycStatus: "verified", isActive: true };
    if (skill) filter.skills = skill;
    if (search) filter.name = { $regex: search, $options: "i" };

    const workers = await User.find(filter)
      .select("-password -kycDocuments -kycRejectionReason")
      .sort({ trustScore: -1, avgRating: -1 });

    res.json({ count: workers.length, workers });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/users/workers/:id
const getWorkerProfile = async (req, res, next) => {
  try {
    const worker = await User.findOne({
      _id: req.params.id,
      role: "worker",
    }).select("-password -kycDocuments -kycRejectionReason");

    if (!worker) return res.status(404).json({ message: "Worker not found" });
    res.json({ worker });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/users/jobs  { workerId, title, description, category, scheduledAt, price }
const requestJob = async (req, res, next) => {
  try {
    const { workerId, title, description, category, scheduledAt, price } = req.body;
    if (!workerId || !title) {
      return res.status(400).json({ message: "workerId and title are required" });
    }

    const worker = await User.findOne({ _id: workerId, role: "worker", kycStatus: "verified" });
    if (!worker) {
      return res.status(404).json({ message: "Verified worker not found" });
    }

    const job = await Job.create({
      user: req.user._id,
      worker: worker._id,
      title,
      description,
      category,
      scheduledAt,
      price,
      statusHistory: [{ status: "requested", changedBy: req.user._id }],
    });

    const notif = await Notification.create({
      recipient: worker._id,
      type: "job_requested",
      title: "New job request",
      body: `${req.user.name} requested: "${title}"`,
      link: `/worker/jobs/${job._id}`,
    });

    const io = req.app.get("io");
    io.to(worker._id.toString()).emit("notification", notif);
    io.to(worker._id.toString()).emit("job:new", job);

    res.status(201).json({ job });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/users/jobs (my requested jobs)
const myJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ user: req.user._id })
      .populate("worker", "name avatar trustScore avgRating kycStatus")
      .sort({ createdAt: -1 });
    res.json({ jobs });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/users/jobs/:id/rate  { stars, review }
const rateWorker = async (req, res, next) => {
  try {
    const { stars, review } = req.body;
    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ message: "stars must be between 1 and 5" });
    }

    const job = await Job.findOne({ _id: req.params.id, user: req.user._id });
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.status !== "completed") {
      return res.status(400).json({ message: "You can only rate a completed job" });
    }

    const existing = await Rating.findOne({ job: job._id, fromUser: req.user._id });
    if (existing) return res.status(409).json({ message: "You already rated this job" });

    await Rating.create({
      job: job._id,
      fromUser: req.user._id,
      toWorker: job.worker,
      stars,
      review,
    });

    // Recompute worker's avgRating, ratingCount, and trustScore
    const stats = await Rating.aggregate([
      { $match: { toWorker: job.worker } },
      { $group: { _id: "$toWorker", avg: { $avg: "$stars" }, count: { $sum: 1 } } },
    ]);
    const { avg = 0, count = 0 } = stats[0] || {};

    const worker = await User.findById(job.worker);
    worker.avgRating = Math.round(avg * 10) / 10;
    worker.ratingCount = count;
    // Trust score blends rating quality (70%) with review volume confidence (30%, capped at 20 reviews)
    const ratingComponent = (worker.avgRating / 5) * 70;
    const volumeComponent = Math.min(count / 20, 1) * 30;
    worker.trustScore = Math.round(ratingComponent + volumeComponent);
    await worker.save();

    const notif = await Notification.create({
      recipient: worker._id,
      type: "new_rating",
      title: "You received a new rating",
      body: `${req.user.name} rated you ${stars} star(s)`,
      link: `/worker/dashboard`,
    });

    const io = req.app.get("io");
    io.to(worker._id.toString()).emit("notification", notif);
    io.to(worker._id.toString()).emit("worker:trustScoreUpdated", {
      trustScore: worker.trustScore,
      avgRating: worker.avgRating,
      ratingCount: worker.ratingCount,
    });

    res.status(201).json({ message: "Rating submitted", trustScore: worker.trustScore });
  } catch (err) {
    next(err);
  }
};

module.exports = { listVerifiedWorkers, getWorkerProfile, requestJob, myJobs, rateWorker };
