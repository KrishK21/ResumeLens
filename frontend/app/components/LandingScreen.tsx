"use client";

import { Focus, ArrowRight, FileText, ShieldCheck, PenLine } from "lucide-react";

export default function LandingScreen({
  onStart,
  onSignIn,
}: {
  onStart: () => void;
  onSignIn?: () => void;
}) {
  return (
    <div style={{ overflow: "hidden" }}>
      {/* Nav */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 32px",
          borderBottom: "0.5px solid var(--rl-border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: "var(--rl-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Focus size={16} color="var(--rl-on-accent)" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 500 }}>ResumeLens</span>
        </div>
        <button
          onClick={onSignIn}
          style={{
            background: "transparent",
            border: "0.5px solid var(--rl-border-hover)",
            borderRadius: 9,
            padding: "9px 18px",
            color: "var(--rl-text)",
            fontSize: 13.5,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Sign in
        </button>
      </div>

      {/* Hero */}
      <div style={{ padding: "72px 48px 56px", textAlign: "center", maxWidth: 620, margin: "0 auto" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: "var(--rl-surface)",
            border: "0.5px solid var(--rl-border)",
            borderRadius: 100,
            padding: "6px 14px",
            marginBottom: 28,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--rl-accent)" }} />
          <span style={{ color: "var(--rl-accent-dim)", fontSize: 12, letterSpacing: "0.03em" }}>
            Never invents experience you don&apos;t have
          </span>
        </div>

        <h1
          style={{
            fontFamily: "var(--rl-font-display)",
            fontSize: 52,
            fontWeight: 500,
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            color: "var(--rl-text)",
            margin: "0 0 20px",
          }}
        >
          Your real resume,
          <br />
          <span style={{ fontStyle: "italic", color: "var(--rl-accent)" }}>tuned</span> to every job.
        </h1>

        <p
          style={{
            color: "var(--rl-text-dim)",
            fontSize: 17,
            lineHeight: 1.6,
            margin: "0 auto 36px",
            maxWidth: 460,
          }}
        >
          Paste a job description. ResumeLens reshapes the bullet points you already have to surface
          what that role scans for — then hands you a clean, one-page copy.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "center" }}>
          <button
            onClick={onStart}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              background: "var(--rl-accent)",
              border: "none",
              borderRadius: 10,
              padding: "14px 26px",
              color: "var(--rl-on-accent)",
              fontSize: 15,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Tailor my resume
            <ArrowRight size={17} strokeWidth={2.2} />
          </button>
          <span style={{ color: "var(--rl-text-muted)", fontSize: 13.5 }}>No account needed to try</span>
        </div>
      </div>

      {/* Value props */}
      <div style={{ display: "flex", gap: 1, background: "var(--rl-border)", borderTop: "0.5px solid var(--rl-border)" }}>
        {[
          {
            Icon: FileText,
            title: "Keeps your format",
            body: "Edits your Word doc in place. Same fonts, same layout — only the bullets change.",
          },
          {
            Icon: ShieldCheck,
            title: "Tells the truth",
            body: "Rephrases only what you actually did. No invented skills, no fake metrics.",
          },
          {
            Icon: PenLine,
            title: "Reads clean",
            body: "Machine-readable text an AI screener can parse — fit to a single page.",
          },
        ].map(({ Icon, title, body }) => (
          <div key={title} style={{ flex: 1, background: "var(--rl-bg)", padding: "28px 24px" }}>
            <Icon size={20} color="var(--rl-accent)" strokeWidth={1.8} style={{ marginBottom: 12 }} />
            <div style={{ color: "var(--rl-text)", fontSize: 14.5, fontWeight: 500, marginBottom: 5 }}>
              {title}
            </div>
            <div style={{ color: "var(--rl-text-dim)", fontSize: 13, lineHeight: 1.5 }}>{body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
