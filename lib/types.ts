export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  workMode: "Remote" | "Hybrid" | "On-site";
  level: string;
  employmentType: string;
  salaryRange: string;
  skills: string[];
  summary: string;
  description: string;
}

export interface CandidateProfile {
  name: string;
  headline: string;
  yearsExperience: number;
  skills: string[];
  summary: string;
}

export type Fit = "strong" | "good" | "possible";

export interface JobMatch {
  job: Job;
  /** 0-100 blended score */
  score: number;
  fit: Fit;
  reason: string;
  matchedSkills: string[];
  missingSkills: string[];
}

export interface MatchResponse {
  profile: CandidateProfile;
  matches: JobMatch[];
  totalOpenRoles: number;
}
