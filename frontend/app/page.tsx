"use client";

import { useState } from "react";
import { Step, FlowState, emptyFlow } from "@/lib/types";
import Shell from "./components/Shell";
import EntryScreen from "./components/EntryScreen";
import ProcessingScreen from "./components/ProcessingScreen";
import ReviewScreen from "./components/ReviewScreen";

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

  function reset() {
    setStep("entry");
    setFlowState(emptyFlow);
    setResumeFile(null);
    setError("");
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

      {step === "review" && <ReviewScreen flow={flow} onStartOver={reset} />}
    </Shell>
  );
}