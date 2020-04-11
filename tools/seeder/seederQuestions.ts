import {
  ListQuestion,
  NumberQuestion,
  ExpandQuestion,
  InputQuestion,
  ConfirmQuestion,
} from 'inquirer'

import { SeederDefaults } from './seederEnums'

/**
 * Question to ask which collection to seed.
 * Choices must be the names of the models.
 */
export const collectionQuestion: ListQuestion<{ collection: string }> = {
  type: 'list',
  name: 'collection',
  message: 'Which collection would you like to seed?',
  choices: ['Users', 'Albums', 'Media'],
}

/**
 * Question to ask whether to drop collection or not.
 */
export const collectionDropQuestion: ConfirmQuestion<{ drop: boolean }> = {
  type: 'confirm',
  name: 'drop',
  message: 'Would you like to drop collection before seeding?',
  default: false,
}

/**
 * Question to ask about total documents to seed.
 * Should be asked after collection is answered.
 */
export const totalQuestion: NumberQuestion<{ total: number }> = {
  type: 'number',
  name: 'total',
  default: SeederDefaults.total,
  message: 'How many items would you like to seed?',
  validate: (input) => {
    // Validate total items input to be from 'minTotal' to 'maxTotal'.
    if (
      Number.isInteger(input) &&
      input >= SeederDefaults.minTotal &&
      input <= SeederDefaults.maxTotal
    ) {
      return true
    }
    // Return error message otherwise.
    return `Total items to seed must be a number between ${SeederDefaults.minTotal} and ${SeederDefaults.maxTotal}`
  },
}

/**
 * Question to ask what sort of users to seed.
 * It can be chosen between seeding random users or
 * dev users - one user per role like admin, editor, viewer...
 */
export const usersQuestion: ExpandQuestion<{ type: 'random' | 'dev' }> = {
  type: 'expand',
  message: 'Seed (r)random users or (d)dev users?',
  name: 'type',
  default: 'random',
  choices: [
    {
      key: 'r',
      name: 'Random users',
      value: 'random',
    },
    {
      key: 'd',
      name: 'Dev users, one user per role',
      value: 'dev',
    },
  ],
}

/**
 * Question to ask user password.
 */
export const userPassQuestion: InputQuestion<{ password: string }> = {
  type: 'input',
  message: 'Enter user password:',
  name: 'password',
  default: SeederDefaults.password,
}
