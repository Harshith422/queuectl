/**
 * Utility for computing retry backoff delay.
 * delay(ms) = base ^ attempts × 1000
 */
import { getConfig } from "../storage/configStore.js";

export function calculateBackoffMs(attempts = 1) {
  const { backoffBase } = getConfig();
  const safeBase = Number(backoffBase) || 2;
  return Math.pow(safeBase, attempts) * 1000;
}
