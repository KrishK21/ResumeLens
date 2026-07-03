/**
 * ResumeLens — backend API client.
 * Thin typed wrappers around the FastAPI endpoints.
 */

import { API_URL } from "./config";
import { KeywordMatch, RewriteItem } from "./types";

export interface UploadResult {
  session_id: string;
  filename: string;
  bullets: { index: number; text: string }[];
  unsupported_layout: boolean;
  note: string;
}

export interface TailorResult {
  job_title: string;
  keywords: KeywordMatch[];
  gaps: string[];
  rewrites: RewriteItem[];
}

async function asError(res: Response): Promise<never> {
  let detail = `Request failed (${res.status})`;
  try {
    const body = await res.json();
    if (body?.detail) detail = body.detail;
  } catch {
    /* non-JSON error body */
  }
  throw new Error(detail);
}

/** Upload a .docx resume; returns the session id and located bullets. */
export async function uploadResume(file: File): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/upload`, { method: "POST", body: form });
  if (!res.ok) return asError(res);
  return res.json();
}

/** Extract keywords and rewrite all bullets for a job description. */
export async function tailorResume(
  sessionId: string,
  jobDescription: string
): Promise<TailorResult> {
  const res = await fetch(`${API_URL}/tailor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, job_description: jobDescription }),
  });
  if (!res.ok) return asError(res);
  return res.json();
}

export interface ExportOptions {
  sessionId: string;
  defaultTone: "conservative" | "balanced";
  choices: {
    index: number;
    tone: "conservative" | "balanced" | "original" | "custom";
    custom_text?: string;
  }[];
  format: "pdf" | "docx";
  onePage: boolean;
  fitMode: "compact" | "enhanced";
}

/** Export the tailored resume; returns a Blob for download. */
export async function exportResume(opts: ExportOptions): Promise<Blob> {
  const res = await fetch(`${API_URL}/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: opts.sessionId,
      default_tone: opts.defaultTone,
      choices: opts.choices,
      format: opts.format,
      one_page: opts.onePage,
      fit_mode: opts.fitMode,
    }),
  });
  if (!res.ok) return asError(res);
  return res.blob();
}