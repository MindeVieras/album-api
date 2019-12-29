import SeedDevUsers from './SeedDevUsers'
import SeedUsers from './SeedUsers'

/**
 * Database seed function.
 * Include all default seeds.
 */
export async function Seed() {
  // Run default seeds.
  await SeedDevUsers()
  await SeedUsers()
}

/**
 * Default seeder options.
 */
export enum SeedDefaults {
  /**
   * Seeder total counts
   */
  'count' = 50,

  /**
   * Default user password.
   */
  'password' = 'Password123!',

  /**
   * Default admin user name.
   */
  'adminName' = 'admin',
}

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
