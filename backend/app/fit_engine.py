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
    """Render the docx to PDF and return the page count (accurate but slow)."""
    pdf = docx_to_pdf(docx_path, work_dir)
    with pdfplumber.open(str(pdf)) as p:
        return len(p.pages)


def estimate_overflow(bullet_texts: dict[int, str], baseline_chars: int) -> bool:
    """
    Fast heuristic: does the current total bullet length exceed what fit on one
    page at baseline? Avoids launching LibreOffice on every fit-loop iteration
    (each launch costs 1-3s). We calibrate `baseline_chars` from the first real
    render, then use cheap character counting to decide whether to keep
    shortening — only re-rendering with LibreOffice to CONFIRM at the end.
    """
    total = sum(len(t) for t in bullet_texts.values())
    return total > baseline_chars


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
    shorten_fn=None,                  # single-bullet shortener (fallback)
    shorten_many_fn=None,             # batch/parallel shortener (preferred)
    weakness_rank: list[int] = None,  # bullet indices, weakest-first (for dropping)
    max_shorten_rounds: int = 3,
    allow_drop: bool = True,
) -> tuple[dict[int, str], FitReport]:
    """
    Mutate ``bullet_texts`` (index -> text) until the rendered doc is one page.

    Prefers ``shorten_many_fn`` (parallel) for speed; falls back to
    ``shorten_fn`` (sequential) if only that is provided. ``weakness_rank``
    lists bullet indices weakest-first for the last-resort drop.

    Returns the final text map and a FitReport describing what changed.
    """
    work_dir.mkdir(parents=True, exist_ok=True)
    texts = dict(bullet_texts)
    weakness_rank = weakness_rank or []
    report = FitReport(final_pages=0, fits_one_page=False)

    def render_and_count(current: dict[int, str]) -> int:
        apply_rewrites(src_docx, current, work_dir / "fit.docx")
        return measure_pages(work_dir / "fit.docx", work_dir)

    def shorten_batch(targets: list[tuple[int, str, int]]) -> dict[int, str]:
        if shorten_many_fn is not None:
            return shorten_many_fn(targets)
        # Sequential fallback.
        out = {}
        for idx, text, target in targets:
            out[idx] = shorten_fn(text, target) if shorten_fn else text
        return out

    pages = render_and_count(texts)
    if pages <= 1:
        report.final_pages = pages
        report.fits_one_page = True
        report.note = "Already fits one page."
        return texts, report

    # Calibrate a character budget from the overflowing baseline: we know the
    # CURRENT total overflows, so target a reduction. We shorten until the
    # estimated total drops enough, then render ONCE to confirm — avoiding a
    # slow LibreOffice launch on every iteration.
    baseline_total = sum(len(t) for t in texts.values())
    # Aim to shave ~15% of total text to pull one line-group off the page.
    target_total = int(baseline_total * 0.85)

    # --- Phase 1: shorten longest bullets, in parallel batches (no re-render) ---
    for _ in range(max_shorten_rounds):
        report.rounds += 1
        longest = sorted(texts, key=lambda i: len(texts[i]), reverse=True)[:4]
        batch = [
            (idx, texts[idx], max(60, int(len(texts[idx]) * 0.75)))
            for idx in longest
        ]
        shortened = shorten_batch(batch)
        for idx, new_text in shortened.items():
            texts[idx] = new_text
            if idx not in report.shortened_indices:
                report.shortened_indices.append(idx)

        current_total = sum(len(t) for t in texts.values())
        if current_total <= target_total:
            # Estimated to fit now — confirm with ONE real render.
            pages = render_and_count(texts)
            if pages <= 1:
                report.final_pages = pages
                report.fits_one_page = True
                report.note = "Fit one page by shortening text only."
                return texts, report
            # Didn't actually fit — lower the target and keep going.
            target_total = int(current_total * 0.9)

    # Final confirm render after all shorten rounds.
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


# --------------------------------------------------------------------------- #
#  Weakness ranking (for the last-resort drop)
# --------------------------------------------------------------------------- #

import re

def rank_bullets_by_weakness(texts: dict[int, str]) -> list[int]:
    """
    Return bullet indices ordered weakest-first (best drop candidates first).

    A bullet is 'stronger' (less droppable) when it has more quantified impact
    (numbers, %, latency, counts) and more distinct capitalized tech terms.
    This is a heuristic, not a judgment of truth — it only decides drop order
    when shortening alone can't achieve one page.
    """
    def score(text: str) -> float:
        metrics = len(re.findall(r"\d+\s?%|\d+\s?(?:ms|s|x)\b|\b\d{3,}\b|\d+", text))
        tech_terms = len(set(re.findall(r"\b[A-Z][A-Za-z0-9+.#]{1,}\b", text)))
        length_bonus = min(len(text) / 120.0, 2.0)  # longer = usually more content
        return metrics * 2.0 + tech_terms * 1.0 + length_bonus

    # Weakest first => ascending score.
    return sorted(texts, key=lambda i: score(texts[i]))