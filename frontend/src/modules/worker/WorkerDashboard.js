import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import TrustBadge from "../../components/TrustBadge";
import Topbar from "../../components/Topbar";

export default function WorkerDashboard() {
  const { user, setUser } = useAuth();
  const { socket } = useSocket();
  const [profile, setProfile] = useState(user);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    skills: user.skills?.join(", ") || "",
    bio: user.bio || "",
    hourlyRate: user.hourlyRate || "",
  });

  useEffect(() => {
    if (!socket) return;
    const onKyc = ({ kycStatus }) => setProfile((p) => ({ ...p, kycStatus }));
    const onTrust = (payload) => setProfile((p) => ({ ...p, ...payload }));
    socket.on("kyc:statusUpdated", onKyc);
    socket.on("worker:trustScoreUpdated", onTrust);
    return () => {
      socket.off("kyc:statusUpdated", onKyc);
      socket.off("worker:trustScoreUpdated", onTrust);
    };
  }, [socket]);

  const toggleAvailability = async () => {
    const { data } = await api.patch("/workers/profile", { isAvailable: !profile.isAvailable });
    setProfile(data.user);
    setUser(data.user);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch("/workers/profile", {
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        bio: form.bio,
        hourlyRate: Number(form.hourlyRate) || 0,
      });
      setProfile(data.user);
      setUser(data.user);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Topbar
        title={`Welcome, ${profile.name}`}
        sub="Your verification and reputation update here live."
        extraAction={<TrustBadge status={profile.kycStatus} />}
      />

      {profile.kycStatus !== "verified" && (
        <div className="tc-card" style={{ marginBottom: 20, borderColor: "var(--tc-pending)" }}>
          {profile.kycStatus === "pending" && "Your KYC documents are under review by an admin. You'll be notified the moment a decision is made."}
          {profile.kycStatus === "rejected" && `Your KYC was rejected: ${profile.kycRejectionReason || "please resubmit your documents."}`}
          {profile.kycStatus === "not_submitted" && "Submit your KYC documents to start receiving job requests."}
          {" "}
          {profile.kycStatus !== "pending" && (
            <a href="/worker/kyc" className="tc-btn" style={{ marginLeft: 10 }}>
              Go to Verification
            </a>
          )}
        </div>
      )}

      <div className="tc-grid cols-4" style={{ marginBottom: 24 }}>
        <div className="tc-card tc-stat-card">
          <div className="tc-stat-value">{profile.trustScore ?? 0}</div>
          <div className="tc-stat-label">Trust Score</div>
        </div>
        <div className="tc-card tc-stat-card">
          <div className="tc-stat-value">{profile.avgRating ?? 0}</div>
          <div className="tc-stat-label">Average Rating</div>
        </div>
        <div className="tc-card tc-stat-card">
          <div className="tc-stat-value">{profile.ratingCount ?? 0}</div>
          <div className="tc-stat-label">Reviews</div>
        </div>
        <div className="tc-card tc-stat-card">
          <div className="tc-stat-value">{profile.isAvailable ? "Open" : "Closed"}</div>
          <div className="tc-stat-label">
            Availability{" "}
            <button
              className="tc-btn secondary"
              style={{ padding: "2px 8px", fontSize: 11, marginLeft: 6 }}
              onClick={toggleAvailability}
            >
              Toggle
            </button>
          </div>
        </div>
      </div>

      <div className="tc-card" style={{ maxWidth: 480 }}>
        <h3 style={{ fontSize: 15, marginBottom: 14 }}>Edit Profile</h3>
        <form onSubmit={saveProfile}>
          <div className="tc-field">
            <label className="tc-label">Skills (comma separated)</label>
            <input
              className="tc-input"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
            />
          </div>
          <div className="tc-field">
            <label className="tc-label">Bio</label>
            <textarea
              className="tc-textarea"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>
          <div className="tc-field">
            <label className="tc-label">Hourly Rate</label>
            <input
              className="tc-input"
              type="number"
              value={form.hourlyRate}
              onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
            />
          </div>
          <button className="tc-btn" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save profile"}
          </button>
        </form>
      </div>
    </>
  );
}
