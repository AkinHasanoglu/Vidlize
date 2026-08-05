import { Queue } from "bullmq";
import { Redis } from "ioredis";

let _connection: Redis | null = null;
let _queue: Queue | null = null;

function getConnection(): Redis {
  if (!_connection) {
    _connection = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      maxRetriesPerRequest: null,
    });
  }
  return _connection;
}

export function getGenerationQueue(): Queue {
  if (!_queue) {
    _queue = new Queue("generation", {
      connection: getConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 200 },
      },
    });
  }
  return _queue;
}

export { getConnection as connection };
