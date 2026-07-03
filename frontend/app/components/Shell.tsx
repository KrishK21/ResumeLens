"use client";

import { Step } from "@/lib/types";

const STEP_NUM: Record<string, number> = { entry: 1, processing: 2, review: 3 };

export default function Shell({
  step,
  onProfileClick,
  children,
}: {
  step: Step | "profile";
  onProfileClick?: () => void;
  children: React.ReactNode;
}) {
  const isProfile = step === "profile";

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
            <span style={{ fontSize: 15, fontWeight: 500, letterSpacing: "-0.01em" }}>ResumeLens</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {!isProfile && (
              <span style={{ color: "var(--rl-text-muted)", fontSize: 13 }}>
                Step {STEP_NUM[step]} of 3
              </span>
            )}
            <button
              onClick={onProfileClick}
              aria-label="Open profile"
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: isProfile ? "rgba(127,168,140,0.15)" : "var(--rl-surface)",
                border: `0.5px solid ${isProfile ? "var(--rl-accent)" : "var(--rl-border)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--rl-accent)",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              KK
            </button>
          </div>
        </div>

        {children}
      </div>
    </main>
  );
}
