/**
 * Dead Letter Queue (DLQ) storage handler.
 * Provides small helper methods for reading/writing DLQ data from disk.
 */

import { readJSON, writeJSON } from "./fileStore.js";
import { DEFAULTS } from "../constants.js";

/**
 * Reads all failed jobs from the Dead Letter Queue file.
 */
export function readDLQ() {
  return readJSON(DEFAULTS.DLQ_FILE) || [];
}

/**
 * Writes updated DLQ data back to disk.
 */
export function writeDLQ(data) {
  writeJSON(DEFAULTS.DLQ_FILE, data);
}
