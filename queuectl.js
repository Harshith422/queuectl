#!/usr/bin/env node
/**
 * QueueCTL - CLI Entry Point
 * Commands:
 *   queuectl enqueue <job>     -Add a job to the queue
 *   queuectl worker:start      -Start one or more worker processes
 *   queuectl list [--state]    -View queued or completed jobs
 *   queuectl dlq:list          -View failed jobs in the Dead Letter Queue
 *   queuectl dlq:retry <id>    -Retry a job from the DLQ
 *   queuectl status            -Show queue summary
 */

import { Command } from "commander";

// CLI command modules
import enqueue from "./src/cli/enqueue.js";
import worker from "./src/cli/worker.js";
import list from "./src/cli/list.js";
import dlq from "./src/cli/dlq.js";
import status from "./src/cli/status.js";

// Initialize Commander
const program = new Command();

program
  .name("queuectl")
  .description("CLI-based background job queue manager")
  .version("1.0.0");

// Register command groups
enqueue(program);
worker(program);
list(program);
dlq(program);
status(program);

// Parse user input
program.parse(process.argv);
