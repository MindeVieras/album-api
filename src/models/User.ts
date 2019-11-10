
import mongoose from 'mongoose'

/**
 * User schema.
 */
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
})

/**
 * Export user shema as model.
 */
export const User = mongoose.model('User', userSchema)
