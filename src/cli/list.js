/**
 * CLI command: queuectl list
 * Lists all jobs in the system, optionally filtered by their current state.
 */

import { getJobs } from "../core/jobManager.js";

export default function register(program) {
  program
    .command("list")
    .option("--state <state>", "Filter jobs by a specific state (e.g., pending, completed)")
    .description("Display all queued jobs and their status.")
    .action((opts) => {
      const jobs = getJobs(opts.state);

      if (!jobs || jobs.length === 0) {
        console.log("No jobs found for the given filter.");
        return;
      }

      console.table(
        jobs.map((j) => ({
          id: j.id,
          command: j.command,
          state: j.state,
          attempts: j.attempts,
          max_retries: j.max_retries,
          updated_at: j.updated_at,
        }))
      );
    });
}
