"use client";

import { useState } from "react";
import { Step, FlowState, emptyFlow } from "@/lib/types";
import Shell from "./components/Shell";
import EntryScreen from "./components/EntryScreen";
import ProcessingScreen from "./components/ProcessingScreen";

export default function Home() {
  const [step, setStep] = useState<Step>("entry");
  const [flow, setFlowState] = useState<FlowState>(emptyFlow);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const setFlow = (patch: Partial<FlowState>) =>
    setFlowState((prev) => ({ ...prev, ...patch }));

  function handleError(msg: string) {
    setError(msg);
    setStep("entry");
  }

  return (
    <Shell step={step}>
      {step === "entry" && (
        <>
          {error && (
            <div
              style={{
                margin: "24px 48px 0",
                padding: "12px 15px",
                background: "rgba(217,138,126,0.08)",
                border: "0.5px solid rgba(217,138,126,0.3)",
                borderRadius: 10,
                color: "#D98A7E",
                fontSize: 13.5,
              }}
            >
              {error}
            </div>
          )}
          <EntryScreen
            flow={flow}
            setFlow={setFlow}
            resumeFile={resumeFile}
            setResumeFile={(f) => {
              setResumeFile(f);
              setError("");
            }}
            onContinue={() => {
              setError("");
              setStep("processing");
            }}
          />
        </>
      )}

      {step === "processing" && (
        <ProcessingScreen
          flow={flow}
          setFlow={setFlow}
          resumeFile={resumeFile}
          onDone={() => setStep("review")}
          onError={handleError}
        />
      )}

      {step === "review" && (
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
              Review
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 500, margin: "0 0 8px" }}>
            {flow.rewrites.length} bullets tailored
          </h1>
          <p style={{ color: "var(--rl-text-dim)", fontSize: 15, margin: "0 0 24px" }}>
            Detected role: {flow.jobTitleDetected || "—"} · {flow.gaps.length} keyword
            gap{flow.gaps.length === 1 ? "" : "s"} found
          </p>

          {/* Temporary raw preview so we can confirm real data arrived.
              The full review UI (tone toggles, edit, fit buttons, download)
              is the next build step. */}
          <div
            style={{
              maxHeight: 320,
              overflowY: "auto",
              border: "0.5px solid var(--rl-border)",
              borderRadius: 10,
              padding: 16,
            }}
          >
            {flow.rewrites.map((r) => (
              <div key={r.index} style={{ marginBottom: 18 }}>
                <div style={{ color: "var(--rl-text-muted)", fontSize: 12, marginBottom: 4 }}>
                  Original
                </div>
                <div style={{ color: "var(--rl-text-dim)", fontSize: 13, marginBottom: 8 }}>
                  {r.original}
                </div>
                <div style={{ color: "var(--rl-accent-dim)", fontSize: 12, marginBottom: 4 }}>
                  Balanced rewrite
                </div>
                <div style={{ color: "var(--rl-text)", fontSize: 13.5 }}>{r.balanced}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setStep("entry");
              setFlowState(emptyFlow);
              setResumeFile(null);
            }}
            style={{
              marginTop: 24,
              background: "var(--rl-surface)",
              border: "0.5px solid var(--rl-border)",
              borderRadius: 10,
              padding: "11px 18px",
              color: "var(--rl-text)",
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            ← Start over
          </button>
        </div>
      )}
    </Shell>
  );
}