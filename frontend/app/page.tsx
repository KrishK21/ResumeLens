"use client";

import { useState } from "react";
import { Step, FlowState, emptyFlow } from "@/lib/types";
import Shell from "./components/Shell";
import EntryScreen from "./components/EntryScreen";
import ProcessingScreen from "./components/ProcessingScreen";

export default function Home() {
  const [step, setStep] = useState<Step>("entry");
  const [flow, setFlowState] = useState<FlowState>(emptyFlow);

  // Merge helper so children can update just the fields they own.
  const setFlow = (patch: Partial<FlowState>) =>
    setFlowState((prev) => ({ ...prev, ...patch }));

  return (
    <Shell step={step}>
      {step === "entry" && (
        <EntryScreen
          flow={flow}
          setFlow={setFlow}
          onContinue={() => setStep("processing")}
        />
      )}

      {step === "processing" && (
        <ProcessingScreen flow={flow} onDone={() => setStep("review")} />
      )}

      {step === "review" && (
        <div style={{ padding: "52px 48px 56px" }}>
          <h1 style={{ fontSize: 26, fontWeight: 500, margin: "0 0 12px" }}>
            Review coming next
          </h1>
          <p style={{ color: "var(--rl-text-dim)", fontSize: 15, lineHeight: 1.6 }}>
            Screen 3 (bullet review + download) is the next build step. The flow
            works: entry → processing → here.
          </p>
          <button
            onClick={() => setStep("entry")}
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