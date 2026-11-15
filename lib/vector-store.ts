import { Index } from "@upstash/vector";
import { embedDocuments } from "./ai";
import { jobToText } from "./jobs";
import type { Job } from "./types";

export interface VectorHit {
  id: string;
  /** Cosine similarity, roughly 0..1 for text embeddings. */
  score: number;
}

export interface VectorStore {
  count(): Promise<number>;
  upsert(items: { id: string; vector: number[] }[]): Promise<void>;
  query(vector: number[], topK: number): Promise<VectorHit[]>;
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0,
    na = 0,
    nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}

/** Zero-setup store. Lives in server memory; rebuilt on cold start. */
class MemoryStore implements VectorStore {
  private vectors = new Map<string, number[]>();
  async count() {
    return this.vectors.size;
  }
  async upsert(items: { id: string; vector: number[] }[]) {
    for (const i of items) this.vectors.set(i.id, i.vector);
  }
  async query(vector: number[], topK: number) {
    return [...this.vectors.entries()]
      .map(([id, v]) => ({ id, score: cosine(vector, v) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

/** Persistent store on Upstash Vector (free tier). */
class UpstashStore implements VectorStore {
  private index = new Index({
    url: process.env.UPSTASH_VECTOR_REST_URL!,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
  });
  async count() {
    const info = await this.index.info();
    return info.vectorCount;
  }
  async upsert(items: { id: string; vector: number[] }[]) {
    await this.index.upsert(items.map((i) => ({ id: i.id, vector: i.vector })));
  }
  async query(vector: number[], topK: number) {
    const res = await this.index.query({ vector, topK, includeVectors: true });
    // Re-score locally so scores are true cosine similarity for both stores.
    return res.map((r) => ({ id: String(r.id), score: cosine(vector, r.vector ?? []) }));
  }
}

const g = globalThis as unknown as { __store?: VectorStore; __ready?: Promise<void> | null };

export function getStore(): VectorStore {
  if (!g.__store) {
    const hasUpstash = process.env.UPSTASH_VECTOR_REST_URL && process.env.UPSTASH_VECTOR_REST_TOKEN;
    g.__store = hasUpstash ? new UpstashStore() : new MemoryStore();
  }
  return g.__store;
}

export function storeName(): string {
  return getStore() instanceof UpstashStore ? "upstash" : "memory";
}

/** Embed every job and write it to the store. Safe to run repeatedly. */
export async function indexJobs(jobs: Job[]): Promise<void> {
  const vectors = await embedDocuments(jobs.map(jobToText));
  await getStore().upsert(jobs.map((j, i) => ({ id: j.id, vector: vectors[i] })));
}

/** Index jobs once per server instance, only if the store is not already populated. */
export function ensureIndexed(jobs: Job[]): Promise<void> {
  if (!g.__ready) {
    g.__ready = (async () => {
      if ((await getStore().count()) >= jobs.length) return;
      await indexJobs(jobs);
    })().catch((err) => {
      g.__ready = null; // allow retry on next request
      throw err;
    });
  }
  return g.__ready;
}
