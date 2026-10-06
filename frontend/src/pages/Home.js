import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TrustBadge from "../components/TrustBadge";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Interactive Role Explorer State
  const [activeRoleTab, setActiveRoleTab] = useState("user");

  // FAQ Accordion state
  const [expandedFaq, setExpandedFaq] = useState(0);

  const faqItems = [
    {
      q: "How does TrustChain guarantee worker verification?",
      a: "Every worker must upload government-issued identification. Our admin team verifies documents in real-time using live Socket.io notifications. Workers receive an immutable Trust Seal badge only after approval.",
    },
    {
      q: "How is the Trust Score calculated?",
      a: "The Trust Score (0-100) dynamically combines admin KYC verification status, verified customer star ratings, and total successfully completed bookings.",
    },
    {
      q: "Is messaging and job status updated in real time?",
      a: "Yes! Powered by Socket.io web sockets, chat messages, typing indicators, job acceptance, and status transitions occur instantly without needing page refreshes.",
    },
    {
      q: "Can I sign up as both a Customer and a TC Worker?",
      a: "You can register with separate accounts or test both workflows easily. Customer accounts let you browse & hire, while TC Worker accounts allow you to submit KYC and accept job requests.",
    },
  ];

  return (
    <div className="tc-landing">
      {/* Sticky Header Navbar */}
      <header className="tc-landing-header">
        <div className="tc-header-container">
          <Link to="/" className="tc-logo">
            <span className="tc-logo-badge">✓</span>
            <span>TrustChain</span>
          </Link>


          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {user ? (
              <Link to={`/${user.role}/dashboard`} className="tc-btn primary-glow">
                Dashboard ({user.name}) →
              </Link>
            ) : (
              <>
                <Link to="/login" className="tc-btn secondary">
                  Log In
                </Link>
                <Link to="/register" className="tc-btn primary-glow">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="features" className="tc-hero">
        <div className="tc-hero-container">
          <div>
            <div className="tc-hero-pill">
              <span className="tc-live-dot" /> Real-Time Socket.io Verification Platform
            </div>

            <h1 className="tc-hero-title">
              Hire Verified <span>TC Workers</span> with Uncompromising Trust
            </h1>

            <p className="tc-hero-desc">
              TrustChain bridges the gap between customers and skilled TC Workers through
              instant background verification, dynamic trust scoring, and real-time live updates.
            </p>

            <div className="tc-hero-cta">
              <button
                className="tc-btn primary-glow"
                style={{ padding: "14px 28px", fontSize: 16 }}
                onClick={() => navigate(user ? `/${user.role}/dashboard` : "/register")}
              >
                {user ? "Go to Dashboard" : "Find Verified TC Workers"}
              </button>
              <button
                className="tc-btn secondary"
                style={{ padding: "14px 24px", fontSize: 16 }}
                onClick={() => navigate("/register")}
              >
                Join as TC Worker
              </button>
            </div>
          </div>

          {/* Hero Preview Card */}
          <div className="tc-hero-widget">
            <span className="tc-hero-widget-badge">LIVE DEMO PREVIEW</span>

            <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 20 }}>
              <div className="tc-avatar" style={{ width: 52, height: 52, fontSize: 18 }}>
                AR
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18, color: "var(--tc-navy)" }}>
                  Alex Rivera
                </div>
                <div style={{ fontSize: 13, color: "var(--tc-muted)" }}>
                  Master Electrician & Automation
                </div>
              </div>
            </div>

            <div
              style={{
                background: "#f8fafc",
                borderRadius: "var(--tc-radius-md)",
                padding: "16px",
                border: "1px solid var(--tc-line)",
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--tc-muted)" }}>
                  Verification Status
                </span>
                <TrustBadge status="verified" />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--tc-muted)" }}>
                  Platform Rating
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#d97706" }}>
                  ★ 4.9 <span style={{ color: "var(--tc-muted)", fontWeight: 400 }}>(42 reviews)</span>
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--tc-muted)" }}>
                  Dynamic Trust Score
                </span>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "var(--tc-verified)",
                    fontFamily: "var(--tc-font-mono)",
                  }}
                >
                  98 / 100
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="tc-btn block success"
                onClick={() => navigate(user ? "/user/dashboard" : "/login")}
              >
                Book Instantly
              </button>
              <button
                className="tc-btn secondary"
                onClick={() => navigate(user ? "/chat" : "/login")}
              >
                Live Chat
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats Row */}
      <section className="tc-stats-bar">
        <div className="tc-stats-container">
          <div>
            <div className="tc-stats-num">100%</div>
            <div className="tc-stats-lbl">Verified ID Background Checks</div>
          </div>
          <div>
            <div className="tc-stats-num">&lt; 2 min</div>
            <div className="tc-stats-lbl">Instant Live KYC Notification Pushes</div>
          </div>
          <div>
            <div className="tc-stats-num">4.9 / 5</div>
            <div className="tc-stats-lbl">Average Customer Rating</div>
          </div>
          <div>
            <div className="tc-stats-num">0 Refresh</div>
            <div className="tc-stats-lbl">Socket.io Real-Time Data Sync</div>
          </div>
        </div>
      </section>

      {/* Role Explorer */}
      <section id="how-it-works" className="tc-section" style={{ background: "#ffffff", borderRadius: "var(--tc-radius-lg)", border: "1px solid var(--tc-line)" }}>
        <div className="tc-section-header">
          <div className="tc-section-tag">Role-Based Workflows</div>
          <h2 className="tc-section-title">Designed for Everyone</h2>
          <p className="tc-section-sub">
            TrustChain seamlessly connects Customers, TC Workers, and Platform Administrators in a unified real-time ecosystem.
          </p>
        </div>

        <div className="tc-role-tabs">
          <button
            className={`tc-role-btn ${activeRoleTab === "user" ? "active" : ""}`}
            onClick={() => setActiveRoleTab("user")}
          >
            For Customers
          </button>
          <button
            className={`tc-role-btn ${activeRoleTab === "worker" ? "active" : ""}`}
            onClick={() => setActiveRoleTab("worker")}
          >
            For TC Workers
          </button>
          <button
            className={`tc-role-btn ${activeRoleTab === "admin" ? "active" : ""}`}
            onClick={() => setActiveRoleTab("admin")}
          >
            For Admins
          </button>
        </div>

        <div className="tc-role-card">
          <div>
            {activeRoleTab === "user" && (
              <>
                <h3 style={{ fontSize: 24, color: "var(--tc-navy)", marginBottom: 14 }}>
                  1. Find & Hire Verified Experts
                </h3>
                <ul style={{ paddingLeft: 20, color: "var(--tc-muted)", fontSize: 15, lineHeight: 1.8 }}>
                  <li>Search TC Workers by category, skills, rating, and transparent trust score.</li>
                  <li>Send job requests with price proposals and custom project details.</li>
                  <li>Chat live with workers using instant messaging and typing indicators.</li>
                  <li>Rate and review completed jobs to update the worker's trust score live.</li>
                </ul>
                <button
                  className="tc-btn primary-glow"
                  style={{ marginTop: 20 }}
                  onClick={() => navigate("/register")}
                >
                  Join as a Customer →
                </button>
              </>
            )}

            {activeRoleTab === "worker" && (
              <>
                <h3 style={{ fontSize: 24, color: "var(--tc-navy)", marginBottom: 14 }}>
                  2. Verify KYC & Receive Job Requests
                </h3>
                <ul style={{ paddingLeft: 20, color: "var(--tc-muted)", fontSize: 15, lineHeight: 1.8 }}>
                  <li>Register your profile and upload government ID for instant KYC review.</li>
                  <li>Receive real-time push alerts when customers request your services.</li>
                  <li>Manage job stages: Accepted → In Progress → Completed.</li>
                  <li>Build an immutable digital trust reputation that wins high-value jobs.</li>
                </ul>
                <button
                  className="tc-btn primary-glow"
                  style={{ marginTop: 20 }}
                  onClick={() => navigate("/register")}
                >
                  Register as TC Worker →
                </button>
              </>
            )}

            {activeRoleTab === "admin" && (
              <>
                <h3 style={{ fontSize: 24, color: "var(--tc-navy)", marginBottom: 14 }}>
                  3. Live Overview & KYC Moderation
                </h3>
                <ul style={{ paddingLeft: 20, color: "var(--tc-muted)", fontSize: 15, lineHeight: 1.8 }}>
                  <li>Inspect uploaded government documents in a real-time review queue.</li>
                  <li>Approve or reject KYC submissions with 1-click live socket pushes.</li>
                  <li>Monitor overall platform job activity, total users, and trust ratings.</li>
                  <li>Manage user status (Activate / Deactivate) for ecosystem security.</li>
                </ul>
                <button
                  className="tc-btn secondary"
                  style={{ marginTop: 20 }}
                  onClick={() => navigate("/login")}
                >
                  Log in to Admin Panel →
                </button>
              </>
            )}
          </div>

          <div
            style={{
              background: "var(--tc-paper)",
              padding: 24,
              borderRadius: "var(--tc-radius-md)",
              border: "1px solid var(--tc-line)",
              fontFamily: "var(--tc-font-mono)",
              fontSize: 13,
            }}
          >
            <div style={{ color: "var(--tc-accent)", fontWeight: 700, marginBottom: 12 }}>
              {/* SOCKET.IO LIVE EVENT LOG */}
            </div>
            <div style={{ color: "var(--tc-muted)", lineHeight: 1.8 }}>
              {activeRoleTab === "user" && (
                <>
                  <div>&gt; Customer filters verified plumbers...</div>
                  <div>&gt; Emitting job_request to Worker#204...</div>
                  <div style={{ color: "var(--tc-verified)" }}>&gt; STATUS: Accepted (0.12s)</div>
                  <div>&gt; Chat socket connected. Socket ID: k9x_29a</div>
                </>
              )}
              {activeRoleTab === "worker" && (
                <>
                  <div>&gt; Worker uploaded ID Document (passport.jpg)...</div>
                  <div>&gt; Notification pushed to Admin Queue...</div>
                  <div style={{ color: "var(--tc-verified)" }}>&gt; KYC Approved! Trust Seal Issued ✓</div>
                  <div>&gt; Live Trust Score recalculated: 96/100</div>
                </>
              )}
              {activeRoleTab === "admin" && (
                <>
                  <div>&gt; Admin logged in. Overview metrics synced.</div>
                  <div>&gt; Received kyc_submit event from Worker#108</div>
                  <div style={{ color: "var(--tc-verified)" }}>&gt; Admin approved KYC document</div>
                  <div>&gt; Socket emit kyc_decision -&gt; Worker#108</div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="tc-section" style={{ background: "#ffffff", borderRadius: "var(--tc-radius-lg)", border: "1px solid var(--tc-line)" }}>
        <div className="tc-section-header">
          <div className="tc-section-tag">Got Questions?</div>
          <h2 className="tc-section-title">Frequently Asked Questions</h2>
          <p className="tc-section-sub">
            Learn more about how TrustChain safeguards work transactions and worker credentials.
          </p>
        </div>

        <div className="tc-faq-container">
          {faqItems.map((item, idx) => (
            <div key={idx} className="tc-faq-item">
              <div
                className="tc-faq-question"
                onClick={() => setExpandedFaq(expandedFaq === idx ? -1 : idx)}
              >
                <span>{item.q}</span>
                <span style={{ fontSize: 18, color: "var(--tc-accent)", fontWeight: 700 }}>
                  {expandedFaq === idx ? "−" : "+"}
                </span>
              </div>
              {expandedFaq === idx && <div className="tc-faq-answer">{item.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="tc-footer">
        <div className="tc-footer-grid" style={{ gridTemplateColumns: "2fr 1fr 1fr" }}>
          <div>
            <div className="tc-logo" style={{ color: "#fff", marginBottom: 16 }}>
              <span className="tc-logo-badge">✓</span>
              <span>TrustChain</span>
            </div>
            <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: 14, maxWidth: 320, lineHeight: 1.6 }}>
              The real-time TC Worker verification platform engineered for transparency, safety, and instant trust.
            </p>
          </div>

          <div>
            <h4 style={{ color: "#fff", fontSize: 15, marginBottom: 14 }}>Navigation</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#faq">FAQ</a>
            </div>
          </div>

          <div>
            <h4 style={{ color: "#fff", fontSize: 15, marginBottom: 14 }}>Account</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
              <Link to="/login">Log In</Link>
              <Link to="/register">Register Account</Link>
              <Link to="/user/dashboard">Customer Portal</Link>
              <Link to="/worker/dashboard">TC Worker Portal</Link>
            </div>
          </div>
        </div>

        <div className="tc-footer-bottom">
          <div>© {new Date().getFullYear()} TrustChain Platform. All rights reserved.</div>
          <div>Real-time Verification • Socket.io Enabled</div>
        </div>
      </footer>
    </div>
  );
}
