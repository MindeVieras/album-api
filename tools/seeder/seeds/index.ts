/**
 * Generates random number based on total items.
 *
 * @param {number} total
 *   Total items.
 *
 * @returns {number}
 *   Returns random index number
 */
export function getRandomFieldIndex(total: number): number {
  // Give it a descent random number to populate half or more of total.
  return Math.floor(Math.random() * (total - 1)) + total / 2
}

export * from './SeedUsers'
export * from './SeedDevUsers'
export * from './SeedAlbums'
