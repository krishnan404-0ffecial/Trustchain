const LABELS = {
  verified: "Verified",
  pending: "Pending",
  rejected: "Rejected",
  not_submitted: "Unverified",
};
const ICONS = {
  verified: "✓",
  pending: "…",
  rejected: "✕",
  not_submitted: "–",
};

export default function TrustBadge({ status = "not_submitted" }) {
  const key = LABELS[status] ? status : "not_submitted";
  return (
    <span className={`trust-seal ${key}`}>
      <span className="ring">{ICONS[key]}</span>
      {LABELS[key]}
    </span>
  );
}
