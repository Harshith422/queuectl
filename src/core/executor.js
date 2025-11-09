/**
 * Executes a given shell command for a queued job with timeout protection.
 * Logs all stdout, stderr, and failure details for monitoring.
 */

import { exec } from "child_process";
import fs from "fs";
import path from "path";
import logger from "../utils/logger.js";

const logsDir = path.resolve("./logs");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
const DEFAULT_TIMEOUT_MS = 10000;

/**
 * Executes a shell command for a given job.
 * @param {Object} job - Job object containing {id, command, timeout_ms}
 * @returns {Promise<string>} Resolves with stdout if successful, rejects on error or timeout.
 */
export function runCommand(job) {
  return new Promise((resolve, reject) => {
    const startTime = new Date();
    const timeoutMs = job.timeout_ms || DEFAULT_TIMEOUT_MS;
    const logFile = path.join(logsDir, `job-${job.id}.log`);

    logger.info(`Executing job ${job.id} (timeout ${timeoutMs / 1000}s)`);

    const child = exec(job.command, { windowsHide: true, timeout: timeoutMs }, (error, stdout, stderr) => {
      const endTime = new Date();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      const logContent = [
        `=== JOB ${job.id} | START: ${startTime.toISOString()} | END: ${endTime.toISOString()} ===`,
        `COMMAND: ${job.command}`,
        `DURATION: ${duration}s`,
        `STDOUT:\n${stdout || "(empty)"}`,
        `STDERR:\n${stderr || "(empty)"}`,
        error ? `ERROR: ${error.message}` : "",
      ].join("\n\n");

      // Write job logs safely to a file
      try {
        fs.appendFileSync(logFile, logContent + "\n\n");
      } catch {
        logger.info(`Unable to write log file for job ${job.id}`);
      }

      if (error) {
        const errMsg = error.killed
          ? ` Job ${job.id} timed out after ${timeoutMs / 1000}s`
          : stderr || error.message;
        logger.info(`Job ${job.id} failed: ${errMsg}`);
        return reject(new Error(errMsg));
      }

      logger.info(`Job ${job.id} completed successfully in ${duration}s`);
      resolve(stdout?.trim() || "");
    });

    // Handle unexpected process errors
    child.on("error", (err) => {
      logger.info(`Job ${job.id} encountered an execution error: ${err.message}`);
      reject(err);
    });
  });
}
