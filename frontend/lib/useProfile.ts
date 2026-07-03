"use client";

import { useState, useEffect, useCallback } from "react";
import { FitMode, Tone } from "./types";

export interface ProfilePrefs {
  defaultJobTitle: string;
  defaultFitMode: FitMode;
  defaultTone: Tone;
  defaultFormat: "pdf" | "docx";
}

const DEFAULT_PREFS: ProfilePrefs = {
  defaultJobTitle: "",
  defaultFitMode: "compact",
  defaultTone: "balanced",
  defaultFormat: "pdf",
};

const PROFILE_ID_KEY = "resumelens_profile_id";
const PREFS_KEY = "resumelens_prefs";

/** Generate a URL-safe random id for the profile (until real accounts exist). */
function makeId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function useProfile() {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<ProfilePrefs>(DEFAULT_PREFS);
  const [loaded, setLoaded] = useState(false);

  // Load (or create) profile id + prefs from localStorage on mount.
  useEffect(() => {
    try {
      let id = localStorage.getItem(PROFILE_ID_KEY);
      if (!id) {
        id = makeId();
        localStorage.setItem(PROFILE_ID_KEY, id);
      }
      setProfileId(id);

      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
    } catch {
      // localStorage unavailable (private mode, etc.) — fall back to defaults.
      setProfileId(makeId());
    } finally {
      setLoaded(true);
    }
  }, []);

  const updatePrefs = useCallback((patch: Partial<ProfilePrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      } catch {
        /* ignore write failures */
      }
      return next;
    });
  }, []);

  return { profileId, prefs, updatePrefs, loaded };
}
