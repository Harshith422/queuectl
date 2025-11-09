/**
 * Lightweight file lock utility.
 * Used to prevent concurrent file writes and ensure data consistency.
 * The lock is implemented by creating a temporary file.
 * If the file already exists, the operation waits until it’s released or times out.
 */

import fs from "fs";

/**
 * Attempts to acquire a lock by creating a temporary lock file.
 * Returns true if lock acquired, false if timed out.
 */
export function acquireLock(lockPath, timeoutMs = 5000) {
  const start = Date.now();

  while (true) {
    try {
      // Create a lock file atomically ("wx" fails if file exists)
      const fd = fs.openSync(lockPath, "wx");
      fs.writeSync(fd, String(process.pid));
      fs.closeSync(fd);
      return true;
    } catch {
      // Wait briefly if another process holds the lock
      if (Date.now() - start > timeoutMs) {
        return false;
      }
      blockSleep(50);
    }
  }
}

/**
 * Releases a previously acquired lock.
 */
export function releaseLock(lockPath) {
  try {
    if (fs.existsSync(lockPath)) {
      fs.unlinkSync(lockPath);
    }
  } catch {
    // Lock removal failures are safe to ignore
  }
}

/**
 * Simple synchronous sleep (blocking) for small wait durations.
 */
function blockSleep(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    // busy wait (acceptable for short delays)
  }
}
