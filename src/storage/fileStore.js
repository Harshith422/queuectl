/**
 * File storage utility for reading and writing JSON data.
 * Ensures data persistence across restarts and minimizes corruption risk.
 */

import fs from "fs";

/**
 * Reads JSON safely from the given path.
 * Returns [] if the file doesn't exist or is empty.
 */
export function readJSON(filePath) {
  try {
    if (!fs.existsSync(filePath)) return [];

    const raw = fs.readFileSync(filePath, "utf-8").trim();
    if (!raw) return [];

    const data = JSON.parse(raw);

    // Support both plain array or object with "jobs" property
    if (Array.isArray(data)) return data;
    if (data.jobs) return data.jobs;

    return data;
  } catch (err) {
    console.error(`Failed to read JSON file (${filePath}):`, err.message);
    return [];
  }
}

/**
 * Writes JSON to disk atomically (write → rename).
 * Prevents file corruption if process crashes mid-write.
 */
export function writeJSON(filePath, data) {
  try {
    const tempPath = `${filePath}.tmp`;
    const jsonString = JSON.stringify(data, null, 2);

    fs.writeFileSync(tempPath, jsonString);
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    console.error(`Failed to write JSON file (${filePath}):`, err.message);
  }
}
