import type { JobMatch, MatchResponse } from "@/lib/types";

const FIT_LABEL = { strong: "Strong fit", good: "Good fit", possible: "Possible fit" } as const;
const FIT_COLOR = { strong: "text-tide", good: "text-ink", possible: "text-mute" } as const;
const BAR_COLOR = { strong: "bg-tide", good: "bg-ink", possible: "bg-mute/60" } as const;

export default function Results({ data, onReset }: { data: MatchResponse; onReset: () => void }) {
  const { profile, matches, totalOpenRoles } = data;
  const first = profile.name.split(" ")[0] || "you";

  return (
    <div className="mx-auto max-w-6xl gap-12 px-5 pb-20 pt-10 lg:grid lg:grid-cols-[320px_1fr]">
      <aside className="mb-10 lg:sticky lg:top-8 lg:mb-0 lg:self-start">
        <p className="text-sm text-mute">Your profile</p>
        <h2 className="mt-1 font-display text-3xl font-semibold leading-tight">{profile.name}</h2>
        <p className="mt-1 font-medium">{profile.headline}</p>
        <p className="mt-1 text-sm text-mute">
          About {Math.round(profile.yearsExperience)} years of experience
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-mute">{profile.summary}</p>
        <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Skills we found">
          {profile.skills.map((s) => (
            <li key={s} className="rounded-full border border-line bg-white px-2.5 py-1 text-xs">
              {s}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onReset}
          className="mt-8 rounded-md border border-ink px-4 py-2.5 text-sm font-medium transition-colors hover:bg-ink hover:text-white"
        >
          Try another résumé
        </button>
      </aside>

      <section>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {matches.length > 0
            ? `${matches.length} of ${totalOpenRoles} open roles fit ${first}`
            : `No strong matches for ${first} yet`}
        </h1>
        <p className="mt-2 text-mute">Ranked by how closely your experience matches each role.</p>

        {matches.length === 0 ? (
          <p className="mt-8 rounded-lg border border-line bg-white p-6">
            None of our current roles lined up with this résumé. Check back soon, or send us a note at
            careers@careerlens.example and we&apos;ll keep you in mind.
          </p>
        ) : (
          <ul className="mt-8 divide-y divide-line border-y border-line">
            {matches.map((m) => (
              <JobRow key={m.job.id} match={m} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function JobRow({ match }: { match: JobMatch }) {
  const { job, score, fit, reason, matchedSkills, missingSkills } = match;
  const mailto = `mailto:careers@careerlens.example?subject=${encodeURIComponent("Application: " + job.title)}`;

  return (
    <li className="grid gap-4 py-7 sm:grid-cols-[110px_1fr]">
      <div>
        <p className="font-display text-4xl font-semibold leading-none">
          {score}
          <span className="text-xl text-mute">%</span>
        </p>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line" role="img" aria-label={`${score} percent match`}>
          <div className={`bar-grow h-full rounded-full ${BAR_COLOR[fit]}`} style={{ width: `${score}%` }} />
        </div>
        <p className={`mt-2 text-sm font-medium ${FIT_COLOR[fit]}`}>{FIT_LABEL[fit]}</p>
      </div>

      <div>
        <h3 className="font-display text-xl font-semibold leading-snug">{job.title}</h3>
        <p className="mt-1 text-sm text-mute">
          {job.department} <span aria-hidden="true">/</span> {job.location}, {job.workMode.toLowerCase()}{" "}
          <span aria-hidden="true">/</span> {job.level} <span aria-hidden="true">/</span> {job.salaryRange}
        </p>
        <p className="mt-3 leading-relaxed">{reason}</p>

        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Skill match">
          {matchedSkills.map((s) => (
            <li key={s} className="rounded-full bg-tideSoft px-2.5 py-1 text-xs font-medium text-ink">
              {s}
            </li>
          ))}
          {missingSkills.map((s) => (
            <li key={s} className="rounded-full border border-signal/50 px-2.5 py-1 text-xs text-signal">
              Missing: {s}
            </li>
          ))}
        </ul>

        <details className="group mt-4">
          <summary className="cursor-pointer text-sm font-medium text-tide hover:underline">About this role</summary>
          <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-mute">{job.description}</p>
        </details>

        <a
          href={mailto}
          className="mt-5 inline-block rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-tide"
        >
          Apply for this role
        </a>
      </div>
    </li>
  );
}
