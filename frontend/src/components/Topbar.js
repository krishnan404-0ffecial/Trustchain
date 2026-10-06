import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Topbar({ title, sub, extraAction }) {
  const { user } = useAuth();

  const getRoleLabel = (role) => {
    if (role === "admin") return "Admin";
    if (role === "worker") return "TC Worker";
    return "User (Customer)";
  };

  return (
    <div className="tc-topbar">
      <div>
        <h1 className="tc-page-title">{title}</h1>
        {sub && <p className="tc-page-sub">{sub}</p>}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {extraAction}
        {user && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#ffffff",
              padding: "7px 16px",
              borderRadius: "var(--tc-radius-full)",
              border: "1px solid var(--tc-line)",
              boxShadow: "var(--tc-shadow-sm)",
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "var(--tc-accent-gradient)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--tc-navy)", lineHeight: 1.2 }}>
                {user.name}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--tc-muted)", fontWeight: 600 }}>
                {getRoleLabel(user.role)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
