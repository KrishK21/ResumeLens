"use client";

import { useEffect, useState, useRef } from "react";
import { FlowState } from "@/lib/types";
import { uploadResume, tailorResume } from "@/lib/api";

const STEPS = [
  { icon: "▤", label: "Parsing resume structure" },
  { icon: "◈", label: "Extracting keywords from job description" },
  { icon: "⇄", label: "Matching against your experience" },
  { icon: "✎", label: "Rewriting bullet points" },
  { icon: "▦", label: "Fitting to one page" },
];

export default function ProcessingScreen({
  flow,
  setFlow,
  resumeFile,
  onDone,
  onError,
}: {
  flow: FlowState;
  setFlow: (f: Partial<FlowState>) => void;
  resumeFile: File | null;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const [active, setActive] = useState(0);
  const [pulse, setPulse] = useState(true);
  const started = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setPulse((p) => !p), 600);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // Hard guard: only ever run this once, even across React's dev double-invoke.
    if (started.current) return;
    started.current = true;

    (async () => {
      try {
        if (!resumeFile) throw new Error("No resume uploaded. Go back and add your resume.");

        console.log("[ResumeLens] uploading resume…");
        setActive(0);
        const up = await uploadResume(resumeFile);
        console.log("[ResumeLens] upload result:", up);

        if (up.unsupported_layout) {
          throw new Error(
            up.note || "That resume layout isn't editable yet. Try a standard Word resume."
          );
        }
        if (!up.bullets || up.bullets.length === 0) {
          throw new Error("No editable experience bullets were found in that resume.");
        }

        console.log("[ResumeLens] tailoring…");
        setActive(1);
        const tailor = await tailorResume(up.session_id, flow.jobDescription);
        console.log("[ResumeLens] tailor result:", tailor);

        // Commit the data to shared state BEFORE advancing to review.
        setFlow({
          sessionId: up.session_id,
          jobTitleDetected: tailor.job_title,
          keywords: tailor.keywords,
          gaps: tailor.gaps,
          rewrites: tailor.rewrites,
        });
        console.log("[ResumeLens] data committed, walking animation…");

        // Visual polish: walk the remaining stages, then finish.
        setActive(2);
        await delay(350);
        console.log("[ResumeLens] step 3");
        setActive(3);
        await delay(350);
        console.log("[ResumeLens] step 4");
        setActive(4);
        await delay(350);
        console.log("[ResumeLens] step 5");
        setActive(STEPS.length);
        await delay(500);

        console.log("[ResumeLens] done, moving to review");
        onDone();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Something went wrong.";
        console.error("[ResumeLens] processing error:", msg);
        onError(msg);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run exactly once on mount

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

      <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 13.5 }}>
        {STEPS.map((s, i) => {
          const isDone = i < active;
          const isActive = i === active && active < STEPS.length;
          const visible = i <= active;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 0",
                borderBottom: i < STEPS.length - 1 ? "0.5px solid #1A1D17" : "none",
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
              <span style={{ flex: 1, color: isDone ? "var(--rl-text-dim)" : "#D8D4CC" }}>
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

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}