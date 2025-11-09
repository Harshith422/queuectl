/**
 * Centralized logger for QueueCTL.
 * Uses Winston to log both to console and to a dedicated file under /logs.
 */

import fs from "fs";
import path from "path";
import { createLogger, format, transports } from "winston";

const logsDir = path.resolve("./logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(({ timestamp, level, message }) => `${timestamp} ${level.toUpperCase()}: ${message}`)
  ),
  transports: [
    new transports.Console(), 
    new transports.File({ filename: path.join(logsDir, "worker-activity.log") }), 
  ],
});

export default logger;
