const Message = require("../models/Message");
const { buildConversationId } = require("../models/Message");
const User = require("../models/User");

// @route GET /api/chat/:otherUserId  (message history with a specific user)
const getConversation = async (req, res, next) => {
  try {
    const otherUserId = req.params.otherUserId;
    const conversationId = buildConversationId(req.user._id, otherUserId);

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

    // Mark messages sent to me as read
    await Message.updateMany(
      { conversationId, receiver: req.user._id, readAt: null },
      { readAt: new Date() }
    );

    res.json({ conversationId, messages });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/chat  (list of conversations with last message + unread count)
const listConversations = async (req, res, next) => {
  try {
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [{ sender: myId }, { receiver: myId }],
    }).sort({ createdAt: -1 });

    const conversationsMap = new Map();
    for (const msg of messages) {
      if (!conversationsMap.has(msg.conversationId)) {
        const otherUserId = msg.sender.toString() === myId.toString() ? msg.receiver : msg.sender;
        conversationsMap.set(msg.conversationId, {
          conversationId: msg.conversationId,
          otherUserId,
          lastMessage: msg.text,
          lastMessageAt: msg.createdAt,
          unreadCount: 0,
        });
      }
      if (msg.receiver.toString() === myId.toString() && !msg.readAt) {
        conversationsMap.get(msg.conversationId).unreadCount += 1;
      }
    }

    const conversations = Array.from(conversationsMap.values());
    const otherUserIds = conversations.map((c) => c.otherUserId);
    const otherUsers = await User.find({ _id: { $in: otherUserIds } }).select(
      "name avatar role kycStatus"
    );
    const userMap = new Map(otherUsers.map((u) => [u._id.toString(), u]));

    const enriched = conversations.map((c) => ({
      ...c,
      otherUser: userMap.get(c.otherUserId.toString()) || null,
    }));

    res.json({ conversations: enriched });
  } catch (err) {
    next(err);
  }
};

module.exports = { getConversation, listConversations };
