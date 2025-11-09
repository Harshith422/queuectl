/**
 * CLI: Status & Dashboard commands
 * - Shows queue summary in CLI
 * - Starts web dashboard (Express-based)
 */

import { getJobs } from "../core/jobManager.js";
import { readJSON } from "../storage/fileStore.js";
import { DEFAULTS } from "../constants.js";
import { startDashboard } from "../web/dashboard.js";

export default function register(program) {
  // 🧩 1️⃣ CLI Queue Status
  program
    .command("status")
    .description("Show summary of all job states and DLQ")
    .action(() => {
      const jobs = getJobs();
      const dlq = readJSON(DEFAULTS.DLQ_FILE) || [];

      const summary = {
        pending: jobs.filter((j) => j.state === "pending").length,
        processing: jobs.filter((j) => j.state === "processing").length,
        completed: jobs.filter((j) => j.state === "completed").length,
        failed: jobs.filter((j) => j.state === "failed").length,
        dead: dlq.length,
      };

      console.log("\n Current Queue Summary");
      console.table([summary]);
    });

  program
    .command("dashboard")
    .option("--port <port>", "Port to run dashboard", "3000")
    .description("Launch minimal web dashboard to visualize jobs")
    .action((opts) => {
      const port = Number(opts.port) || 3000;
      startDashboard(port);
    });
}
