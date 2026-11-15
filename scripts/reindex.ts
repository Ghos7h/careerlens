// Re-embeds every job in data/jobs.json and writes it to the vector store.
// Run after editing jobs:  npm run reindex
import { jobs } from "../lib/jobs";
import { indexJobs, storeName } from "../lib/vector-store";

async function main() {
  console.log(`Embedding ${jobs.length} jobs into the "${storeName()}" store...`);
  await indexJobs(jobs);
  console.log("Done.");
  if (storeName() === "memory") {
    console.log("Note: no Upstash credentials found, so this only touched in-memory state and is a no-op.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
