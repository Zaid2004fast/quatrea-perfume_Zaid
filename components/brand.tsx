import type { CSSProperties } from "react";

/**
 * The Quatréa wordmark. The acute accent over the É is drawn as a quarter of
 * the season circle — the house symbol hidden inside its own name.
 */
export function Wordmark({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <span className={`wordmark ${className}`} style={style} aria-label="Quatréa">
      <span aria-hidden>QUATR</span>
      <span className="wordmark-e" aria-hidden>
        E
        <svg viewBox="0 0 12 12" className="wordmark-acc">
          <path d="M1 11 A10 10 0 0 1 11 1" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
      <span aria-hidden>A</span>
    </span>
  );
}

/** The four-quarter season mark. `active` fills one quarter; `progress` (0-1) draws the ring. */
export function SeasonMark({ active = -1, size = 22, stroke = 1, className = "", fillAll = false, style }: { active?: number; size?: number; stroke?: number; className?: string; fillAll?: boolean; style?: CSSProperties }) {
  // quarters clockwise from top-left: spring, summer, autumn, winter
  const quads = ["M12 12 L12 2 A10 10 0 0 0 2 12 Z", "M12 12 L22 12 A10 10 0 0 0 12 2 Z", "M12 12 L12 22 A10 10 0 0 0 22 12 Z", "M12 12 L2 12 A10 10 0 0 0 12 22 Z"];
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={`season-mark ${className}`} style={style} aria-hidden>
      {quads.map((d, i) => (
        <path key={i} d={d} fill="currentColor" style={{ opacity: fillAll || i === active ? 1 : 0, transition: "opacity .8s cubic-bezier(.16,1,.3,1)" }} />
      ))}
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth={stroke} />
      <path d="M2 12 H22 M12 2 V22" stroke="currentColor" strokeWidth={stroke * 0.9} />
    </svg>
  );
}

export function Arrow({ className = "arrow" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 12" className={className} fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
      <path d="M0 6 H22 M17 1 L22 6 L17 11" />
    </svg>
  );
}
