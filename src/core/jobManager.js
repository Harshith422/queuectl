/**
 * Job management core:
 * - Create and persist new jobs
 * - Support job priority and timeout
 * - Update job states safely
 * - Move permanently failed jobs into DLQ
 */

import { v4 as uuidv4 } from "uuid";
import { readJSON, writeJSON } from "../storage/fileStore.js";
import { DEFAULTS, JOB_STATES } from "../constants.js";
import { nowISO } from "../utils/timestamp.js";

/**
 * Enqueue a new job into the system.
 * Supports optional fields: priority, timeout_ms, and max_retries.
 */
export function enqueueJob(jobInput) {
  const jobs = readJSON(DEFAULTS.JOBS_FILE) || [];

  const job = {
    id: jobInput.id || uuidv4(),
    command: jobInput.command,
    state: JOB_STATES.PENDING,
    attempts: jobInput.attempts || 0,
    max_retries: jobInput.max_retries || DEFAULTS.MAX_RETRIES,
    priority: jobInput.priority || 1, // 🔹 Default low priority
    timeout_ms: jobInput.timeout_ms || 10000, // 🔹 Default 10s timeout
    created_at: nowISO(),
    updated_at: nowISO(),
  };

  // Push and sort by priority (higher value = higher priority)
  jobs.push(job);
  jobs.sort((a, b) => b.priority - a.priority);

  writeJSON(DEFAULTS.JOBS_FILE, jobs);
  console.log(`Job added to queue: ${job.id} (priority ${job.priority})`);
  return job;
}

/**
 * Retrieve all jobs, optionally filtered by state.
 */
export function getJobs(state = null) {
  const jobs = readJSON(DEFAULTS.JOBS_FILE) || [];
  return state ? jobs.filter((j) => j.state === state) : jobs;
}

/**
 * Find a specific job by its ID.
 */
export function findJob(jobId) {
  const jobs = readJSON(DEFAULTS.JOBS_FILE) || [];
  return jobs.find((j) => j.id === jobId);
}

/**
 * Update a job’s data (state, attempts, etc.) safely.
 */
export function updateJob(jobId, updates = {}) {
  const jobs = readJSON(DEFAULTS.JOBS_FILE) || [];
  const index = jobs.findIndex((j) => j.id === jobId);
  if (index === -1) return null;

  jobs[index] = { ...jobs[index], ...updates, updated_at: nowISO() };
  writeJSON(DEFAULTS.JOBS_FILE, jobs);
  return jobs[index];
}

/**
 * Remove a job from the queue (used after moving to DLQ or completing).
 */
export function removeJob(jobId) {
  const jobs = readJSON(DEFAULTS.JOBS_FILE) || [];
  const filtered = jobs.filter((j) => j.id !== jobId);
  writeJSON(DEFAULTS.JOBS_FILE, filtered);
  return true;
}

/**
 * Move a failed job permanently to the Dead Letter Queue (DLQ).
 */
export function moveToDLQ(job, errorMessage = "") {
  const dlq = readJSON(DEFAULTS.DLQ_FILE) || [];

  const deadJob = {
    ...job,
    state: JOB_STATES.DEAD,
    last_error: errorMessage,
    updated_at: nowISO(),
  };

  dlq.push(deadJob);
  writeJSON(DEFAULTS.DLQ_FILE, dlq);

  removeJob(job.id);
  console.log(` Job ${job.id} moved to Dead Letter Queue.`);
}
