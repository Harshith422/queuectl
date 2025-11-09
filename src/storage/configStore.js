/**
 * Configuration store for QueueCTL.
 * Handles reading and updating runtime parameters like maxRetries and backoffBase.
 */

import fs from "fs";
import { DEFAULTS } from "../constants.js";

/**
 * Loads configuration values from the config file.
 * Falls back to defaults if the file or keys are missing.
 */
export function getConfig() {
  try {
    if (!fs.existsSync(DEFAULTS.CONFIG_FILE)) {
      return {
        maxRetries: DEFAULTS.MAX_RETRIES,
        backoffBase: DEFAULTS.BACKOFF_BASE,
      };
    }

    const raw = fs.readFileSync(DEFAULTS.CONFIG_FILE, "utf-8").trim();
    const parsed = raw ? JSON.parse(raw) : {};

    return {
      maxRetries: parsed.maxRetries ?? DEFAULTS.MAX_RETRIES,
      backoffBase: parsed.backoffBase ?? DEFAULTS.BACKOFF_BASE,
    };
  } catch (err) {
    console.error(`⚠️  Failed to load config file: ${err.message}`);
    return {
      maxRetries: DEFAULTS.MAX_RETRIES,
      backoffBase: DEFAULTS.BACKOFF_BASE,
    };
  }
}

/**
 * Updates a configuration key and writes it back to disk.
 */
export function setConfig(key, value) {
  const allowedKeys = ["maxRetries", "backoffBase"];

  if (!allowedKeys.includes(key)) {
    console.error(`Invalid config key: '${key}'. Allowed: ${allowedKeys.join(", ")}`);
    return;
  }

  try {
    const currentConfig = getConfig();
    const numericValue = Number(value);
    currentConfig[key] = Number.isNaN(numericValue) ? value : numericValue;

    fs.writeFileSync(DEFAULTS.CONFIG_FILE, JSON.stringify(currentConfig, null, 2));
    console.log(`Config updated → ${key} = ${currentConfig[key]}`);
  } catch (err) {
    console.error(`Failed to update config: ${err.message}`);
  }
}
