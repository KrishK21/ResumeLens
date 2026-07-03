"use client";

import { useState } from "react";
import { RewriteItem } from "@/lib/types";

export type BulletDecision = {
  index: number;
  tone: "conservative" | "balanced" | "original" | "custom";
  customText?: string;
};

export default function BulletCard({
  item,
  decision,
  onChange,
}: {
  item: RewriteItem;
  decision: BulletDecision;
  onChange: (d: BulletDecision) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(decision.customText ?? item.balanced);

  // The text currently chosen for this bullet, for the collapsed preview.
  const currentText =
    decision.tone === "custom"
      ? decision.customText ?? ""
      : decision.tone === "original"
      ? item.original
      : decision.tone === "conservative"
      ? item.conservative
      : item.balanced;

  function pick(tone: BulletDecision["tone"]) {
    onChange({ index: item.index, tone });
    if (tone === "custom") {
      setDraft(item.balanced);
      setEditing(true);
    } else {
      setEditing(false);
    }
  }

  function saveEdit() {
    onChange({ index: item.index, tone: "custom", customText: draft.trim() });
    setEditing(false);
  }

  const toneOptions: { key: BulletDecision["tone"]; label: string }[] = [
    { key: "conservative", label: "Conservative" },
    { key: "balanced", label: "Balanced" },
    { key: "original", label: "Original" },
  ];

  return (
    <div
      style={{
        border: "0.5px solid var(--rl-border)",
        borderRadius: 10,
        marginBottom: 10,
        overflow: "hidden",
      }}
    >
      {/* Collapsed header */}
      <div
        onClick={() => setExpanded((e) => !e)}
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          padding: "14px 16px",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: "var(--rl-accent)",
            background: "rgba(127,168,140,0.1)",
            border: "0.5px solid var(--rl-border)",
            borderRadius: 6,
            padding: "2px 7px",
            whiteSpace: "nowrap",
            marginTop: 1,
            textTransform: "capitalize",
          }}
        >
          {decision.tone}
        </span>
        <span style={{ flex: 1, fontSize: 13.5, color: "var(--rl-text)", lineHeight: 1.5 }}>
          {currentText}
        </span>
        <span style={{ color: "var(--rl-text-muted)", fontSize: 13, marginTop: 1 }}>
          {expanded ? "▲" : "▼"}
        </span>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div style={{ padding: "0 16px 16px", borderTop: "0.5px solid var(--rl-border)" }}>
          {/* Tone picker */}
          <div style={{ display: "flex", gap: 6, margin: "14px 0" }}>
            {toneOptions.map((t) => {
              const selected = decision.tone === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => pick(t.key)}
                  style={{
                    background: selected ? "rgba(127,168,140,0.12)" : "var(--rl-surface)",
                    border: `1px solid ${selected ? "var(--rl-accent)" : "var(--rl-border)"}`,
                    borderRadius: 8,
                    padding: "6px 12px",
                    color: selected ? "var(--rl-accent)" : "var(--rl-text-dim)",
                    fontSize: 12.5,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
            <button
              onClick={() => pick("custom")}
              style={{
                marginLeft: "auto",
                background: decision.tone === "custom" ? "rgba(127,168,140,0.12)" : "var(--rl-surface)",
                border: `1px solid ${decision.tone === "custom" ? "var(--rl-accent)" : "var(--rl-border)"}`,
                borderRadius: 8,
                padding: "6px 12px",
                color: decision.tone === "custom" ? "var(--rl-accent)" : "var(--rl-text-dim)",
                fontSize: 12.5,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Edit text
            </button>
          </div>

          {/* Custom editor OR the read-only comparison */}
          {editing ? (
            <div>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  minHeight: 90,
                  background: "var(--rl-surface)",
                  border: "0.5px solid var(--rl-accent)",
                  borderRadius: 8,
                  padding: 12,
                  color: "var(--rl-text)",
                  fontSize: 13,
                  lineHeight: 1.55,
                  fontFamily: "inherit",
                  resize: "vertical",
                  outline: "none",
                }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button
                  onClick={saveEdit}
                  style={{
                    background: "var(--rl-accent)",
                    border: "none",
                    borderRadius: 8,
                    padding: "7px 14px",
                    color: "var(--rl-on-accent)",
                    fontSize: 12.5,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Save edit
                </button>
                <button
                  onClick={() => setEditing(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--rl-text-muted)",
                    fontSize: 12.5,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Variant label="Original" text={item.original} muted />
              <Variant label="Conservative" text={item.conservative} />
              <Variant label="Balanced" text={item.balanced} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Variant({ label, text, muted }: { label: string; text: string; muted?: boolean }) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          color: muted ? "var(--rl-text-muted)" : "var(--rl-accent-dim)",
          marginBottom: 4,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 13, color: muted ? "var(--rl-text-muted)" : "var(--rl-text-dim)", lineHeight: 1.5 }}>
        {text}
      </div>
    </div>
  );
}