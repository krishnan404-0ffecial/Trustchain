import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useSocket } from "../../context/SocketContext";
import Topbar from "../../components/Topbar";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const { socket } = useSocket();

  const load = async () => {
    const { data } = await api.get("/admin/stats");
    setStats(data);
  };

  useEffect(() => {
    load();
  }, []);

  // Live-refresh stats whenever a KYC submission or job event happens platform-wide
  useEffect(() => {
    if (!socket) return;
    const refresh = () => load();
    socket.on("notification", refresh);
    return () => socket.off("notification", refresh);
  }, [socket]);

  if (!stats) return <p style={{ color: "var(--tc-muted)" }}>Loading overview…</p>;

  const cards = [
    { label: "Total Customers", value: stats.totalUsers },
    { label: "Total TC Workers", value: stats.totalWorkers },
    { label: "Pending KYC", value: stats.pendingKYC },
    { label: "Verified TC Workers", value: stats.verifiedWorkers },
    { label: "Total Jobs", value: stats.totalJobs },
    { label: "Completed Jobs", value: stats.completedJobs },
  ];

  return (
    <>
      <Topbar title="Platform Overview" sub="Numbers update live as activity happens across TrustChain." />

      <div className="tc-grid cols-3">
        {cards.map((c) => (
          <div className="tc-card tc-stat-card" key={c.label}>
            <div className="tc-stat-value">{c.value}</div>
            <div className="tc-stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      {stats.pendingKYC > 0 && (
        <div className="tc-card" style={{ marginTop: 20, borderColor: "var(--tc-pending)" }}>
          {stats.pendingKYC} worker{stats.pendingKYC > 1 ? "s" : ""} waiting on KYC review.{" "}
          <a href="/admin/kyc" className="tc-btn" style={{ marginLeft: 8 }}>Review now</a>
        </div>
      )}
    </>
  );
}
