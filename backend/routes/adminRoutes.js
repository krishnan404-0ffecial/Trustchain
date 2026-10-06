const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  listPendingKYC,
  getKYCDetail,
  decideKYC,
  listUsers,
  toggleUserActive,
  getStats,
} = require("../controllers/adminController");

router.use(protect, authorize("admin"));

router.get("/stats", getStats);
router.get("/kyc/pending", listPendingKYC);
router.get("/kyc/:workerId", getKYCDetail);
router.patch("/kyc/:workerId", decideKYC);
router.get("/users", listUsers);
router.patch("/users/:id/toggle-active", toggleUserActive);

module.exports = router;
