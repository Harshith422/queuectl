/**
 * Worker Manager:
 * -Picks pending jobs (honoring priority)
 * -Executes commands safely
 * -Handles retries, exponential backoff, and DLQ transfer
 */

import { readJSON } from "../storage/fileStore.js";
import { runCommand } from "./executor.js";
import { getConfig } from "../storage/configStore.js";
import { calculateBackoffMs } from "./backoff.js";
import { updateJob, moveToDLQ } from "./jobManager.js";
import { DEFAULTS, JOB_STATES } from "../constants.js";
import logger from "../utils/logger.js";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Start multiple worker loops concurrently.
 */
export async function startWorkers(count = 1) {
  logger.info(` Starting ${count} worker(s)`);
  const workers = Array.from({ length: count }, (_, i) => workerLoop(i + 1));
  await Promise.all(workers);
}

/**
 * Worker loop that continuously polls for jobs and processes them.
 */
async function workerLoop(workerId) {
  logger.info(` Worker ${workerId} started`);

  while (true) {
    try {
      const jobs = readJSON(DEFAULTS.JOBS_FILE) || [];

      // Pick highest-priority pending job
      const job = jobs
        .filter((j) => j.state === JOB_STATES.PENDING)
        .sort((a, b) => b.priority - a.priority)[0];

      if (!job) {
        await sleep(1500);
        continue;
      }

      // Mark as processing
      updateJob(job.id, { state: JOB_STATES.PROCESSING });
      logger.info(` Worker ${workerId} picked job ${job.id} (priority ${job.priority})`);

      try {
        // Run command with timeout protection
        await runCommand(job);

        // Mark job as completed
        updateJob(job.id, { state: JOB_STATES.COMPLETED });
        logger.info(` Worker ${workerId} completed job ${job.id}`);
      } catch (err) {
        // Handle failed job
        const attempts = (job.attempts || 0) + 1;
        const { maxRetries } = getConfig();
        const max_retries = job.max_retries || maxRetries;

        if (attempts > max_retries) {
          moveToDLQ(job, err.message);
        } else {
          const delayMs = calculateBackoffMs(attempts);
          logger.info(
            ` Job ${job.id} failed (${err.message}). Retrying in ${delayMs}ms (attempt ${attempts}/${max_retries})`
          );

          updateJob(job.id, {
            state: JOB_STATES.PENDING,
            attempts,
            last_error: err.message,
          });

          await sleep(delayMs);
        }
      }
    } catch (outerErr) {
      logger.info(` Worker ${workerId} loop error: ${outerErr.message}`);
      await sleep(1000);
    }
  }
}
