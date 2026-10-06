const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getConversation, listConversations } = require("../controllers/chatController");

router.use(protect);

router.get("/", listConversations);
router.get("/:otherUserId", getConversation);

module.exports = router;
