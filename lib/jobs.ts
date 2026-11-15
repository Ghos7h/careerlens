import jobsData from "../data/jobs.json";
import type { Job } from "./types";

export const jobs: Job[] = jobsData as Job[];

/** The text we embed for each job. Richer text = better semantic matching. */
export function jobToText(job: Job): string {
  return [
    `${job.title}. ${job.department} team. ${job.level} level.`,
    `Skills: ${job.skills.join(", ")}.`,
    job.summary,
    job.description,
  ].join(" ");
}
