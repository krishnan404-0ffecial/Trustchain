const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  submitKYC,
  updateProfile,
  myAssignedJobs,
  updateJobStatus,
} = require("../controllers/workerController");

router.use(protect, authorize("worker"));

router.post("/kyc", upload.array("documents", 5), submitKYC);
router.patch("/profile", updateProfile);
router.get("/jobs", myAssignedJobs);
router.patch("/jobs/:id/status", updateJobStatus);

module.exports = router;
