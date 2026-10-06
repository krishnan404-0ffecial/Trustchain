import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useSocket } from "../../context/SocketContext";
import Topbar from "../../components/Topbar";

export default function VerifyKYC() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [reason, setReason] = useState("");
  const { socket } = useSocket();

  const load = async () => {
    const { data } = await api.get("/admin/kyc/pending");
    setPending(data.workers);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // Listen for new KYC submissions pushed live from workers
  useEffect(() => {
    if (!socket) return;
    const onNewKyc = (worker) => {
      setPending((prev) => [worker, ...prev.filter((w) => w._id !== worker._id)]);
    };
    socket.on("admin:kycSubmitted", onNewKyc);
    return () => socket.off("admin:kycSubmitted", onNewKyc);
  }, [socket]);

  const decide = async (workerId, decision) => {
    await api.patch(`/admin/kyc/${workerId}`, { decision, reason: decision === "rejected" ? reason : undefined });
    setPending((prev) => prev.filter((w) => w._id !== workerId));
    setExpanded(null);
    setReason("");
  };

  if (loading) return <p style={{ color: "var(--tc-muted)" }}>Loading queue…</p>;

  return (
    <>
      <Topbar title="KYC Review Queue" sub="New submissions appear here in real time." />

      {pending.length === 0 ? (
        <div className="tc-card tc-empty">No pending KYC submissions. Queue is clear.</div>
      ) : (
        <div className="tc-card">
          {pending.map((w) => (
            <div className="tc-list-item" key={w._id} style={{ display: "block" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{w.name}</div>
                  <div style={{ fontSize: 12.5, color: "var(--tc-muted)" }}>
                    {w.email} · {w.phone || "no phone"} · submitted {new Date(w.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  className="tc-btn secondary"
                  onClick={() => setExpanded(expanded === w._id ? null : w._id)}
                >
                  {expanded === w._id ? "Hide" : "Review"}
                </button>
              </div>

              {expanded === w._id && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--tc-line)" }}>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                    {w.kycDocuments?.map((doc, i) => (
                      <a
                        key={i}
                        href={`${process.env.REACT_APP_SOCKET_URL || "http://localhost:5000"}${doc.fileUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="tc-badge"
                        style={{ background: "#eef0f3" }}
                      >
                        {doc.docType} ↗
                      </a>
                    ))}
                  </div>
                  <textarea
                    className="tc-textarea"
                    placeholder="Rejection reason (only needed if rejecting)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    style={{ marginBottom: 10 }}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="tc-btn success" onClick={() => decide(w._id, "verified")}>
                      Approve & Verify
                    </button>
                    <button className="tc-btn danger" onClick={() => decide(w._id, "rejected")}>
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
