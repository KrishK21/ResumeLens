"""
ResumeLens — Profile store
==========================

Persists a user's saved resume so they don't re-upload every time. Keyed by a
browser-generated profile id (there's no auth yet — that id becomes the real
user id when accounts land in the next step).

Unlike the session store (temp files, cleared on restart), saved resumes live
in a persistent folder so they survive server restarts. This is deliberately a
small interface so it can be swapped for real object storage (e.g. Supabase)
without touching route code.

SECURITY NOTE: the profile id is an opaque random token the browser holds. It
is not a substitute for authentication — anyone with the token can fetch that
resume. Real auth (next step) replaces this with authenticated user ids.
"""

from __future__ import annotations

import re
import shutil
from pathlib import Path

# Persistent location (NOT the temp dir). Created next to the backend app.
_ROOT = Path(__file__).resolve().parent.parent / "profile_data"
_ROOT.mkdir(parents=True, exist_ok=True)

# Profile ids are random tokens; validate to prevent path traversal.
_ID_RE = re.compile(r"^[A-Za-z0-9_-]{8,64}$")


def _safe_dir(profile_id: str) -> Path:
    if not _ID_RE.match(profile_id):
        raise ValueError("Invalid profile id.")
    d = _ROOT / profile_id
    d.mkdir(parents=True, exist_ok=True)
    return d


def save_resume(profile_id: str, src_file: Path, filename: str) -> None:
    """Store (or replace) the profile's saved resume."""
    d = _safe_dir(profile_id)
    # Always store under a fixed name; keep original filename in a sidecar.
    shutil.copy(src_file, d / "resume.docx")
    (d / "filename.txt").write_text(filename, encoding="utf-8")


def get_resume_path(profile_id: str) -> Path | None:
    """Return the saved resume path, or None if the profile has none."""
    if not _ID_RE.match(profile_id):
        return None
    p = _ROOT / profile_id / "resume.docx"
    return p if p.exists() else None


def get_resume_filename(profile_id: str) -> str | None:
    if not _ID_RE.match(profile_id):
        return None
    f = _ROOT / profile_id / "filename.txt"
    return f.read_text(encoding="utf-8") if f.exists() else None


def delete_resume(profile_id: str) -> None:
    if not _ID_RE.match(profile_id):
        return
    d = _ROOT / profile_id
    if d.exists():
        shutil.rmtree(d, ignore_errors=True)
