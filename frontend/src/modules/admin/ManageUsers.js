import { useEffect, useState } from "react";
import api from "../../api/axios";
import TrustBadge from "../../components/TrustBadge";
import Topbar from "../../components/Topbar";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (role !== "all") params.role = role;
      if (search) params.search = search;
      const { data } = await api.get("/admin/users", { params });
      setUsers(data.users);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const toggleActive = async (id) => {
    const { data } = await api.patch(`/admin/users/${id}/toggle-active`);
    setUsers((prev) => prev.map((u) => (u._id === id ? data.user : u)));
  };

  return (
    <>
      <Topbar title="Manage Users" sub="View and moderate all customers and TC Workers on the platform." />

      <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
          <input
            className="tc-input"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="tc-btn secondary" type="submit">Search</button>
        </form>
        <select className="tc-select" style={{ width: 160 }} value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="user">Customers</option>
          <option value="worker">Workers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {loading ? (
        <p style={{ color: "var(--tc-muted)" }}>Loading users…</p>
      ) : (
        <div className="tc-card">
          {users.map((u) => (
            <div className="tc-list-item" key={u._id}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div className="tc-avatar">{u.name.charAt(0).toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: 600 }}>{u.name}</div>
                  <div style={{ fontSize: 12.5, color: "var(--tc-muted)" }}>
                    {u.email} · <span style={{ textTransform: "capitalize" }}>{u.role}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {u.role === "worker" && <TrustBadge status={u.kycStatus} />}
                <span className="tc-badge" style={{ background: u.isActive ? "var(--tc-verified-soft)" : "var(--tc-rejected-soft)", color: u.isActive ? "#147a48" : "#a53232" }}>
                  {u.isActive ? "Active" : "Deactivated"}
                </span>
                {u.role !== "admin" && (
                  <button className="tc-btn secondary" onClick={() => toggleActive(u._id)}>
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
                )}
              </div>
            </div>
          ))}
          {users.length === 0 && <div className="tc-empty">No users found.</div>}
        </div>
      )}
    </>
  );
}
