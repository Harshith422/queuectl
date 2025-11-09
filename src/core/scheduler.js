/**
 * Placeholder for scheduling logic.
 * In future versions, this could handle delayed/scheduled jobs using run_at.
 */
export function scheduleJob(job, runAtISO) {
  job.run_at = runAtISO;
  return job;
}
