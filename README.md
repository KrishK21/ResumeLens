# ResumeLens

Paste a job description, and ResumeLens rewrites the **bullet points of your
real experience** to surface the keywords that modern AI/LLM resume screeners
look for — then exports a new copy of your resume that keeps your **exact
original formatting** and stays **fully machine-readable** (real selectable
text, never an image).

> ResumeLens **never fabricates** jobs, employers, dates, or metrics. It only
> rephrases bullet points you already have, using truthful, job-relevant
> language. A human-in-the-loop review mode lets you confirm every change.

---

## How it works

```
upload .docx ─▶ detect experience/project bullets
                      │
paste job desc ─▶ extract required keywords (Claude Haiku)
                      │
                      ▼
            rewrite each REAL bullet to include
            relevant keywords  (Claude Sonnet)
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
   AUTO mode                   MANUAL mode
 (apply best picks)        (you confirm / edit each)
        └─────────────┬─────────────┘
                      ▼
     swap bullet text into the ORIGINAL .docx
     (run-level edit → formatting preserved)
                      ▼
     export PDF via LibreOffice (selectable text)
                      ▼
            verify text is parseable ✔
                      ▼
                  download
```

## Tech stack

| Layer        | Choice                                   |
|--------------|------------------------------------------|
| Frontend     | Next.js (React) + TypeScript + Tailwind  |
| Backend      | Python + FastAPI                         |
| Doc engine   | python-docx (edit) + LibreOffice (PDF)   |
| LLM          | Anthropic Claude (Sonnet + Haiku)        |
| Auth/DB      | (added later) Clerk or Supabase          |

Python on the backend is deliberate: the reliable document-manipulation
tools (`python-docx`, LibreOffice) are Python/CLI.

## Repo structure

```
ResumeLens/
├── backend/
│   ├── app/
│   │   └── document_engine.py   # ✅ core engine (working)
│   │   └── config.py
│   │   └── main.pu
│   │   └── schemas.py
│   │   └── store.py
│   │   └── LLM.py
│   ├── requirements.txt        
│   └── .env                     # secrets (gitignored)
├── frontend/                    # Next.js app (added in Step 5)
├── .gitignore                   # keeps secrets & resumes out of git
└── README.md
```

## Security

- **No secrets in git.** `.env` is gitignored; only
- **No personal data in git.** `*.docx` / `*.pdf` / `uploads/` are gitignored so
  real resumes (with names, phones, emails) never enter history.
- API keys are scoped per-project with a spend cap set in the Anthropic Console.

## Status

- [x] **Step 2 — Document engine** (bullet swap + selectable-PDF export). Proven.
- [ ] Step 3 — LLM integration (keyword extraction + bullet rewrite)
- [ ] Step 4 — FastAPI backend
- [ ] Step 5 — Next.js UI
- [ ] Step 6 — Auth, storage, deploy

See `SETUP.md` for local setup.
