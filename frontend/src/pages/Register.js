import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "user",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await register(form);
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please check your inputs and try again.");
    }
  };

  return (
    <div className="tc-auth-wrap">
      <div className="tc-auth-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <Link to="/" className="tc-auth-brand" style={{ margin: 0 }}>
            <span className="mark">✓</span>
            TrustChain
          </Link>
          <Link to="/" style={{ fontSize: 13, color: "var(--tc-muted)", fontWeight: 500 }}>
            ← Back to Home
          </Link>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, color: "var(--tc-navy)" }}>Create your account</h2>
        <p style={{ color: "var(--tc-muted)", fontSize: 14, marginBottom: 24 }}>
          Select your role to get started with verified TC Worker services
        </p>

        {error && <div className="tc-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="tc-field">
            <label className="tc-label">Account Purpose</label>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "user" })}
                className={`tc-btn ${form.role === "user" ? "primary-glow" : "secondary"}`}
                style={{ flex: 1, padding: 12 }}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "worker" })}
                className={`tc-btn ${form.role === "worker" ? "primary-glow" : "secondary"}`}
                style={{ flex: 1, padding: 12 }}
              >
                TC Worker
              </button>
            </div>
          </div>

          <div className="tc-field">
            <label className="tc-label">Full Name</label>
            <input
              className="tc-input"
              placeholder="John Doe"
              autoComplete="off"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="tc-field">
            <label className="tc-label">Email Address</label>
            <input
              className="tc-input"
              type="email"
              placeholder="john@example.com"
              autoComplete="off"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="tc-field">
            <label className="tc-label">Phone Number</label>
            <input
              className="tc-input"
              placeholder="+1 (555) 000-0000"
              autoComplete="off"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div className="tc-field">
            <label className="tc-label">Password</label>
            <div style={{ position: "relative" }}>
              <input
                className="tc-input"
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{ paddingRight: 70 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--tc-accent)",
                  fontWeight: 600,
                  fontSize: 12.5,
                  cursor: "pointer",
                  padding: "4px 6px",
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {form.role === "worker" && (
            <div
              style={{
                background: "#eff6ff",
                border: "1px solid rgba(59, 130, 246, 0.2)",
                padding: "12px 14px",
                borderRadius: "var(--tc-radius-sm)",
                marginBottom: 18,
                fontSize: 13,
                color: "#1e40af",
              }}
            >
              <strong>TC Worker Note:</strong> After registration, submit your Government ID in the Verification tab to get approved by Admins.
            </div>
          )}

          <button className="tc-btn block primary-glow" type="submit" disabled={loading} style={{ marginTop: 8, padding: 12 }}>
            {loading ? "Creating Account…" : form.role === "worker" ? "Register as Worker" : "Register as Customer"}
          </button>
        </form>

        <div className="tc-auth-switch">
          Already have an account? <Link to="/login">Log in here</Link>
        </div>
      </div>
    </div>
  );
}
