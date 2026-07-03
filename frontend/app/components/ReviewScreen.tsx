"use client";

import { useState } from "react";
import { FlowState, FitMode, Tone } from "@/lib/types";
import { exportResume } from "@/lib/api";

export default function ReviewScreen({
  flow,
  onStartOver,
}: {
  flow: FlowState;
  onStartOver: () => void;
}) {
  const [fitMode, setFitMode] = useState<FitMode>("compact");
  const [tone, setTone] = useState<Tone>("balanced");
  const [format, setFormat] = useState<"pdf" | "docx">("pdf");
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [showGaps, setShowGaps] = useState(false);

  async function handleDownload() {
    if (!flow.sessionId) {
      setError("Session expired. Start over to re-upload your resume.");
      return;
    }
    setDownloading(true);
    setError("");
    try {
      const blob = await exportResume({
        sessionId: flow.sessionId,
        defaultTone: tone,
        choices: [], // pass 1 = auto mode; per-bullet choices come in pass 2
        format,
        onePage: fitMode !== "none",
        fitMode: fitMode === "none" ? "enhanced" : fitMode,
      });
      // Trigger a browser download.
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume_tailored.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed. Try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div style={{ padding: "44px 48px 48px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--rl-accent)" }} />
        <span
          style={{
            color: "var(--rl-accent-dim)",
            fontSize: 12,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Review and download
        </span>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em", margin: "0 0 8px" }}>
        {flow.rewrites.length} bullets tailored
      </h1>
      <p style={{ color: "var(--rl-text-dim)", fontSize: 15, margin: "0 0 28px" }}>
        {flow.jobTitleDetected ? `Matched to ${flow.jobTitleDetected}. ` : ""}
        Your experience, rephrased to surface what this role scans for.
      </p>

      {/* Fit mode */}
      <label style={{ display: "block", color: "var(--rl-text-label)", fontSize: 13, marginBottom: 10 }}>
        Page fit
      </label>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {([
          ["compact", "Compact", "Fits everything, shorter bullets"],
          ["enhanced", "Enhanced", "Fuller bullets, trim if needed"],
          ["none", "No limit", "Natural length"],
        ] as [FitMode, string, string][]).map(([val, label, hint]) => {
          const selected = fitMode === val;
          return (
            <button
              key={val}
              onClick={() => setFitMode(val)}
              style={{
                flex: 1,
                textAlign: "left",
                background: selected ? "rgba(127,168,140,0.1)" : "var(--rl-surface)",
                border: `1px solid ${selected ? "var(--rl-accent)" : "var(--rl-border)"}`,
                borderRadius: 10,
                padding: "12px 14px",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "border-color 0.15s ease, background 0.15s ease",
              }}
            >
              <div
                style={{
                  color: selected ? "var(--rl-accent)" : "var(--rl-text)",
                  fontSize: 14,
                  fontWeight: 500,
                  marginBottom: 3,
                }}
              >
                {label}
              </div>
              <div style={{ color: "var(--rl-text-muted)", fontSize: 11.5, lineHeight: 1.35 }}>
                {hint}
              </div>
            </button>
          );
        })}
      </div>

      {/* Tone + format row */}
      <div style={{ display: "flex", gap: 24, marginBottom: 28 }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", color: "var(--rl-text-label)", fontSize: 13, marginBottom: 10 }}>
            Rewrite style
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {(["conservative", "balanced"] as Tone[]).map((t) => {
              const selected = tone === t;
              return (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  style={{
                    flex: 1,
                    background: selected ? "rgba(127,168,140,0.1)" : "var(--rl-surface)",
                    border: `1px solid ${selected ? "var(--rl-accent)" : "var(--rl-border)"}`,
                    borderRadius: 10,
                    padding: "10px 12px",
                    cursor: "pointer",
                    color: selected ? "var(--rl-accent)" : "var(--rl-text)",
                    fontSize: 13.5,
                    fontWeight: 500,
                    fontFamily: "inherit",
                    textTransform: "capitalize",
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ display: "block", color: "var(--rl-text-label)", fontSize: 13, marginBottom: 10 }}>
            Format
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {(["pdf", "docx"] as ("pdf" | "docx")[]).map((f) => {
              const selected = format === f;
              return (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  style={{
                    flex: 1,
                    background: selected ? "rgba(127,168,140,0.1)" : "var(--rl-surface)",
                    border: `1px solid ${selected ? "var(--rl-accent)" : "var(--rl-border)"}`,
                    borderRadius: 10,
                    padding: "10px 12px",
                    cursor: "pointer",
                    color: selected ? "var(--rl-accent)" : "var(--rl-text)",
                    fontSize: 13.5,
                    fontWeight: 500,
                    fontFamily: "inherit",
                    textTransform: "uppercase",
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Keyword gaps (collapsible) */}
      {flow.gaps.length > 0 && (
        <div
          style={{
            border: "0.5px solid var(--rl-border)",
            borderRadius: 10,
            padding: "14px 16px",
            marginBottom: 28,
          }}
        >
          <div
            onClick={() => setShowGaps((s) => !s)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
            }}
          >
            <span style={{ color: "var(--rl-text)", fontSize: 13.5 }}>
              {flow.gaps.length} keyword{flow.gaps.length === 1 ? "" : "s"} the job wants that
              aren&apos;t on your resume
            </span>
            <span style={{ color: "var(--rl-text-muted)", fontSize: 13 }}>
              {showGaps ? "Hide" : "Show"}
            </span>
          </div>
          {showGaps && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
              {flow.gaps.map((g) => (
                <span
                  key={g}
                  style={{
                    fontSize: 12,
                    color: "var(--rl-text-dim)",
                    background: "var(--rl-surface)",
                    border: "0.5px solid var(--rl-border)",
                    borderRadius: 6,
                    padding: "4px 9px",
                  }}
                >
                  {g}
                </span>
              ))}
            </div>
          )}
          <p style={{ color: "var(--rl-text-muted)", fontSize: 11.5, margin: "10px 0 0", lineHeight: 1.5 }}>
            ResumeLens won&apos;t invent these. Add them yourself only if they&apos;re true.
          </p>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "12px 15px",
            background: "rgba(217,138,126,0.08)",
            border: "0.5px solid rgba(217,138,126,0.3)",
            borderRadius: 10,
            color: "#D98A7E",
            fontSize: 13.5,
            marginBottom: 20,
          }}
        >
          {error}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          onClick={onStartOver}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--rl-text-muted)",
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "inherit",
            padding: "8px 0",
          }}
        >
          ← Start over
        </button>
        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            background: "var(--rl-accent)",
            border: "none",
            borderRadius: 10,
            padding: "13px 24px",
            color: "var(--rl-on-accent)",
            fontSize: 14,
            fontWeight: 500,
            cursor: downloading ? "wait" : "pointer",
            fontFamily: "inherit",
            opacity: downloading ? 0.7 : 1,
          }}
        >
          {downloading ? "Building…" : "Download resume"}
          {!downloading && <span aria-hidden="true">↓</span>}
        </button>
      </div>
    </div>
  );
}