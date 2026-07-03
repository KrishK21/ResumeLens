"use client";

import { FlowState } from "@/lib/types";

export default function EntryScreen({
  flow,
  setFlow,
  onContinue,
}: {
  flow: FlowState;
  setFlow: (f: Partial<FlowState>) => void;
  onContinue: () => void;
}) {
  const canContinue =
    flow.jobTitle.trim().length > 0 && flow.jobDescription.trim().length >= 20;

  return (
    <div style={{ padding: "44px 48px 48px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <span
          style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--rl-accent)" }}
        />
        <span
          style={{
            color: "var(--rl-accent-dim)",
            fontSize: 12,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Target role
        </span>
      </div>

      <h1
        style={{
          fontSize: 30,
          fontWeight: 500,
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
          margin: "0 0 8px",
        }}
      >
        What are you applying for?
      </h1>
      <p
        style={{
          color: "var(--rl-text-dim)",
          fontSize: 15,
          lineHeight: 1.6,
          margin: "0 0 32px",
          maxWidth: 440,
        }}
      >
        Paste the job description below. ResumeLens reads what the role wants and
        reshapes your real experience to match — never inventing anything.
      </p>

      <label
        style={{
          display: "block",
          color: "var(--rl-text-label)",
          fontSize: 13,
          marginBottom: 8,
        }}
      >
        Job title
      </label>
      <input
        type="text"
        value={flow.jobTitle}
        onChange={(e) => setFlow({ jobTitle: e.target.value })}
        placeholder="Backend Software Engineer"
        style={{
          width: "100%",
          boxSizing: "border-box",
          background: "var(--rl-surface)",
          border: "0.5px solid var(--rl-border)",
          borderRadius: 10,
          padding: "13px 15px",
          color: "var(--rl-text)",
          fontSize: 15,
          fontFamily: "inherit",
          marginBottom: 24,
          outline: "none",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <label style={{ color: "var(--rl-text-label)", fontSize: 13 }}>
          Job description
        </label>
        <span style={{ color: "var(--rl-text-muted)", fontSize: 12 }}>
          {flow.jobDescription.length.toLocaleString()} characters
        </span>
      </div>
      <textarea
        value={flow.jobDescription}
        onChange={(e) => setFlow({ jobDescription: e.target.value })}
        placeholder="Paste the full job description here…"
        style={{
          width: "100%",
          boxSizing: "border-box",
          minHeight: 200,
          background: "var(--rl-surface)",
          border: "0.5px solid var(--rl-border)",
          borderRadius: 10,
          padding: 15,
          color: "#D8D4CC",
          fontSize: 14,
          lineHeight: 1.65,
          fontFamily: "inherit",
          resize: "none",
          outline: "none",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 32,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "var(--rl-text-muted)",
            fontSize: 13,
          }}
        >
          <span aria-hidden="true">🔒</span>
          <span>Your resume stays private</span>
        </div>
        <button
          onClick={onContinue}
          disabled={!canContinue}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            background: canContinue ? "var(--rl-accent)" : "var(--rl-surface)",
            border: canContinue ? "none" : "0.5px solid var(--rl-border)",
            borderRadius: 10,
            padding: "13px 22px",
            color: canContinue ? "var(--rl-on-accent)" : "var(--rl-text-muted)",
            fontSize: 14,
            fontWeight: 500,
            cursor: canContinue ? "pointer" : "not-allowed",
            fontFamily: "inherit",
            transition: "background 0.15s ease",
          }}
        >
          Continue
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}