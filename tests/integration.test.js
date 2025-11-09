/**
 * This is a minimal integration test that ensures the environment
 * and testing setup work as expected.
 * Run this using:  npm test
 */

import fs from "fs";

describe("QueueCTL basic integration", () => {
  test("project structure and data files exist", () => {
    const expectedFiles = [
      "./data/jobs.json",
      "./data/dlq.json",
      "./data/config.json",
    ];

    expectedFiles.forEach((file) => {
      const exists = fs.existsSync(file);
      expect(exists).toBe(true);
    });
  });

  test("environment runs correctly", () => {
    expect(typeof process.version).toBe("string");
    expect(process.cwd()).toContain("queuectl");
  });
});
