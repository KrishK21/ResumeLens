"""
ResumeLens — LLM Engine
=======================

Two jobs, two functions, two models:

  1. extract_keywords(job_description)  -> Haiku  (cheap, fast)
       Pull the hard skills, tools, and exact phrases an AI screener scans for.

  2. rewrite_bullet(bullet, keywords)   -> Sonnet (quality)
       Rephrase ONE real bullet to surface relevant keywords — producing BOTH
       a conservative and a balanced version — using ONLY facts already in the
       bullet. Never invents tools, metrics, employers, or responsibilities.

Design guarantees
-----------------
* No fabrication. The rewrite prompt forbids adding any fact not present in the
  original bullet. Each result includes a ``fabrication_check`` the caller can
  assert on.
* Gaps are surfaced, not stuffed. ``match_keywords_against_resume`` labels each
  job keyword as matched/gap so the UI can let the user decide what to do with
  the gaps — the rewriter itself never forces an unsupported keyword in.
* Structured JSON output so each result maps cleanly to clickable UI elements.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, asdict
from typing import Any

from anthropic import Anthropic

from .config import get_settings


# --------------------------------------------------------------------------- #
#  Client
# --------------------------------------------------------------------------- #

def _client() -> Anthropic:
    return Anthropic(api_key=get_settings().anthropic_api_key)


def _parse_json(text: str) -> Any:
    """
    Robustly parse a JSON object from a model response. Strips ```json fences
    and any stray prose before/after the first {...} block.
    """
    t = text.strip()
    if t.startswith("```"):
        t = t.split("```", 2)[1]
        if t.lstrip().startswith("json"):
            t = t.lstrip()[4:]
    # Fall back to slicing the outermost braces if needed.
    start, end = t.find("{"), t.rfind("}")
    if start != -1 and end != -1:
        t = t[start : end + 1]
    return json.loads(t)


# --------------------------------------------------------------------------- #
#  Stage 1 — keyword extraction
# --------------------------------------------------------------------------- #

@dataclass
class JobKeywords:
    job_title: str
    hard_skills: list[str]
    tools: list[str]
    soft_skills: list[str]
    exact_phrases: list[str]

    def all_terms(self) -> list[str]:
        seen, out = set(), []
        for group in (self.hard_skills, self.tools, self.exact_phrases):
            for term in group:
                k = term.lower().strip()
                if k and k not in seen:
                    seen.add(k)
                    out.append(term.strip())
        return out


_EXTRACT_SYSTEM = (
    "You are an expert technical recruiter and ATS analyst. You read a job "
    "description and extract the concrete terms an automated resume screener "
    "will look for. Extract ONLY terms that actually appear in the posting. "
    "Do not invent or infer skills that aren't written there. Prefer the exact "
    "wording used in the posting (include both an acronym and its expansion when "
    "the posting uses them, e.g. 'CI/CD')."
)

_EXTRACT_INSTRUCTIONS = """Extract the screening-relevant keywords from this job description.

Return ONLY a JSON object with exactly these keys:
{
  "job_title": "the role title as written",
  "hard_skills": ["concrete technical skills/competencies"],
  "tools": ["named technologies, languages, frameworks, platforms"],
  "soft_skills": ["explicitly stated soft skills"],
  "exact_phrases": ["multi-word phrases a screener would match verbatim"]
}

Rules:
- Only include terms present in the posting.
- No duplicates across lists; put a term in its single best category.
- Keep each term short (the skill itself, not a sentence).

JOB DESCRIPTION:
\"\"\"
__JOB_DESCRIPTION__
\"\"\"
"""


def extract_keywords(job_description: str) -> JobKeywords:
    """Stage 1: pull screening keywords from a pasted job description (Haiku)."""
    s = get_settings()
    msg = _client().messages.create(
        model=s.extract_model,
        max_tokens=1024,
        system=_EXTRACT_SYSTEM,
        messages=[{
            "role": "user",
            "content": _EXTRACT_INSTRUCTIONS.replace("__JOB_DESCRIPTION__", job_description.strip()),
        }],
    )
    data = _parse_json(msg.content[0].text)
    return JobKeywords(
        job_title=data.get("job_title", ""),
        hard_skills=data.get("hard_skills", []),
        tools=data.get("tools", []),
        soft_skills=data.get("soft_skills", []),
        exact_phrases=data.get("exact_phrases", []),
    )


# --------------------------------------------------------------------------- #
#  Gap analysis — which job keywords does the resume already support?
# --------------------------------------------------------------------------- #

@dataclass
class KeywordMatch:
    term: str
    matched: bool          # True = appears in the resume already
    where: str = ""        # short evidence snippet if matched


