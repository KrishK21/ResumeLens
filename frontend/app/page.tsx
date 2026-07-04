"use client";

import { useState, useEffect } from "react";
import { Step, FlowState, emptyFlow } from "@/lib/types";
import { useProfile } from "@/lib/useProfile";
import { getSavedResume } from "@/lib/profileApi";
import Shell from "./components/Shell";
import LandingScreen from "./components/LandingScreen";
import EntryScreen from "./components/EntryScreen";
import ProcessingScreen from "./components/ProcessingScreen";
import ReviewScreen from "./components/ReviewScreen";
import ProfileScreen from "./components/ProfileScreen";

type View = Step | "profile" | "landing";

export default function Home() {
  const { profileId, prefs, updatePrefs, loaded } = useProfile();
  const [view, setView] = useState<View>("landing");
  const [flow, setFlowState] = useState<FlowState>(emptyFlow);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  // Saved resume status
  const [savedResumeName, setSavedResumeName] = useState<string | null>(null);
  const [useSaved, setUseSaved] = useState(false);

  const setFlow = (patch: Partial<FlowState>) =>
    setFlowState((prev) => ({ ...prev, ...patch }));

  // On load, seed the default job title and check for a saved resume.
  useEffect(() => {
    if (!loaded || !profileId) return;
    setFlow({ jobTitle: prefs.defaultJobTitle });
    getSavedResume(profileId).then((s) => {
      if (s.has_resume) {
        setSavedResumeName(s.filename);
        setUseSaved(true); // default to using the saved resume
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, profileId]);

  function handleError(msg: string) {
    setError(msg);
    setView("entry");
  }

  function reset() {
    setView("entry");
    setFlowState({ ...emptyFlow, jobTitle: prefs.defaultJobTitle });
    setResumeFile(null);
    setUseSaved(!!savedResumeName);
    setError("");
  }

  function refreshSaved() {
    if (!profileId) return;
    getSavedResume(profileId).then((s) => {
      setSavedResumeName(s.has_resume ? s.filename : null);
      if (s.has_resume) setUseSaved(true);
    });
  }

  if (view === "landing") {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 760,
            background: "var(--rl-bg)",
            border: "0.5px solid var(--rl-border)",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <LandingScreen onStart={() => setView("entry")} onSignIn={() => setView("entry")} />
        </div>
      </main>
    );
  }

  return (
    <Shell step={view} onProfileClick={() => setView(view === "profile" ? "entry" : "profile")}>
      {view === "profile" && (
        <ProfileScreen
          profileId={profileId}
          prefs={prefs}
          updatePrefs={updatePrefs}
          onBack={() => {
            refreshSaved();
            setView("entry");
          }}
        />
      )}

      {view === "entry" && (
        <>
          {error && (
            <div
              style={{
                margin: "24px 48px 0",
                padding: "12px 15px",
                background: "rgba(217,138,126,0.08)",
                border: "0.5px solid rgba(217,138,126,0.3)",
                borderRadius: 10,
                color: "#D98A7E",
                fontSize: 13.5,
              }}
            >
              {error}
            </div>
          )}
          <EntryScreen
            flow={flow}
            setFlow={setFlow}
            resumeFile={resumeFile}
            setResumeFile={(f) => {
              setResumeFile(f);
              setError("");
            }}
            savedResumeName={savedResumeName}
            useSaved={useSaved}
            setUseSaved={setUseSaved}
            onContinue={() => {
              setError("");
              setView("processing");
            }}
            onOpenProfile={() => setView("profile")}
          />
        </>
      )}

      {view === "processing" && (
        <ProcessingScreen
          flow={flow}
          setFlow={setFlow}
          resumeFile={resumeFile}
          useSaved={useSaved}
          profileId={profileId}
          onDone={() => setView("review")}
          onError={handleError}
        />
      )}

      {view === "review" && (
        <ReviewScreen flow={flow} prefs={prefs} onStartOver={reset} />
      )}
    </Shell>
  );
}
