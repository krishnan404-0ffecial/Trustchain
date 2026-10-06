import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useSocket } from "../../context/SocketContext";
import RatingStars from "../../components/RatingStars";
import Topbar from "../../components/Topbar";

export default function MyBookings() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState({});
  const { socket } = useSocket();

  const load = async () => {
    const { data } = await api.get("/users/jobs");
    setJobs(data.jobs);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // Live status updates without needing a page refresh
  useEffect(() => {
    if (!socket) return;
    const handler = ({ jobId, status }) => {
      setJobs((prev) => prev.map((j) => (j._id === jobId ? { ...j, status } : j)));
    };
    socket.on("job:statusUpdated", handler);
    return () => socket.off("job:statusUpdated", handler);
  }, [socket]);

  const submitRating = async (jobId) => {
    const r = rating[jobId];
    if (!r?.stars) return;
    await api.post(`/users/jobs/${jobId}/rate`, r);
    setRating((prev) => ({ ...prev, [jobId]: { ...prev[jobId], submitted: true } }));
  };

  if (loading) return <p style={{ color: "var(--tc-muted)" }}>Loading bookings…</p>;

  return (
    <>
      <Topbar title="My Bookings" sub="Status updates arrive live as your worker updates the job." />

      {jobs.length === 0 ? (
        <div className="tc-card tc-empty">You haven't requested any jobs yet.</div>
      ) : (
        <div className="tc-card">
          {jobs.map((job) => (
            <div className="tc-list-item" key={job._id} style={{ display: "block" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{job.title}</div>
                  <div style={{ fontSize: 12.5, color: "var(--tc-muted)" }}>
                    with {job.worker?.name} · {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <span className={`tc-badge status-${job.status}`}>{job.status.replace("_", " ")}</span>
              </div>

              {job.status === "completed" && !rating[job._id]?.submitted && (
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
                  <RatingStars
                    value={rating[job._id]?.stars || 0}
                    onChange={(stars) =>
                      setRating((prev) => ({ ...prev, [job._id]: { ...prev[job._id], stars } }))
                    }
                  />
                  <button className="tc-btn secondary" onClick={() => submitRating(job._id)}>
                    Submit rating
                  </button>
                </div>
              )}
              {rating[job._id]?.submitted && (
                <p style={{ fontSize: 12.5, color: "var(--tc-verified)", marginTop: 8 }}>Thanks for your rating!</p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
