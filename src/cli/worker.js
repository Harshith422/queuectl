/**
 * CLI command: queuectl worker:start
 * Spawns one or more worker processes to process jobs concurrently.
 */

import { startWorkers } from "../core/workerManager.js";

export default function register(program) {
  program
    .command("worker:start")
    .option("--count <n>", "Number of worker threads to run", "1")
    .description("Start background worker(s) that continuously process queued jobs.")
    .action((opts) => {
      const count = parseInt(opts.count, 10) || 1;
      console.log(`Launching ${count} worker(s)...`);
      startWorkers(count).catch((err) => {
        console.error("Worker process exited unexpectedly:", err.message);
      });
    });
}
