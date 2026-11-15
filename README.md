# CareerLens Careers Match (POC)

A candidate uploads a résumé on a company careers page and instantly sees the open roles that fit, ranked, with a plain-language reason for each and a skill-by-skill breakdown.

Built with **Next.js 15 (App Router) + React 19 + TypeScript + Node.js**, the **Vercel AI SDK**, and a **100% free stack**.

---

## How it works

```
Browser (React)                    Next.js API route (Node.js)                       Free services
───────────────                    ───────────────────────────                       ─────────────
Upload PDF/DOCX/TXT ──POST────────▶ 1. Extract text (unpdf / mammoth)
                                    2. generateObject()  ─────────────────────────▶ Gemini 2.5 Flash
                                       → structured profile (title, skills, years, summary)
                                    3. embed()  ──────────────────────────────────▶ Gemini embeddings (768-d)
                                    4. Vector search top 10 ─────────────────────▶ Memory store  or  Upstash Vector
                                    5. Re-rank: 60% semantic similarity + 40% skill overlap
                                    6. generateObject() → one-sentence "why it fits" per job ▶ Gemini 2.5 Flash
Ranked results ◀───────JSON─────── 7. Return profile + matches
```

Jobs live in `data/jobs.json`. On the first request, each job is embedded once (one batched call) and stored in the vector store.

### Scoring

For each shortlisted job:

- `semantic` = cosine similarity between the résumé profile and the job, stretched from the typical 0.5–0.8 range to 0–1
- `overlap` = share of the job's required skills found in the résumé (via the LLM's skill list or a direct text match)
- `score = round(100 × (0.6 × semantic + 0.4 × overlap))`
- Fit label: **Strong** ≥ 70, **Good** ≥ 50, otherwise **Possible**. Jobs under 20 are hidden.

Embeddings capture meaning ("built dispatch dashboards" ≈ "freight planner UI"), and the skill overlap keeps results explainable. Tune the weights in `lib/match.ts`.

---

## Free resources used

| Need | Service | Free tier | Notes |
|---|---|---|---|
| LLM + embeddings | **Google Gemini API** via `@ai-sdk/google` | Free, no credit card | NA|
| Vector DB | **In-memory** (default) | n/a | Zero setup. Rebuilt on cold start (one API call) |
| Hosting | **Vercel Hobby** | Free | Deploy straight from GitHub |

> **Privacy note:** Google's free Gemini tier may use submitted content to improve its products. Fine for a POC with sample data. For real candidate data, use a paid tier or another provider (swap one line in `lib/ai.ts` thanks to the AI SDK).

---

## Run locally

Requires Node.js 20+.

```bash
npm install
cp .env.example .env.local        # then paste your GOOGLE_GENERATIVE_AI_API_KEY
npm run dev
```

Open <http://localhost:3000>.

### Try it with test data

- Click one of the **sample résumé** chips (Frontend engineer, Data scientist, Product designer). No file needed.
- Or upload your own PDF, DOCX or TXT. Sample text lives in `data/samples.ts`.

Expected results (roughly):

| Sample | Top matches |
|---|---|
| Frontend engineer | Senior Frontend Engineer, Full-Stack Engineer, QA Automation |
| Data scientist | ML Engineer (ETA), Data Analyst, Data Engineer |
| Product designer | Senior Product Designer, Product Manager |

Exact scores vary slightly by model version.

---

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. In Vercel: **Add New → Project → import the repo** (framework auto-detects as Next.js).
3. Add environment variable `GOOGLE_GENERATIVE_AI_API_KEY`.
4. **Deploy.**

---

## Project structure

```
app/
  page.tsx               Page shell (server component)
  layout.tsx             Fonts + metadata
  api/match/route.ts     POST endpoint: file or sampleId → matches
components/
  Matcher.tsx            Upload, drag-and-drop, samples, loading steps (client)
  Results.tsx            Candidate profile + ranked job list
lib/
  ai.ts                  Vercel AI SDK: embeddings, profile extraction, explanations
  vector-store.ts        Memory + Upstash stores behind one interface
  resume.ts              PDF / DOCX / TXT text extraction
  match.ts               The pipeline and scoring
  jobs.ts, types.ts
data/
  jobs.json              16 sample jobs for the fictional company CareerLens
  samples.ts             3 sample résumés
scripts/reindex.ts       Re-embed jobs into Upstash
```

---

## Limits of this POC (and next steps)

- **No auth, rate limiting or CAPTCHA.** Anyone with the URL can spend your free quota. Add Vercel's WAF/rate limits before sharing widely.
- **Scanned PDFs** (images) aren't supported. Add OCR if needed.
- **Free Gemini quotas** are low; heavy use returns a friendly "try again in a minute" message.
- Jobs are a static JSON file. Next step: load from your ATS or CMS and re-embed on change.
- Ideas: filters (location, remote), "save my matches", email capture, evaluation set to tune scoring weights.
