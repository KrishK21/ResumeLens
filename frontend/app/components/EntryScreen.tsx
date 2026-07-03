"use client";

import { useRef, useState } from "react";
import { FlowState } from "@/lib/types";

export default function EntryScreen({
  flow,
  setFlow,
  resumeFile,
  setResumeFile,
  onContinue,
}: {
  flow: FlowState;
  setFlow: (f: Partial<FlowState>) => void;
  resumeFile: File | null;
  setResumeFile: (f: File | null) => void;
  onContinue: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState("");

  const canContinue =
    !!resumeFile &&
    flow.jobTitle.trim().length > 0 &&
    flow.jobDescription.trim().length >= 20;

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
  }

  return (
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
          Target role
        </span>
      </div>

      <h1
        style={{
          fontSize: 30,
          fontWeight: 500,
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
          margin: "0 0 8px",
        }}
      >
        What are you applying for?
      </h1>
      <p
        style={{
          color: "var(--rl-text-dim)",
          fontSize: 15,
          lineHeight: 1.6,
          margin: "0 0 32px",
          maxWidth: 440,
        }}
      >
        Upload your resume and paste the job description. ResumeLens reshapes your
        real experience to match — never inventing anything.
      </p>

      {/* Resume upload */}
      <label
        style={{
          display: "block",
          color: "var(--rl-text-label)",
          fontSize: 13,
          marginBottom: 8,
        }}
      >
        Your resume
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
          validateAndSet(e.dataTransfer.files?.[0]);
        }}
        style={{
          cursor: "pointer",
          background: "var(--rl-surface)",
          border: `1px dashed ${
            dragOver ? "var(--rl-accent)" : "var(--rl-border-hover)"
          }`,
          borderRadius: 10,
          padding: resumeFile ? "16px 18px" : "28px 18px",
          marginBottom: fileError ? 8 : 24,
          textAlign: "center",
          transition: "border-color 0.15s ease",
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "var(--rl-accent)", fontSize: 18 }} aria-hidden="true">
                ▤
              </span>
              <span style={{ color: "var(--rl-text)", fontSize: 14 }}>
                {resumeFile.name}
              </span>
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
            <div style={{ color: "var(--rl-accent)", fontSize: 22, marginBottom: 6 }} aria-hidden="true">
              ↑
            </div>
            <div style={{ color: "var(--rl-text-dim)", fontSize: 14 }}>
              Drop your .docx here, or click to browse
            </div>
          </div>
        )}
      </div>
      {fileError && (
        <p style={{ color: "#D98A7E", fontSize: 12.5, margin: "0 0 20px" }}>{fileError}</p>
      )}

      {/* Job title */}
      <label
        style={{
          display: "block",
          color: "var(--rl-text-label)",
          fontSize: 13,
          marginBottom: 8,
        }}
      >
        Job title
      </label>
      <input
        type="text"
        value={flow.jobTitle}
        onChange={(e) => setFlow({ jobTitle: e.target.value })}
        placeholder="Backend Software Engineer"
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
          marginBottom: 24,
          outline: "none",
        }}
      />

      {/* Job description */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <label style={{ color: "var(--rl-text-label)", fontSize: 13 }}>
          Job description
        </label>
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
          minHeight: 180,
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

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 32,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "var(--rl-text-muted)",
            fontSize: 13,
          }}
        >
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
            transition: "background 0.15s ease",
          }}
        >
          Continue
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}