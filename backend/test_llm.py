"""
Step 3 live test — calls Claude (costs a fraction of a cent).

Run from the backend folder with your venv active:
    python test_llm.py

It will:
  1. Extract keywords from a sample software-engineering job description (Haiku)
  2. Show which keywords your resume already supports vs. gaps
  3. Rewrite TWO of your real bullets into conservative + balanced versions (Sonnet)
"""

from docx import Document
from app.document_engine import find_experience_bullets
from app.llm import extract_keywords, match_keywords_against_resume, rewrite_bullet


SAMPLE_JD = """
Software Engineer — Backend / Data

We're hiring a backend-leaning software engineer to build and scale our data
ingestion platform. You'll design RESTful APIs, optimize database performance,
and own data pipelines end to end.

Requirements:
- Strong Python and experience with relational databases (SQL Server, PostgreSQL)
- Building and consuming REST APIs
- Experience with containerization (Docker) and CI/CD
- Familiarity with asynchronous processing and multithreading
- Comfortable with TypeScript and modern JavaScript
- Bonus: geospatial data, real-time telemetry, Nginx, cloud deployment

You should be a strong communicator who can collaborate across teams and write
clean, maintainable, well-tested code.
"""


def main():
    # --- Load resume + bullets ---
    doc = Document("test_resume.docx")
    bullets = find_experience_bullets(doc)
    resume_text = "\n".join(p.text for p in doc.paragraphs)

    print("=" * 70)
    print("STAGE 1 — Extracting keywords from the job description (Haiku)")
    print("=" * 70)
    kw = extract_keywords(SAMPLE_JD)
    print(f"Job title : {kw.job_title}")
    print(f"Tools     : {', '.join(kw.tools)}")
    print(f"Hard skills: {', '.join(kw.hard_skills)}")
    print(f"Exact phrases: {', '.join(kw.exact_phrases)}")

    print("\n" + "=" * 70)
    print("GAP ANALYSIS — what your resume already supports")
    print("=" * 70)
    for m in match_keywords_against_resume(kw, resume_text):
        print(f"  [{'MATCH' if m.matched else 'GAP  '}] {m.term}")

    print("\n" + "=" * 70)
    print("STAGE 2 — Rewriting two real bullets (Sonnet)")
    print("=" * 70)
    target_terms = kw.all_terms()
    for b in bullets[:2]:
        print(f"\n--- Bullet [{b.index}] ---")
        print(f"ORIGINAL:\n  {b.text}")
        rw = rewrite_bullet(b.text, target_terms)
        print(f"\nCONSERVATIVE:\n  {rw.conservative}")
        print(f"  keywords used: {rw.keywords_used_conservative}")
        print(f"\nBALANCED:\n  {rw.balanced}")
        print(f"  keywords used: {rw.keywords_used_balanced}")
        print(f"\n  fabrication_check: {rw.fabrication_check}")


if __name__ == "__main__":
    main()
