"use client";

import { useEffect, useState, useRef } from "react";
import { FlowState } from "@/lib/types";

const STEPS = [
  { icon: "▤", label: "Parsing resume structure" },
  { icon: "◈", label: "Extracting keywords from job description" },
  { icon: "⇄", label: "Matching against your experience" },
  { icon: "✎", label: "Rewriting bullet points" },
  { icon: "▦", label: "Fitting to one page" },
];

export default function ProcessingScreen({
  flow,
  onDone,
}: {
  flow: FlowState;
  onDone: () => void;
}) {
  const [active, setActive] = useState(0); // index currently in progress
  const [done, setDone] = useState(false);
  const [pulse, setPulse] = useState(true);
  const calledDone = useRef(false);

  // Blink the status dot
  useEffect(() => {
    const t = setInterval(() => setPulse((p) => !p), 600);
    return () => clearInterval(t);
  }, []);

  // Advance through steps. (Placeholder timing; wired to the real API next step.)
  useEffect(() => {
    if (active >= STEPS.length) {
      setDone(true);
      if (!calledDone.current) {
        calledDone.current = true;
        const t = setTimeout(onDone, 700);
        return () => clearTimeout(t);
      }
      return;
    }
    const t = setTimeout(() => setActive((a) => a + 1), 1100);
    return () => clearTimeout(t);
  }, [active, onDone]);

  const progress = Math.round((Math.min(active, STEPS.length) / STEPS.length) * 100);

  return (
    <div style={{ padding: "52px 48px 56px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "var(--rl-accent)",
            opacity: pulse ? 1 : 0.3,
            transition: "opacity 0.4s ease",
          }}
        />
        <span
          style={{
            color: "var(--rl-accent-dim)",
            fontSize: 12,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Building your resume
        </span>
      </div>

      <h1
        style={{
          fontSize: 26,
          fontWeight: 500,
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
          margin: "0 0 40px",
        }}
      >
        Tailoring to{" "}
        <span style={{ color: "var(--rl-accent)" }}>
          {flow.jobTitle || "your target role"}
        </span>
      </h1>

      <div
        style={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontSize: 13.5,
        }}
      >
        {STEPS.map((s, i) => {
          const isDone = i < active;
          const isActive = i === active && !done;
          const visible = i <= active;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 0",
                borderBottom:
                  i < STEPS.length - 1 ? "0.5px solid #1A1D17" : "none",
                opacity: visible ? 1 : 0,
                transition: "opacity 0.5s ease",
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  color: isDone || isActive ? "var(--rl-accent)" : "#5A5E54",
                  width: 18,
                  textAlign: "center",
                }}
                aria-hidden="true"
              >
                {s.icon}
              </span>
              <span
                style={{
                  flex: 1,
                  color: isDone ? "var(--rl-text-dim)" : "#D8D4CC",
                }}
              >
                {s.label}
              </span>
              <span style={{ color: "var(--rl-accent)", minWidth: 20, textAlign: "right" }}>
                {isDone ? "✓" : isActive ? "···" : ""}
              </span>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 38,
          height: 3,
          background: "#1A1D17",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "var(--rl-accent)",
            borderRadius: 3,
            transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>
    </div>
  );
}