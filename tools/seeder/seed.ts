import SeedUsers from './SeedUsers'

/**
 * Database seed function.
 * Include all default seeds.
 */
export default async function seed() {
  // Run default seeds.
  await SeedUsers()
}
