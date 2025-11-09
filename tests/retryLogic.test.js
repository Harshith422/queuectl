/**
 * Tests the exponential backoff calculation and ensures
 * retry delay grows correctly based on attempt count.
 */

import { calculateBackoffMs } from "../src/core/backoff.js";

describe("Backoff calculation", () => {
  test("grows exponentially with attempt count", () => {
    const delay1 = calculateBackoffMs(1);
    const delay2 = calculateBackoffMs(2);
    const delay3 = calculateBackoffMs(3);

    // Exponential growth pattern: 2^1, 2^2, 2^3 * 1000
    expect(delay2).toBeGreaterThan(delay1);
    expect(delay3).toBeGreaterThan(delay2);
  });

  test("defaults to base 2 multiplier", () => {
    const delay = calculateBackoffMs(1);
    expect(delay).toBe(2000); // base^1 * 1000 = 2 * 1000
  });
});
