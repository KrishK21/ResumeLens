/** Profile API — saved resume persistence (no auth yet; keyed by profile id). */

import { API_URL } from "./config";
import { UploadResult } from "./api";

export interface SavedResumeStatus {
  has_resume: boolean;
  filename: string | null;
}

export async function getSavedResume(profileId: string): Promise<SavedResumeStatus> {
  const res = await fetch(`${API_URL}/profile/${profileId}/resume`);
  if (!res.ok) return { has_resume: false, filename: null };
  return res.json();
}

export async function saveResumeToProfile(
  profileId: string,
  file: File
): Promise<{ saved: boolean; filename: string }> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/profile/${profileId}/resume`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    let detail = "Could not save resume.";
    try {
      const b = await res.json();
      if (b?.detail) detail = b.detail;
    } catch {}
    throw new Error(detail);
  }
  return res.json();
}

export async function deleteSavedResume(profileId: string): Promise<void> {
  await fetch(`${API_URL}/profile/${profileId}/resume`, { method: "DELETE" });
}

/** Start a tailoring session from the profile's saved resume (no re-upload). */
export async function sessionFromProfile(profileId: string): Promise<UploadResult> {
  const res = await fetch(`${API_URL}/profile/${profileId}/session`, {
    method: "POST",
  });
  if (!res.ok) {
    let detail = "Could not start from saved resume.";
    try {
      const b = await res.json();
      if (b?.detail) detail = b.detail;
    } catch {}
    throw new Error(detail);
  }
  return res.json();
}
