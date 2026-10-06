import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useSearchParams } from "react-router-dom";
import Topbar from "../components/Topbar";

export default function Chat() {
  const { user } = useAuth();
  const { socket, onlineUserIds } = useSocket();
  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null); // { _id, name, role, kycStatus }
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingFrom, setTypingFrom] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  const loadConversations = async () => {
    const { data } = await api.get("/chat");
    setConversations(data.conversations);

    // If arrived via ?with=<userId> (e.g. "Message worker" button elsewhere), open it
    const withId = searchParams.get("with");
    if (withId && !activeUser) {
      const existing = data.conversations.find((c) => c.otherUserId === withId);
      if (existing) {
        openConversation(existing.otherUser, existing.otherUserId);
      } else {
        try {
          const res = await api.get(`/auth/user/${withId}`);
          openConversation(res.data.user, withId);
        } catch {
          // Not fetchable via the worker-profile endpoint (e.g. a customer id) —
          // still open the thread with a placeholder name.
          openConversation(null, withId);
        }
      }
    }
  };

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openConversation = async (otherUser, otherUserId) => {
    setActiveUser(otherUser ? { ...otherUser, _id: otherUserId } : { _id: otherUserId, name: "User" });
    const { data } = await api.get(`/chat/${otherUserId}`);
    setMessages(data.messages);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const onReceive = (msg) => {
      if (activeUser && (msg.sender === activeUser._id || msg.receiver === activeUser._id)) {
        setMessages((prev) => [...prev, msg]);
      }
      loadConversations();
    };

    const onTyping = ({ userId, isTyping }) => {
      if (activeUser && userId === activeUser._id) setTypingFrom(isTyping);
    };

    socket.on("chat:receive", onReceive);
    socket.on("chat:typing", onTyping);
    return () => {
      socket.off("chat:receive", onReceive);
      socket.off("chat:typing", onTyping);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, activeUser]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() || !activeUser || !socket) return;
    socket.emit("chat:send", { receiverId: activeUser._id, text }, (ack) => {
      if (ack?.error) console.error(ack.error);
    });
    setText("");
    socket.emit("chat:typing", { receiverId: activeUser._id, isTyping: false });
  };

  const handleTyping = (val) => {
    setText(val);
    if (!socket || !activeUser) return;
    socket.emit("chat:typing", { receiverId: activeUser._id, isTyping: true });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("chat:typing", { receiverId: activeUser._id, isTyping: false });
    }, 1200);
  };

  return (
    <>
      <Topbar title="Messages & Live Chat" sub="Real-time live messaging between verified users." />
      <div className="tc-chat-wrap">
      <div className="tc-chat-list">
        {conversations.length === 0 && (
          <div className="tc-empty" style={{ padding: 24 }}>
            No conversations yet. Message a worker from their profile to get started.
          </div>
        )}
        {conversations.map((c) => (
          <div
            key={c.conversationId}
            className={`tc-chat-list-item ${activeUser?._id === c.otherUserId ? "active" : ""}`}
            onClick={() => openConversation(c.otherUser, c.otherUserId)}
          >
            <div className="tc-avatar">{c.otherUser?.name?.charAt(0).toUpperCase() || "?"}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600, fontSize: 13.5 }}>{c.otherUser?.name || "Unknown"}</span>
                {c.unreadCount > 0 && (
                  <span className="tc-badge" style={{ background: "var(--tc-navy)", color: "#fff" }}>
                    {c.unreadCount}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: "var(--tc-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {c.lastMessage}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="tc-chat-panel">
        {!activeUser ? (
          <div className="tc-empty" style={{ margin: "auto" }}>Select a conversation to start chatting.</div>
        ) : (
          <>
            <div className="tc-chat-header">
              <div className="tc-avatar">{activeUser.name?.charAt(0).toUpperCase() || "?"}</div>
              <div>
                <div style={{ fontWeight: 600 }}>{activeUser.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--tc-muted)" }}>
                  {onlineUserIds.has(activeUser._id) ? "● Online" : "Offline"}
                </div>
              </div>
            </div>

            <div className="tc-chat-messages">
              {messages.map((m) => (
                <div key={m._id} className={`tc-msg ${m.sender === user._id ? "mine" : "theirs"}`}>
                  {m.text}
                  <div className="tc-msg-time">{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {typingFrom && <div className="tc-typing-hint">{activeUser.name} is typing…</div>}

            <form className="tc-chat-input-row" onSubmit={sendMessage}>
              <input
                className="tc-input"
                placeholder="Type a message…"
                value={text}
                onChange={(e) => handleTyping(e.target.value)}
              />
              <button className="tc-btn" type="submit">Send</button>
            </form>
          </>
        )}
      </div>
      </div>
    </>
  );
}
