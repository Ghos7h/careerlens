import Matcher from "@/components/Matcher";
import { SAMPLES } from "@/data/samples";
import { jobs } from "@/lib/jobs";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="/" className="flex items-center gap-2.5 font-display text-xl font-semibold tracking-tight">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <rect width="28" height="28" rx="7" fill="#0F2A2E" />
              <path d="M5 11c3-3 6 3 9 0s6 3 9 0M5 18c3-3 6 3 9 0s6 3 9 0" stroke="#7FD4DB" strokeWidth="2" strokeLinecap="round" />
            </svg>
            CareerLens
          </a>
          <span className="text-sm text-mute">Careers</span>
        </div>
      </header>

      <main className="flex-1">
        <Matcher samples={SAMPLES.map(({ id, label }) => ({ id, label }))} roleCount={jobs.length} />
      </main>

      <footer className="border-t border-line py-6 text-center text-sm text-mute">
        CareerLens is a fictional company. Roles shown are sample data for a proof of concept.
      </footer>
    </div>
  );
}
