import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await login(form.email, form.password);
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please verify your credentials.");
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

        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, color: "var(--tc-navy)" }}>Welcome back</h2>
        <p style={{ color: "var(--tc-muted)", fontSize: 14, marginBottom: 24 }}>
          Access your verified TC Worker or customer account
        </p>

        {error && <div className="tc-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="tc-field">
            <label className="tc-label">Email Address</label>
            <input
              className="tc-input"
              type="email"
              placeholder="name@company.com"
              autoComplete="off"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="tc-field">
            <label className="tc-label">Password</label>
            <div style={{ position: "relative" }}>
              <input
                className="tc-input"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                required
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

          <button className="tc-btn block primary-glow" type="submit" disabled={loading} style={{ marginTop: 8, padding: 12 }}>
            {loading ? "Authenticating…" : "Log in to Platform"}
          </button>
        </form>

        <div className="tc-auth-switch">
          Don't have an account? <Link to="/register">Create one now</Link>
        </div>
      </div>
    </div>
  );
}
