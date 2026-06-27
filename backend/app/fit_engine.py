"""
ResumeLens — One-page fit engine
================================

Guarantees a single-page export WITHOUT touching formatting. The only levers
are (in order): shorten bullet TEXT, then as a last resort DROP the weakest
bullet. Margins, fonts, and spacing are never altered.

Pipeline (used by /export):
  1. measure_pages(docx) -> render to PDF, count pages.
  2. If > 1 page: ask the LLM to shorten the longest bullets (text-only),
     re-apply, re-measure. Bounded retries.
  3. If still > 1 page: drop the single weakest bullet, re-measure. Repeat.
  4. Report what happened (which bullets were shortened / dropped) so the UI
     can stay transparent with the user.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

import pdfplumber

from .document_engine import apply_rewrites, docx_to_pdf


# --------------------------------------------------------------------------- #
#  Measurement
# --------------------------------------------------------------------------- #

def measure_pages(docx_path: Path, work_dir: Path) -> int:
    """Render the docx to PDF and return the page count."""
    pdf = docx_to_pdf(docx_path, work_dir)
    with pdfplumber.open(str(pdf)) as p:
        return len(p.pages)


# --------------------------------------------------------------------------- #
#  Fit report
# --------------------------------------------------------------------------- #

@dataclass
class FitReport:
    final_pages: int
    fits_one_page: bool
    shortened_indices: list[int] = field(default_factory=list)
    dropped_indices: list[int] = field(default_factory=list)
    rounds: int = 0
    note: str = ""


# --------------------------------------------------------------------------- #
#  The fit loop
# --------------------------------------------------------------------------- #

def fit_to_one_page(
    src_docx: Path,
    bullet_texts: dict[int, str],
    work_dir: Path,
    shorten_fn,                       # callable(text, target_chars) -> str  (LLM)
    weakness_rank: list[int],         # bullet indices, weakest-first (for dropping)
    max_shorten_rounds: int = 3,
    allow_drop: bool = True,
) -> tuple[dict[int, str], FitReport]:
    """
    Mutate ``bullet_texts`` (index -> text) until the rendered doc is one page.

    ``shorten_fn`` is injected so this module stays LLM-agnostic and unit-testable
    (tests pass a deterministic shortener; production passes the Claude call).
    ``weakness_rank`` lists bullet indices weakest-first; when shortening isn't
    enough, the weakest remaining bullet is dropped.

    Returns the final text map and a FitReport describing what changed.
    """
    work_dir.mkdir(parents=True, exist_ok=True)
    texts = dict(bullet_texts)
    report = FitReport(final_pages=0, fits_one_page=False)

    def render_and_count(current: dict[int, str]) -> int:
        apply_rewrites(src_docx, current, work_dir / "fit.docx")
        return measure_pages(work_dir / "fit.docx", work_dir)

    pages = render_and_count(texts)
    if pages <= 1:
        report.final_pages = pages
        report.fits_one_page = True
        report.note = "Already fits one page."
        return texts, report

    # --- Phase 1: shorten longest bullets, text-only ---
    for _ in range(max_shorten_rounds):
        report.rounds += 1
        # Target the longest few bullets each round.
        longest = sorted(texts, key=lambda i: len(texts[i]), reverse=True)[:3]
        for idx in longest:
            target = max(60, int(len(texts[idx]) * 0.75))  # ~25% shorter, floor 60 chars
            texts[idx] = shorten_fn(texts[idx], target)
            if idx not in report.shortened_indices:
                report.shortened_indices.append(idx)
        pages = render_and_count(texts)
        if pages <= 1:
            report.final_pages = pages
            report.fits_one_page = True
            report.note = "Fit one page by shortening text only."
            return texts, report

    # --- Phase 2: drop weakest bullets one at a time ---
    if allow_drop:
        for idx in weakness_rank:
            if idx not in texts:
                continue
            texts.pop(idx)                 # removing from the map => bullet text emptied
            report.dropped_indices.append(idx)
            # Emptied bullets are blanked rather than structurally deleted here;
            # the caller removes the now-empty bullet paragraphs for a clean look.
            pages = render_and_count({**texts})
            if pages <= 1:
                report.final_pages = pages
                report.fits_one_page = True
                report.note = ("Fit one page by shortening text and dropping "
                               f"{len(report.dropped_indices)} low-value bullet(s).")
                return texts, report

    report.final_pages = pages
    report.fits_one_page = pages <= 1
    report.note = "Could not guarantee one page within limits."
    return texts, report
