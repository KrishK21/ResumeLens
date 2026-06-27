"""
ResumeLens — Session store
==========================

A minimal in-process store that holds, per upload session:
  * the path to the user's uploaded .docx (in a temp dir)
  * the located bullets
  * the most recent rewrite results (so /export can apply chosen tones)

This is intentionally simple for local development. In Step 6 it is replaced
by real auth + object storage (e.g. Supabase) without touching the route code,
because routes only depend on this small interface.

NOTE: in-process state does not survive a server restart and is not safe across
multiple worker processes. Fine for single-process dev; revisit for production.
"""

from __future__ import annotations

import shutil
import tempfile
import time
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional


@dataclass
class Session:
    id: str
    docx_path: Path
    filename: str
    bullets: list  # list[BulletRef]
    created_at: float = field(default_factory=time.time)
    rewrites: dict = field(default_factory=dict)  # index -> RewrittenBullet


class SessionStore:
    def __init__(self) -> None:
        self._sessions: dict[str, Session] = {}
        self._root = Path(tempfile.gettempdir()) / "resumelens_sessions"
        self._root.mkdir(parents=True, exist_ok=True)

    def create(self, src_file: Path, filename: str, bullets: list) -> Session:
        sid = uuid.uuid4().hex
        session_dir = self._root / sid
        session_dir.mkdir(parents=True, exist_ok=True)
        dest = session_dir / "original.docx"
        shutil.copy(src_file, dest)
        sess = Session(id=sid, docx_path=dest, filename=filename, bullets=bullets)
        self._sessions[sid] = sess
        return sess

    def get(self, sid: str) -> Optional[Session]:
        return self._sessions.get(sid)

    def set_rewrites(self, sid: str, rewrites: dict) -> None:
        sess = self._sessions.get(sid)
        if sess is not None:
            sess.rewrites = rewrites

    def cleanup_older_than(self, seconds: int = 3600) -> None:
        """Drop sessions (and their temp files) older than `seconds`."""
        now = time.time()
        for sid in list(self._sessions):
            if now - self._sessions[sid].created_at > seconds:
                self._discard(sid)

    def _discard(self, sid: str) -> None:
        sess = self._sessions.pop(sid, None)
        if sess is not None:
            shutil.rmtree(sess.docx_path.parent, ignore_errors=True)


# Single shared instance for the app process.
store = SessionStore()
