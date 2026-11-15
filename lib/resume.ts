import { extractText, getDocumentProxy } from "unpdf";
import mammoth from "mammoth";

const clean = (s: string) =>
  s
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

/** Extract plain text from a PDF, DOCX or TXT/MD upload. */
export async function extractResumeText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const bytes = new Uint8Array(await file.arrayBuffer());

  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    const pdf = await getDocumentProxy(bytes);
    const { text } = await extractText(pdf, { mergePages: true });
    return clean(text);
  }

  if (name.endsWith(".docx")) {
    const { value } = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
    return clean(value);
  }

  if (name.endsWith(".txt") || name.endsWith(".md") || file.type.startsWith("text/")) {
    return clean(new TextDecoder().decode(bytes));
  }

  throw new UserError("Unsupported file type. Please upload a PDF, DOCX or TXT file.");
}

/** Errors whose message is safe and useful to show the candidate. */
export class UserError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}
