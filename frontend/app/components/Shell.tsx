"use client";

import { Step } from "@/lib/types";

const STEP_NUM: Record<Step, number> = { entry: 1, processing: 2, review: 3 };

export default function Shell({
  step,
  children,
}: {
  step: Step;
  children: React.ReactNode;
}) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 680,
          background: "var(--rl-bg)",
          border: "0.5px solid var(--rl-border)",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: "0.5px solid var(--rl-border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 7,
                background: "var(--rl-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--rl-on-accent)",
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              ◎
            </div>
            <span style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.01em" }}>
              ResumeLens
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span style={{ color: "var(--rl-text-muted)", fontSize: 13 }}>
              Step {STEP_NUM[step]} of 3
            </span>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "var(--rl-surface)",
                border: "0.5px solid var(--rl-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--rl-accent)",
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              KK
            </div>
          </div>
        </div>

        {children}
      </div>
    </main>
  );
}