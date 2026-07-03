/**
 * ResumeLens — backend API config.
 *
 * The FastAPI backend runs on http://localhost:8000 in development.
 * Override in production by setting NEXT_PUBLIC_API_URL.
 */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";