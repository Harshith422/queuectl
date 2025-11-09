/**
 * Minimal Web Dashboard for QueueCTL
 * Provides a visual overview of job states, priorities, and DLQ
 */

import express from "express";
import { readJSON } from "../storage/fileStore.js";
import { DEFAULTS } from "../constants.js";

export function startDashboard(port = 3000) {
  const app = express();

  app.get("/", (req, res) => {
    const jobs = readJSON(DEFAULTS.JOBS_FILE) || [];
    const dlq = readJSON(DEFAULTS.DLQ_FILE) || [];

    const summary = {
      pending: jobs.filter(j => j.state === "pending").length,
      processing: jobs.filter(j => j.state === "processing").length,
      completed: jobs.filter(j => j.state === "completed").length,
      failed: jobs.filter(j => j.state === "failed").length,
      dead: dlq.length,
    };

    const html = `
      <html>
        <head>
          <meta http-equiv="refresh" content="5">
          <title>QueueCTL Dashboard</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; background: #f4f6f9; color: #333; padding: 20px; }
            h1 { color: #333; }
            h3 { margin-top: 30px; color: #444; }
            table { border-collapse: collapse; width: 100%; margin-top: 10px; background: white; box-shadow: 0 0 4px rgba(0,0,0,0.1); }
            th, td { padding: 10px 12px; border: 1px solid #ddd; text-align: left; }
            th { background: #fafafa; }
            tr:nth-child(even) { background: #f9f9f9; }
            .footer { margin-top: 40px; font-size: 13px; color: #666; }
          </style>
        </head>
        <body>
          <h1>QueueCTL Dashboard</h1>

          <h3>Job Summary</h3>
          <table>
            <tr><th>Pending</th><th>Processing</th><th>Completed</th><th>Failed</th><th>Dead</th></tr>
            <tr>
              <td>${summary.pending}</td>
              <td>${summary.processing}</td>
              <td>${summary.completed}</td>
              <td>${summary.failed}</td>
              <td>${summary.dead}</td>
            </tr>
          </table>

          <h3>Recent Jobs</h3>
          <table>
            <tr><th>ID</th><th>Command</th><th>Priority</th><th>State</th><th>Attempts</th></tr>
            ${jobs
              .slice(-10)
              .reverse()
              .map(j => `
                <tr>
                  <td>${j.id}</td>
                  <td>${j.command}</td>
                  <td>${j.priority}</td>
                  <td>${j.state}</td>
                  <td>${j.attempts}</td>
                </tr>
              `)
              .join("")}
          </table>

          <h3>Dead Letter Queue (DLQ)</h3>
          <table>
            <tr><th>ID</th><th>Command</th><th>Error</th><th>Attempts</th></tr>
            ${dlq
              .slice(-10)
              .reverse()
              .map(d => `
                <tr>
                  <td>${d.id}</td>
                  <td>${d.command}</td>
                  <td>${d.last_error || "(unknown)"}</td>
                  <td>${d.attempts}</td>
                </tr>
              `)
              .join("")}
          </table>

          <div class="footer">
            QueueCTL © 2025 | Built by Harshith P | Powered by Node.js + Express
          </div>
        </body>
      </html>
    `;

    res.send(html);
  });

  app.listen(port, () => {
    console.log(`🌐 QueueCTL Dashboard running at http://localhost:${port}`);
  });
}
