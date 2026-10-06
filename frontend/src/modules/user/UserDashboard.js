import { useEffect, useState } from "react";
import api from "../../api/axios";
import TrustBadge from "../../components/TrustBadge";
import Topbar from "../../components/Topbar";
import { useNavigate, Link } from "react-router-dom";

export default function UserDashboard() {
  const [workers, setWorkers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", category: "", price: "" });
  const navigate = useNavigate();

  const loadWorkers = async (q = "") => {
    setLoading(true);
    try {
      const { data } = await api.get("/users/workers", { params: q ? { search: q } : {} });
      setWorkers(data.workers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadWorkers(search);
  };

  const submitRequest = async (e, workerId) => {
    e.preventDefault();
    await api.post("/users/jobs", { workerId, ...form, price: Number(form.price) || 0 });
    setRequesting(null);
    setForm({ title: "", description: "", category: "", price: "" });
    navigate("/user/jobs");
  };

  return (
    <>
      <Topbar title="Find a Verified TC Worker" sub="Every worker here has passed TrustChain's KYC verification." />

      <form onSubmit={handleSearch} style={{ marginBottom: 20, display: "flex", gap: 8, maxWidth: 420 }}>
        <input
          className="tc-input"
          placeholder="Search by name or skill…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="tc-btn secondary" type="submit">Search</button>
      </form>

      {loading ? (
        <p style={{ color: "var(--tc-muted)" }}>Loading workers…</p>
      ) : workers.length === 0 ? (
        <div className="tc-card tc-empty">No verified workers found yet.</div>
      ) : (
        <div className="tc-grid cols-3">
          {workers.map((w) => (
            <div className="tc-card" key={w._id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div className="tc-avatar">{w.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{w.name}</div>
                    <div style={{ fontSize: 12.5, color: "var(--tc-muted)" }}>
                      {w.skills?.join(", ") || "General services"}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center", margin: "12px 0" }}>
                <TrustBadge status={w.kycStatus} />
                <span style={{ fontSize: 12.5, color: "var(--tc-muted)" }}>
                  ★ {w.avgRating || "—"} ({w.ratingCount} reviews) · Trust score {w.trustScore}
                </span>
              </div>

              {w.bio && <p style={{ fontSize: 13, color: "var(--tc-muted)", marginBottom: 12 }}>{w.bio}</p>}

              {requesting === w._id ? (
                <form onSubmit={(e) => submitRequest(e, w._id)}>
                  <div className="tc-field">
                    <input
                      className="tc-input"
                      placeholder="Job title"
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>
                  <div className="tc-field">
                    <textarea
                      className="tc-textarea"
                      placeholder="Describe what you need…"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="tc-btn" type="submit" style={{ flex: 1 }}>Send request</button>
                    <button className="tc-btn secondary" type="button" onClick={() => setRequesting(null)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="tc-btn block" onClick={() => setRequesting(w._id)}>
                    Request this worker
                  </button>
                  <Link className="tc-btn secondary" to={`/chat?with=${w._id}`}>
                    Message
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
