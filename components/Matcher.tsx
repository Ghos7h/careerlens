"use client";

import { useEffect, useRef, useState } from "react";
import type { MatchResponse } from "@/lib/types";
import Results from "./Results";

type State =
  | { phase: "idle" }
  | { phase: "loading"; label: string }
  | { phase: "done"; data: MatchResponse }
  | { phase: "error"; message: string };

const MAX_BYTES = 4 * 1024 * 1024;
const STEPS = [
  "Reading your résumé",
  "Picking out your strengths",
  "Comparing with open roles",
  "Writing up why each role fits",
];

export default function Matcher({
  samples,
  roleCount,
}: {
  samples: { id: string; label: string }[];
  roleCount: number;
}) {
  const [state, setState] = useState<State>({ phase: "idle" });
  const [dragging, setDragging] = useState(false);

  async function submit(form: FormData, label: string) {
    setState({ phase: "loading", label });
    try {
      const res = await fetch("/api/match", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
      setState({ phase: "done", data: json as MatchResponse });
      window.scrollTo({ top: 0 });
    } catch (e) {
      setState({ phase: "error", message: e instanceof Error ? e.message : "Something went wrong." });
    }
  }

  function handleFile(file?: File | null) {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setState({ phase: "error", message: "That file is over 4 MB. Try a smaller PDF, DOCX or TXT file." });
      return;
    }
    const form = new FormData();
    form.append("file", file);
    submit(form, file.name);
  }

  function handleSample(id: string, label: string) {
    const form = new FormData();
    form.append("sampleId", id);
    submit(form, `Sample: ${label}`);
  }

  if (state.phase === "done") {
    return <Results data={state.data} onReset={() => setState({ phase: "idle" })} />;
  }

  const busy = state.phase === "loading";

  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-5 py-14 lg:grid-cols-[1fr_480px] lg:items-center lg:py-24">
      <div>
        <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
          Find the open roles that fit your résumé.
        </h1>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-mute">
          Upload your résumé and we&apos;ll compare it with all {roleCount} open roles at CareerLens, then rank the best
          fits and show you why.
        </p>
        <p className="mt-4 text-sm text-mute">CareerLens doesn&apos;t store your résumé.</p>
      </div>

      <div>
        {busy ? (
          <Loading label={state.label} />
        ) : (
          <>
            <input
              id="resume"
              type="file"
              accept=".pdf,.docx,.txt,.md,application/pdf"
              className="peer sr-only"
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <label
              htmlFor="resume"
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                handleFile(e.dataTransfer.files?.[0]);
              }}
              className={`flex cursor-pointer flex-col items-start gap-4 rounded-lg border-2 border-dashed p-8 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-tide peer-focus-visible:ring-offset-2 ${
                dragging ? "border-tide bg-tideSoft" : "border-line bg-white hover:border-tide"
              }`}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0E7C86" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
              </svg>
              <span className="font-display text-2xl font-semibold">Drop your résumé here</span>
              <span className="text-mute">PDF, DOCX or TXT, up to 4 MB.</span>
              <span className="rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-white">Choose a file</span>
            </label>

            {state.phase === "error" && (
              <p role="alert" className="mt-4 rounded-md border border-signal/40 bg-white px-4 py-3 text-sm text-signal">
                {state.message}
              </p>
            )}

            <div className="mt-6">
              <p className="text-sm text-mute">No résumé handy? Try a sample.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {samples.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSample(s.id, s.label)}
                    className="rounded-full border border-line bg-white px-4 py-1.5 text-sm font-medium transition-colors hover:border-tide hover:text-tide"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function Loading({ label }: { label: string }) {
  const [step, setStep] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timer.current = setInterval(() => setStep((n) => Math.min(n + 1, STEPS.length - 1)), 2200);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  return (
    <div role="status" aria-live="polite" className="rounded-lg border border-line bg-white p-8">
      <p className="truncate text-sm text-mute">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold">Finding your best matches</p>
      <ul className="mt-6 space-y-3">
        {STEPS.map((s, i) => (
          <li key={s} className={`flex items-center gap-3 ${i > step ? "text-mute/60" : ""}`}>
            <span
              className={`grid h-5 w-5 place-items-center rounded-full text-[11px] ${
                i < step ? "bg-tide text-white" : i === step ? "border-2 border-tide" : "border border-line"
              }`}
              aria-hidden="true"
            >
              {i < step ? "✓" : ""}
            </span>
            <span className={i === step ? "font-medium" : ""}>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
