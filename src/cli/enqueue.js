/**
 * CLI command: queuectl enqueue
 * Allows enqueuing one or multiple background jobs.
 * Supports inline JSON or a file path containing job definitions.
 */

import fs from "fs";
import path from "path";
import { enqueueJob } from "../core/jobManager.js";

export default function register(program) {
  program
    .command("enqueue <input>")
    .description("Add one or multiple jobs to the queue (accepts JSON string or JSON file path).")
    .action((input) => {
      try {
        // Clean PowerShell wrapping quotes
        const cleanedInput = input.trim().replace(/^['"]|['"]$/g, "");
        let jobData;

        // If input is a file path, read it; otherwise treat as JSON string
        const fullPath = path.resolve(cleanedInput);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, "utf-8").trim();
          jobData = JSON.parse(content);
        } else {
          jobData = JSON.parse(cleanedInput);
        }
 
        if (Array.isArray(jobData)) {
          console.log(`Found ${jobData.length} job(s) in the file. Adding to queue...`);
          jobData.forEach((job, i) => {
            if (!job.command) {
              console.error(` Skipping job at index ${i}: Missing 'command' field.`);
              return;
            }
            const added = enqueueJob(job);
            console.log(` Enqueued job ${added.id}: "${job.command}" (priority ${job.priority ?? 'default'})`);
          });
          console.log(` Successfully enqueued ${jobData.length} job(s).`);
        }
        else if (jobData.command) {
          const added = enqueueJob(jobData);
          console.log(` Enqueued job ${added.id}: "${jobData.command}"`);
        } 
        else {
          console.error(" Invalid job format: Missing 'command' field.");
        }

      } catch (err) {
        console.error(" Unable to enqueue job(s):", err.message);
      }
    });
}
