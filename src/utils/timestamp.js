/**
 * Returns the current UTC timestamp in ISO-8601 format.
 * Keeps time representation consistent across all persisted records.
 */
export function nowISO() {
  return new Date().toISOString();
}
