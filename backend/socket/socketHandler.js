const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Message = require("../models/Message");
const { buildConversationId } = require("../models/Message");

// Tracks which userIds currently have an active socket connection
const onlineUsers = new Map(); // userId -> Set of socket ids

const registerSocketHandlers = (io) => {
  // Authenticate every socket connection using the JWT issued at login
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) return next(new Error("User not found or inactive"));

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      next();
    } catch (err) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const { userId } = socket;

    // Join a personal room so we can target this user with io.to(userId).emit(...)
    socket.join(userId);

    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);

    io.emit("presence:update", { userId, online: true });

    // --- Chat: send message ---
    socket.on("chat:send", async ({ receiverId, text }, callback) => {
      try {
        if (!receiverId || !text?.trim()) {
          return callback?.({ error: "receiverId and text are required" });
        }

        const conversationId = buildConversationId(userId, receiverId);
        const message = await Message.create({
          conversationId,
          sender: userId,
          receiver: receiverId,
          text: text.trim(),
        });

        // Deliver to both participants (sender gets echo for multi-device sync)
        io.to(receiverId).to(userId).emit("chat:receive", message);
        callback?.({ success: true, message });
      } catch (err) {
        callback?.({ error: "Failed to send message" });
      }
    });

    // --- Typing indicator ---
    socket.on("chat:typing", ({ receiverId, isTyping }) => {
      if (!receiverId) return;
      io.to(receiverId).emit("chat:typing", { userId, isTyping: !!isTyping });
    });

    // --- Job/worker live status rooms (join a job room for live tracking) ---
    socket.on("job:join", (jobId) => {
      if (jobId) socket.join(`job:${jobId}`);
    });
    socket.on("job:leave", (jobId) => {
      if (jobId) socket.leave(`job:${jobId}`);
    });

    socket.on("disconnect", () => {
      const set = onlineUsers.get(userId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) {
          onlineUsers.delete(userId);
          io.emit("presence:update", { userId, online: false });
        }
      }
    });
  });
};

module.exports = { registerSocketHandlers, onlineUsers };
