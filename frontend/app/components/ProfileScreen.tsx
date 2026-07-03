"use client";

import { useRef, useState, useEffect } from "react";
import { FitMode, Tone } from "@/lib/types";
import { ProfilePrefs } from "@/lib/useProfile";
import {
  getSavedResume,
  saveResumeToProfile,
  deleteSavedResume,
} from "@/lib/profileApi";

export default function ProfileScreen({
  profileId,
  prefs,
  updatePrefs,
  onBack,
}: {
  profileId: string | null;
  prefs: ProfilePrefs;
  updatePrefs: (p: Partial<ProfilePrefs>) => void;
  onBack: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [savedFilename, setSavedFilename] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!profileId) return;
    getSavedResume(profileId).then((s) => setSavedFilename(s.has_resume ? s.filename : null));
  }, [profileId]);

  async function handleFile(file: File | undefined) {
    if (!file || !profileId) return;
    if (!file.name.toLowerCase().endsWith(".docx")) {
      setMsg("Upload a Word .docx file.");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const res = await saveResumeToProfile(profileId, file);
      setSavedFilename(res.filename);
      setMsg("Resume saved to your profile.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not save resume.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    if (!profileId) return;
    await deleteSavedResume(profileId);
    setSavedFilename(null);
    setMsg("Resume removed.");
  }

  return (
    <div style={{ padding: "44px 48px 48px" }}>
      <button
        onClick={onBack}
        style={{
          background: "transparent",
          border: "none",
          color: "var(--rl-text-muted)",
          fontSize: 14,
          cursor: "pointer",
          fontFamily: "inherit",
          padding: 0,
          marginBottom: 24,
        }}
      >
        ← Back
      </button>

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
          Your profile
        </span>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em", margin: "0 0 8px" }}>
        Profile and defaults
      </h1>
      <p style={{ color: "var(--rl-text-dim)", fontSize: 15, margin: "0 0 32px", maxWidth: 460 }}>
        Save your resume once and set the defaults you like. You can change any of this anytime.
      </p>

      {/* Saved resume */}
      <label style={{ display: "block", color: "var(--rl-text-label)", fontSize: 13, marginBottom: 8 }}>
        Saved resume
      </label>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        style={{
          cursor: "pointer",
          background: "var(--rl-surface)",
          border: `1px dashed ${dragOver ? "var(--rl-accent)" : "var(--rl-border-hover)"}`,
          borderRadius: 10,
          padding: savedFilename ? "16px 18px" : "28px 18px",
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".docx"
          style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files?.[0] ?? undefined)}
        />
        {savedFilename ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "var(--rl-accent)", fontSize: 18 }} aria-hidden="true">▤</span>
              <span style={{ color: "var(--rl-text)", fontSize: 14 }}>
                {busy ? "Saving…" : savedFilename}
              </span>
            </div>
            <span style={{ color: "var(--rl-text-muted)", fontSize: 13 }}>Click to replace</span>
          </div>
        ) : (
          <div>
            <div style={{ color: "var(--rl-accent)", fontSize: 22, marginBottom: 6 }} aria-hidden="true">↑</div>
            <div style={{ color: "var(--rl-text-dim)", fontSize: 14 }}>
              {busy ? "Saving…" : "Drop your .docx here, or click to browse"}
            </div>
          </div>
        )}
      </div>
      {savedFilename && (
        <button
          onClick={handleRemove}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--rl-text-muted)",
            fontSize: 12.5,
            cursor: "pointer",
            fontFamily: "inherit",
            padding: 0,
            marginBottom: 24,
          }}
        >
          Remove saved resume
        </button>
      )}
      {msg && (
        <p style={{ color: "var(--rl-accent-dim)", fontSize: 12.5, margin: "4px 0 24px" }}>{msg}</p>
      )}

      {/* Default job title */}
      <label style={{ display: "block", color: "var(--rl-text-label)", fontSize: 13, marginBottom: 8, marginTop: 8 }}>
        Default job title
      </label>
      <input
        type="text"
        value={prefs.defaultJobTitle}
        onChange={(e) => updatePrefs({ defaultJobTitle: e.target.value })}
        placeholder="e.g. Software Engineer"
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
          marginBottom: 8,
          outline: "none",
        }}
      />
      <p style={{ color: "var(--rl-text-muted)", fontSize: 11.5, margin: "0 0 28px" }}>
        Used as the title on the tailoring screen. The job description still drives the actual matching.
      </p>

      {/* Preferences */}
      <label style={{ display: "block", color: "var(--rl-text-label)", fontSize: 13, marginBottom: 10 }}>
        Default page fit
      </label>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {([["compact", "Compact"], ["enhanced", "Enhanced"], ["none", "No limit"]] as [FitMode, string][]).map(
          ([val, label]) => {
            const sel = prefs.defaultFitMode === val;
            return (
              <button
                key={val}
                onClick={() => updatePrefs({ defaultFitMode: val })}
                style={pillStyle(sel)}
              >
                {label}
              </button>
            );
          }
        )}
      </div>

      <div style={{ display: "flex", gap: 24 }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", color: "var(--rl-text-label)", fontSize: 13, marginBottom: 10 }}>
            Default style
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {(["conservative", "balanced"] as Tone[]).map((t) => (
              <button key={t} onClick={() => updatePrefs({ defaultTone: t })} style={pillStyle(prefs.defaultTone === t)}>
                <span style={{ textTransform: "capitalize" }}>{t}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", color: "var(--rl-text-label)", fontSize: 13, marginBottom: 10 }}>
            Default format
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {(["pdf", "docx"] as ("pdf" | "docx")[]).map((f) => (
              <button key={f} onClick={() => updatePrefs({ defaultFormat: f })} style={pillStyle(prefs.defaultFormat === f)}>
                <span style={{ textTransform: "uppercase" }}>{f}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function pillStyle(selected: boolean): React.CSSProperties {
  return {
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
  };
}
