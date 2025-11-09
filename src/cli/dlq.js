/**
 * CLI command group: queuectl dlq:list / dlq:retry
 * Lets users view and requeue permanently failed jobs.
 */

import { readJSON, writeJSON } from "../storage/fileStore.js";
import { DEFAULTS } from "../constants.js";
import { enqueueJob } from "../core/jobManager.js";

export default function register(program) {
  // List all DLQ jobs
  program
    .command("dlq:list")
    .description("Display all jobs currently stored in the Dead Letter Queue (DLQ).")
    .action(() => {
      const dlq = readJSON(DEFAULTS.DLQ_FILE) || [];

      if (dlq.length === 0) {
        console.log("The Dead Letter Queue is empty.");
        return;
      }

      console.table(
        dlq.map((job) => ({
          id: job.id,
          command: job.command,
          attempts: job.attempts,
          last_error: job.last_error,
        }))
      );
    });

  // Retry a DLQ job
  program
    .command("dlq:retry <jobId>")
    .description("Re-enqueue a job from the DLQ for another execution attempt.")
    .action((jobId) => {
      const dlq = readJSON(DEFAULTS.DLQ_FILE) || [];
      const jobIndex = dlq.findIndex((j) => j.id === jobId);

      if (jobIndex === -1) {
        console.error(`No job found in DLQ with ID: ${jobId}`);
        return;
      }

      const job = dlq[jobIndex];
      job.attempts = 0;
      job.state = "pending";

      enqueueJob(job);

      // Remove the job from DLQ once requeued
      dlq.splice(jobIndex, 1);
      writeJSON(DEFAULTS.DLQ_FILE, dlq);

      console.log(`Job ${jobId} has been successfully moved back to the queue.`);
    });
}
