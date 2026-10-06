import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

const LINKS_BY_ROLE = {
  user: [
    { to: "/user/dashboard", label: "Find Workers" },
    { to: "/user/jobs", label: "My Bookings" },
    { to: "/chat", label: "Messages" },
  ],
  worker: [
    { to: "/worker/dashboard", label: "Dashboard" },
    { to: "/worker/kyc", label: "Verification (KYC)" },
    { to: "/worker/jobs", label: "My Jobs" },
    { to: "/chat", label: "Messages" },
  ],
  admin: [
    { to: "/admin/dashboard", label: "Overview" },
    { to: "/admin/kyc", label: "KYC Review" },
    { to: "/admin/users", label: "Manage Users" },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { connected, unreadCount } = useSocket();
  if (!user) return null;
  const links = LINKS_BY_ROLE[user.role] || [];

  const getRoleDisplay = (role) => {
    if (role === "worker") return "TC Worker";
    if (role === "admin") return "Admin";
    return "User";
  };

  return (
    <aside className="tc-sidebar">
      <div className="tc-brand">
        <span className="mark">✓</span>
        TrustChain
      </div>

      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          className={({ isActive }) => "tc-nav-link" + (isActive ? " active" : "")}
        >
          {l.label}
          {l.to === "/chat" && unreadCount > 0 ? ` (${unreadCount})` : ""}
        </NavLink>
      ))}

      <div className="tc-nav-footer">
        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "0 12px 10px", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: connected ? "var(--tc-verified)" : "#8a93a3",
              display: "inline-block",
            }}
          />
          {connected ? "Live" : "Connecting…"}
        </div>
        <div style={{ padding: "0 12px 10px", fontSize: 13, color: "#fff", fontWeight: 600 }}>
          {user.name}
          <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>
            {getRoleDisplay(user.role)}
          </div>
        </div>
        <button className="tc-btn secondary block" onClick={logout} style={{ marginTop: 4 }}>
          Log out
        </button>
      </div>
    </aside>
  );
}
