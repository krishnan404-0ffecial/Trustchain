const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  listVerifiedWorkers,
  getWorkerProfile,
  requestJob,
  myJobs,
  rateWorker,
} = require("../controllers/userController");

router.use(protect, authorize("user"));

router.get("/workers", listVerifiedWorkers);
router.get("/workers/:id", getWorkerProfile);
router.post("/jobs", requestJob);
router.get("/jobs", myJobs);
router.post("/jobs/:id/rate", rateWorker);

module.exports = router;
