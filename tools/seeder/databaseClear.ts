import { User, Album } from '../../src/models'

/**
 * Database clear function.
 * Useful when need to remove data after tests.
 */
export async function databaseClear() {
  // All the collections to be cleared.
  await User.deleteMany({})
  await Album.deleteMany({})
}
