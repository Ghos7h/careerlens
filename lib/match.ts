import { embedQuery, explainMatches, extractProfile } from "./ai";
import { jobs } from "./jobs";
import { ensureIndexed, getStore } from "./vector-store";
import type { Fit, JobMatch, MatchResponse } from "./types";

const TOP_K = 10;
const RETURN_MAX = 8;
const MIN_SCORE = 20;

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const norm = (s: string) => s.toLowerCase().replace(/\.js$/, "").replace(/[^a-z0-9+#]/g, "");

function mentions(text: string, skill: string): boolean {
  const esc = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9+#])${esc}($|[^a-z0-9+#])`).test(text);
}

function fitLabel(score: number): Fit {
  return score >= 70 ? "strong" : score >= 50 ? "good" : "possible";
}

export async function matchResume(resumeText: string): Promise<MatchResponse> {
  // 1. LLM turns messy resume text into a clean profile.
  const profile = await extractProfile(resumeText);

  // 2. Make sure jobs are embedded in the vector store.
  await ensureIndexed(jobs);

  // 3. Embed the candidate and retrieve the closest jobs.
  const queryText = `${profile.headline}. Skills: ${profile.skills.join(", ")}. ${profile.summary}`;
  const hits = await getStore().query(await embedQuery(queryText), TOP_K);

  // 4. Blend semantic similarity with explicit skill overlap.
  const resumeLower = resumeText.toLowerCase();
  const candidateSkills = new Set(profile.skills.map(norm));
  const byId = new Map(jobs.map((j) => [j.id, j]));

  const scored = hits
    .map((hit) => {
      const job = byId.get(hit.id);
      if (!job) return null;
      const matchedSkills = job.skills.filter(
        (s) => candidateSkills.has(norm(s)) || mentions(resumeLower, s),
      );
      const missingSkills = job.skills.filter((s) => !matchedSkills.includes(s));
      const overlap = matchedSkills.length / job.skills.length;
      // Gemini cosine scores for related texts sit around 0.5-0.8; stretch to 0..1.
      const semantic = clamp01((hit.score - 0.5) / 0.3);
      const score = Math.round(100 * (0.6 * semantic + 0.4 * overlap));
      return { job, matchedSkills, missingSkills, score };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.score - a.score)
    .filter((x) => x.score >= MIN_SCORE)
    .slice(0, RETURN_MAX);

  // 5. One LLM call writes a short reason for each shortlisted job.
  const reasons = await explainMatches(profile, scored);

  const matches: JobMatch[] = scored.map((s) => ({
    ...s,
    fit: fitLabel(s.score),
    reason:
      reasons[s.job.id] ??
      `You already use ${s.matchedSkills.length} of the ${s.job.skills.length} skills this role asks for.`,
  }));

  return { profile, matches, totalOpenRoles: jobs.length };
}
