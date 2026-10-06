import { useState } from "react";

export default function RatingStars({ value = 0, onChange, readOnly = false, size = 18 }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={() => !readOnly && onChange?.(n)}
          onMouseEnter={() => !readOnly && setHover(n)}
          onMouseLeave={() => !readOnly && setHover(0)}
          style={{
            cursor: readOnly ? "default" : "pointer",
            fontSize: size,
            color: n <= active ? "var(--tc-pending)" : "var(--tc-line)",
            lineHeight: 1,
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}
