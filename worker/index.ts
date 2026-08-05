import "dotenv/config";
import { Worker } from "bullmq";
import { Redis } from "ioredis";
import { processGenerationJob, handleJobFailure } from "./processors/generation";

const connection = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "generation",
  async (job) => {
    const { jobId } = job.data as { jobId: string };
    console.log(`[worker] Processing job ${jobId} (attempt ${job.attemptsMade + 1})`);
    await processGenerationJob(jobId);
    console.log(`[worker] Job ${jobId} completed`);
  },
  {
    connection,
    concurrency: 3,
  }
);

worker.on("failed", async (job, err) => {
  if (!job) return;
  const { jobId } = job.data as { jobId: string };
  const isLastAttempt = job.attemptsMade >= (job.opts.attempts ?? 3);
  if (isLastAttempt) {
    console.error(`[worker] Job ${jobId} permanently failed: ${err.message}`);
    await handleJobFailure(jobId, err.message).catch(console.error);
  } else {
    console.warn(`[worker] Job ${jobId} failed (attempt ${job.attemptsMade}), will retry`);
  }
});

worker.on("error", (err) => {
  console.error("[worker] Worker error:", err);
});

console.log("[worker] Generation worker started, listening for jobs...");

// Graceful shutdown
process.on("SIGTERM", async () => {
  await worker.close();
  process.exit(0);
});
