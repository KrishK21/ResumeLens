"use client";

import { useRef, useState } from "react";
import { FlowState } from "@/lib/types";

export default function EntryScreen({
  flow,
  setFlow,
  resumeFile,
  setResumeFile,
  savedResumeName,
  useSaved,
  setUseSaved,
  onContinue,
  onOpenProfile,
}: {
  flow: FlowState;
  setFlow: (f: Partial<FlowState>) => void;
  resumeFile: File | null;
  setResumeFile: (f: File | null) => void;
  savedResumeName: string | null;
  useSaved: boolean;
  setUseSaved: (v: boolean) => void;
  onContinue: () => void;
  onOpenProfile: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState("");

  const hasResume = (useSaved && savedResumeName) || (!useSaved && resumeFile);
  const canContinue = !!hasResume && flow.jobDescription.trim().length >= 20;

  function validateAndSet(file: File | undefined) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".docx")) {
      setFileError("Upload a Word .docx file. PDF support is coming later.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError("That file's over 5 MB. Try a smaller one.");
      return;
    }
    setFileError("");
    setResumeFile(file);
    setUseSaved(false);
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
          Tailor your resume
        </span>
      </div>

      <h1 style={{ fontSize: 30, fontWeight: 500, lineHeight: 1.15, letterSpacing: "-0.02em", margin: "0 0 8px" }}>
        Paste the job description
      </h1>
      <p style={{ color: "var(--rl-text-dim)", fontSize: 15, lineHeight: 1.6, margin: "0 0 32px", maxWidth: 440 }}>
        ResumeLens reads what the role wants and reshapes your real experience to match — never inventing
        anything.
      </p>

      {/* Resume: saved or new */}
      <label style={{ display: "block", color: "var(--rl-text-label)", fontSize: 13, marginBottom: 8 }}>
        Your resume
      </label>

      {savedResumeName && useSaved ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            background: "var(--rl-surface)",
            border: "1px solid var(--rl-accent)",
            borderRadius: 10,
            padding: "16px 18px",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "var(--rl-accent)", fontSize: 18 }} aria-hidden="true">▤</span>
            <div>
              <div style={{ color: "var(--rl-text)", fontSize: 14 }}>{savedResumeName}</div>
              <div style={{ color: "var(--rl-text-muted)", fontSize: 11.5 }}>From your profile</div>
            </div>
          </div>
          <button
            onClick={() => {
              setUseSaved(false);
              inputRef.current?.click();
            }}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--rl-text-muted)",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Use a different file
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".docx"
            style={{ display: "none" }}
            onChange={(e) => validateAndSet(e.target.files?.[0] ?? undefined)}
          />
        </div>
      ) : (
        <>
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
              validateAndSet(e.dataTransfer.files?.[0]);
            }}
            style={{
              cursor: "pointer",
              background: "var(--rl-surface)",
              border: `1px dashed ${dragOver ? "var(--rl-accent)" : "var(--rl-border-hover)"}`,
              borderRadius: 10,
              padding: resumeFile ? "16px 18px" : "28px 18px",
              marginBottom: fileError ? 8 : savedResumeName ? 8 : 24,
              textAlign: "center",
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".docx"
              style={{ display: "none" }}
              onChange={(e) => validateAndSet(e.target.files?.[0] ?? undefined)}
            />
            {resumeFile ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "var(--rl-accent)", fontSize: 18 }} aria-hidden="true">▤</span>
                  <span style={{ color: "var(--rl-text)", fontSize: 14 }}>{resumeFile.name}</span>
                </div>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setResumeFile(null);
                  }}
                  style={{ color: "var(--rl-text-muted)", fontSize: 13, cursor: "pointer" }}
                >
                  Replace
                </span>
              </div>
            ) : (
              <div>
                <div style={{ color: "var(--rl-accent)", fontSize: 22, marginBottom: 6 }} aria-hidden="true">↑</div>
                <div style={{ color: "var(--rl-text-dim)", fontSize: 14 }}>Drop your .docx here, or click to browse</div>
              </div>
            )}
          </div>
          {savedResumeName && !useSaved && (
            <button
              onClick={() => {
                setUseSaved(true);
                setResumeFile(null);
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--rl-accent-dim)",
                fontSize: 12.5,
                cursor: "pointer",
                fontFamily: "inherit",
                padding: 0,
                marginBottom: 24,
              }}
            >
              ← Use my saved resume ({savedResumeName})
            </button>
          )}
        </>
      )}
      {fileError && <p style={{ color: "#D98A7E", fontSize: 12.5, margin: "0 0 20px" }}>{fileError}</p>}

      {!savedResumeName && (
        <p style={{ color: "var(--rl-text-muted)", fontSize: 11.5, margin: "-12px 0 24px" }}>
          Tip: save your resume in{" "}
          <span onClick={onOpenProfile} style={{ color: "var(--rl-accent-dim)", cursor: "pointer" }}>
            your profile
          </span>{" "}
          so you don&apos;t upload it every time.
        </p>
      )}

      {/* Job description */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <label style={{ color: "var(--rl-text-label)", fontSize: 13 }}>Job description</label>
        <span style={{ color: "var(--rl-text-muted)", fontSize: 12 }}>
          {flow.jobDescription.length.toLocaleString()} characters
        </span>
      </div>
      <textarea
        value={flow.jobDescription}
        onChange={(e) => setFlow({ jobDescription: e.target.value })}
        placeholder="Paste the full job description here…"
        style={{
          width: "100%",
          boxSizing: "border-box",
          minHeight: 200,
          background: "var(--rl-surface)",
          border: "0.5px solid var(--rl-border)",
          borderRadius: 10,
          padding: 15,
          color: "#D8D4CC",
          fontSize: 14,
          lineHeight: 1.65,
          fontFamily: "inherit",
          resize: "none",
          outline: "none",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--rl-text-muted)", fontSize: 13 }}>
          <span aria-hidden="true">🔒</span>
          <span>Your resume stays private</span>
        </div>
        <button
          onClick={onContinue}
          disabled={!canContinue}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            background: canContinue ? "var(--rl-accent)" : "var(--rl-surface)",
            border: canContinue ? "none" : "0.5px solid var(--rl-border)",
            borderRadius: 10,
            padding: "13px 22px",
            color: canContinue ? "var(--rl-on-accent)" : "var(--rl-text-muted)",
            fontSize: 14,
            fontWeight: 500,
            cursor: canContinue ? "pointer" : "not-allowed",
            fontFamily: "inherit",
          }}
        >
          Continue
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
