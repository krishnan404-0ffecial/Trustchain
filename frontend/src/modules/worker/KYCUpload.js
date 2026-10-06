import { useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import TrustBadge from "../../components/TrustBadge";
import Topbar from "../../components/Topbar";

export default function KYCUpload() {
  const { user, refreshUser } = useAuth();
  const [docType, setDocType] = useState("id_card");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setMessage("Please select a file to upload.");
    setSubmitting(true);
    setMessage("");

    try {
      const fd = new FormData();
      fd.append("docTypes", docType);
      fd.append("documents", file);
      await api.post("/workers/kyc", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("Documents submitted! An admin will review them shortly.");
      await refreshUser();
    } catch (err) {
      setMessage(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Topbar
        title="Identity Verification (KYC)"
        sub="Verified TC Workers get 3x more job requests on average."
        extraAction={<TrustBadge status={user.kycStatus} />}
      />

      {user.kycStatus === "pending" ? (
        <div className="tc-card">
          Your documents are currently under review. We'll notify you the instant an admin makes a decision — no need to refresh.
        </div>
      ) : user.kycStatus === "verified" ? (
        <div className="tc-card">
          You are fully verified! Your profile displays the Trust Seal badge to all customers.
        </div>
      ) : (
        <div className="tc-card" style={{ maxWidth: 480 }}>
          {user.kycStatus === "rejected" && (
            <div className="tc-error-banner">
              Previous submission rejected: {user.kycRejectionReason || "Please resubmit."}
            </div>
          )}
          {message && <div className="tc-error-banner" style={{ background: "var(--tc-verified-soft)", color: "#147a48" }}>{message}</div>}

          <form onSubmit={handleSubmit}>
            <div className="tc-field">
              <label className="tc-label">Document Type</label>
              <select
                className="tc-select"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
              >
                <option value="id_card">Government ID Card</option>
                <option value="passport">Passport</option>
                <option value="drivers_license">Driver's License</option>
              </select>
            </div>
            <div className="tc-field">
              <label className="tc-label">Upload Document (ID / Passport)</label>
              <input
                type="file"
                className="tc-input"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
            <button className="tc-btn primary-glow block" type="submit" disabled={submitting}>
              {submitting ? "Uploading…" : "Submit for Verification"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
