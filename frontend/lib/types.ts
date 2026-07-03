/** ResumeLens — shared types for the wizard flow. */

export type Step = "entry" | "processing" | "review";

export type FitMode = "compact" | "enhanced" | "none";
export type Tone = "conservative" | "balanced";
export type Mode = "auto" | "manual";

export interface RewriteItem {
  index: number;
  original: string;
  conservative: string;
  balanced: string;
  keywords_used_conservative: string[];
  keywords_used_balanced: string[];
  fabrication_check: string;
}

export interface KeywordMatch {
  term: string;
  matched: boolean;
}

/** Everything the wizard carries from screen to screen. */
export interface FlowState {
  jobTitle: string;
  jobDescription: string;
  sessionId: string | null;
  jobTitleDetected: string;
  keywords: KeywordMatch[];
  gaps: string[];
  rewrites: RewriteItem[];
}

export const emptyFlow: FlowState = {
  jobTitle: "",
  jobDescription: "",
  sessionId: null,
  jobTitleDetected: "",
  keywords: [],
  gaps: [],
  rewrites: [],
};