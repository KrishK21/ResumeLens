"""
ResumeLens — API schemas
========================

Pydantic models defining the request/response shapes for the HTTP API.
Keeping these separate from the route handlers makes the contract explicit
and gives the frontend a precise spec to code against.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


# --------------------------------------------------------------------------- #
#  /upload
# --------------------------------------------------------------------------- #

class BulletOut(BaseModel):
    index: int                     # paragraph index in the docx
    text: str                      # current bullet text


class UploadResponse(BaseModel):
    session_id: str                # opaque handle for subsequent calls
    filename: str
    bullets: list[BulletOut]
    unsupported_layout: bool = False  # True if bullets live in text boxes/tables
    note: str = ""


# --------------------------------------------------------------------------- #
#  /tailor   (extract keywords + rewrite every bullet)
# --------------------------------------------------------------------------- #

class TailorRequest(BaseModel):
    session_id: str
    job_description: str = Field(min_length=20)


class KeywordMatchOut(BaseModel):
    term: str
    matched: bool                  # already supported by the resume?


class RewriteOut(BaseModel):
    index: int
    original: str
    conservative: str
    balanced: str
    keywords_used_conservative: list[str]
    keywords_used_balanced: list[str]
    fabrication_check: str


class TailorResponse(BaseModel):
    job_title: str
    keywords: list[KeywordMatchOut]      # matched + gaps, for the UI to display
    gaps: list[str]                      # convenience: just the unmatched terms
    rewrites: list[RewriteOut]


# --------------------------------------------------------------------------- #
#  /export   (apply the user's final choices -> downloadable resume)
# --------------------------------------------------------------------------- #

class BulletChoice(BaseModel):
    index: int
    # "conservative" | "balanced" | "original" | "custom"
    tone: str = "balanced"
    # when tone == "custom", use this exact text (user-edited)
    custom_text: str | None = None


class ExportRequest(BaseModel):
    session_id: str
    # global default applied to any bullet not explicitly overridden
    default_tone: str = "balanced"
    # per-bullet overrides (manual mode); empty list = pure auto mode
    choices: list[BulletChoice] = Field(default_factory=list)
    # "pdf" | "docx"
    format: str = "pdf"
    # enforce single-page output
    one_page: bool = True
    # "compact" (shorten harder, keep everything) | "enhanced" (allow longer, then fit)
    fit_mode: str = "enhanced"


class ExportMeta(BaseModel):
    """Sidecar info the UI can read after an export (via response headers)."""
    final_pages: int
    fits_one_page: bool
    shortened_indices: list[int]
    dropped_indices: list[int]
    note: str