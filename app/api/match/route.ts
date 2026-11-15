import { NextResponse } from "next/server";
import { SAMPLES } from "@/data/samples";
import { matchResume } from "@/lib/match";
import { extractResumeText, UserError } from "@/lib/resume";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 4 * 1024 * 1024; // Vercel request bodies are capped at ~4.5 MB

export async function POST(req: Request) {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      throw new UserError(
        "The server is missing GOOGLE_GENERATIVE_AI_API_KEY. Add it to .env.local (or Vercel env vars).",
        500,
      );
    }

    const form = await req.formData();
    const sampleId = form.get("sampleId");
    const file = form.get("file");
    let text: string;

    if (typeof sampleId === "string" && sampleId) {
      const sample = SAMPLES.find((s) => s.id === sampleId);
      if (!sample) throw new UserError("Unknown sample résumé.", 404);
      text = sample.text;
    } else if (file instanceof File) {
      if (file.size > MAX_BYTES) throw new UserError("That file is over 4 MB. Try a smaller one.", 413);
      text = await extractResumeText(file);
    } else {
      throw new UserError("Upload a résumé file to get started.");
    }

    if (text.length < 80) {
      throw new UserError(
        "We couldn't read enough text from that file. If it's a scanned PDF, try a text-based PDF or DOCX.",
        422,
      );
    }
    console.log('Text ######## ', text);
    return NextResponse.json(await matchResume(text));
  } catch (err) {
    if (err instanceof UserError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("match failed:", err);
    const msg = err instanceof Error ? err.message : "";
    if (/429|quota|rate/i.test(msg)) {
      return NextResponse.json(
        { error: "The free AI quota is used up for the moment. Wait a minute and try again." },
        { status: 429 },
      );
    }
    return NextResponse.json({ error: "Something went wrong while matching. Please try again." }, { status: 500 });
  }
}
