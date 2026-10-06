import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useSocket } from "../../context/SocketContext";
import { Link } from "react-router-dom";
import Topbar from "../../components/Topbar";

const NEXT_STATUS = {
  requested: [
    { label: "Accept", value: "accepted" },
    { label: "Decline", value: "rejected" },
  ],
  accepted: [{ label: "Start job", value: "in_progress" }],
  in_progress: [{ label: "Mark complete", value: "completed" }],
};

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const load = async () => {
    const { data } = await api.get("/workers/jobs");
    setJobs(data.jobs);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onNewJob = (job) => setJobs((prev) => [job, ...prev]);
    socket.on("job:new", onNewJob);
    return () => socket.off("job:new", onNewJob);
  }, [socket]);

  const changeStatus = async (jobId, status) => {
    await api.patch(`/workers/jobs/${jobId}/status`, { status });
    setJobs((prev) => prev.map((j) => (j._id === jobId ? { ...j, status } : j)));
  };

  if (loading) return <p style={{ color: "var(--tc-muted)" }}>Loading jobs…</p>;

  return (
    <>
      <Topbar title="My Jobs" sub="New requests appear here instantly, no refresh needed." />

      {jobs.length === 0 ? (
        <div className="tc-card tc-empty">No job requests yet. Make sure you're marked available.</div>
      ) : (
        <div className="tc-card">
          {jobs.map((job) => (
            <div className="tc-list-item" key={job._id} style={{ display: "block" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{job.title}</div>
                  <div style={{ fontSize: 12.5, color: "var(--tc-muted)" }}>
                    for {job.user?.name} · {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                  {job.description && (
                    <div style={{ fontSize: 13, color: "var(--tc-muted)", marginTop: 4 }}>{job.description}</div>
                  )}
                </div>
                <span className={`tc-badge status-${job.status}`}>{job.status.replace("_", " ")}</span>
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <Link className="tc-btn secondary" to={`/chat?with=${job.user?._id}`}>
                  Message customer
                </Link>
              </div>

              {NEXT_STATUS[job.status] && (
                <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                  {NEXT_STATUS[job.status].map((opt) => (
                    <button
                      key={opt.value}
                      className={`tc-btn ${opt.value === "rejected" ? "danger" : "success"}`}
                      onClick={() => changeStatus(job._id, opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
