/**
 * Generates random number based on total items.
 *
 * @param total
 *   Total items.
 */
export function getRandomFieldIndex(total: number): number {
  // Give it a descent random number to populate half or more of total.
  return Math.floor(Math.random() * (total - 1)) + total / 2
}
