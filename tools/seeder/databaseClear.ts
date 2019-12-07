import User from '../../src/models/UserModel'

export default async function databaseClear() {
  await User.deleteMany({})
}