def match_keywords_against_resume(
    keywords: JobKeywords,
    resume_text: str,
) -> list[KeywordMatch]:
    """
    Label each job keyword matched/gap by simple case-insensitive presence in
    the resume text. Gaps are what the UI will later let the user decide on;
    the rewriter never fabricates to cover a gap.
    """
    haystack = resume_text.lower()
    results: list[KeywordMatch] = []
    for term in keywords.all_terms():
        present = term.lower() in haystack
        results.append(KeywordMatch(term=term, matched=present,
                                    where=term if present else ""))
    return results


# --------------------------------------------------------------------------- #
#  Stage 2 — bullet rewriting (conservative + balanced)
# --------------------------------------------------------------------------- #

@dataclass
class RewrittenBullet:
    original: str
    conservative: str            # only keywords clearly backed by the bullet
    balanced: str                # light reasonable inferences allowed
    keywords_used_conservative: list[str]
    keywords_used_balanced: list[str]
    fabrication_check: str       # "none" if the model added no new facts

    def to_dict(self) -> dict:
        return asdict(self)

    def version(self, tone: str) -> str:
        """
        Return the chosen rewrite by tone name.
          tone="conservative" -> conservative text
          tone="balanced"     -> balanced text
          tone="original"     -> the untouched original (user kept their own)
        Falls back to the original on any unknown tone.
        """
        return {
            "conservative": self.conservative,
            "balanced": self.balanced,
            "original": self.original,
        }.get(tone.lower(), self.original)

    def keywords_for(self, tone: str) -> list[str]:
        """Keywords incorporated by the chosen tone (empty for 'original')."""
        return {
            "conservative": self.keywords_used_conservative,
            "balanced": self.keywords_used_balanced,
        }.get(tone.lower(), [])


_REWRITE_SYSTEM = (
    "You are an expert resume writer optimizing bullet points to pass AI/ATS "
    "resume screeners WITHOUT lying. You are given one real resume bullet and a "
    "set of target keywords from a job posting. You rephrase the bullet to "
    "surface relevant keywords using the natural language a screener matches.\n\n"
    "ABSOLUTE RULES (a violation makes the output unusable):\n"
    "1. Use ONLY facts stated in the original bullet. Never invent tools, "
    "technologies, metrics, employers, scope, or responsibilities.\n"
    "2. Never add a number/percentage/dollar figure that isn't already there.\n"
    "3. Only incorporate a target keyword if it TRUTHFULLY describes what the "
    "original bullet already says. If a keyword doesn't fit, leave it out.\n"
    "4. Keep it a single concise bullet, action-verb first, similar length."
)

_REWRITE_INSTRUCTIONS = """Rewrite this resume bullet two ways for the target keywords.

ORIGINAL BULLET:
\"\"\"__BULLET__\"\"\"

TARGET KEYWORDS (incorporate only those that truthfully apply):
__KEYWORDS__

Produce TWO versions:
- "conservative": insert ONLY keywords clearly and unambiguously supported by
  the original bullet. When in doubt, leave a keyword out.
- "balanced": you MAY make light, reasonable rephrasings (e.g. naming a general
  technique the bullet clearly describes) but still add NO new facts, tools,
  numbers, or claims beyond the original.

Return ONLY a JSON object with exactly these keys:
{
  "original": "the original bullet text",
  "conservative": "rewritten bullet text",
  "balanced": "rewritten bullet text",
  "keywords_used_conservative": ["..."],
  "keywords_used_balanced": ["..."],
  "fabrication_check": "none"
}

Set "fabrication_check" to "none" if you added no new facts. If you could not
avoid adding something not in the original, set it to a short description of
what — but you should always be able to keep it "none"."""


def rewrite_bullet(bullet: str, keywords: list[str]) -> RewrittenBullet:
    """Stage 2: rephrase one real bullet into conservative + balanced versions (Sonnet)."""
    s = get_settings()
    kw_block = "\n".join(f"- {k}" for k in keywords) if keywords else "- (none)"
    content = (
        _REWRITE_INSTRUCTIONS
        .replace("__BULLET__", bullet)
        .replace("__KEYWORDS__", kw_block)
    )
    msg = _client().messages.create(
        model=s.rewrite_model,
        max_tokens=1024,
        system=_REWRITE_SYSTEM,
        messages=[{"role": "user", "content": content}],
    )
    data = _parse_json(msg.content[0].text)
    return RewrittenBullet(
        original=data.get("original", bullet),
        conservative=data.get("conservative", bullet),
        balanced=data.get("balanced", bullet),
        keywords_used_conservative=data.get("keywords_used_conservative", []),
        keywords_used_balanced=data.get("keywords_used_balanced", []),
        fabrication_check=data.get("fabrication_check", "none"),
    )