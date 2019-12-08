import { User } from '../../src/models/UserModel'

/**
 * Database cear function.
 * Usefull when need to remove data after tests.
 */
export async function databaseClear() {
  // All the collections to be cleared.
  await User.deleteMany({})
}
