
// import fs from 'fs'
// import path from 'path'
// import Sequelize from 'sequelize'

// import config from '../config/config'
// import dbConfiguration from '../config/database'

// const basename = path.basename(__filename)
// const dbConfig = dbConfiguration[config.env]

// const db = {}

// /**
//  * A function that gets executed every time Sequelize would log something.
//  *
//  * @param {string} message - Sequelize log message.
//  */
// function databaseLogging(message: string): void {
//   // For now just simply console.log sequelize messages for developer only.
//   if (config.env === 'development') {
//     console.log(message)
//   }
// }

// // Connect to database
// const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
//   ...dbConfig,
//   logging: databaseLogging,
// })

// // Loop through all files in models directory ignoring hidden files.
// fs.readdirSync(__dirname)
//   .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.ts'))
//   // Import model files and save model names.
//   .forEach((file) => {
//     const model = sequelize.import(path.join(__dirname, file))
//     db[model.name] = model
//   })

// // Calling all the associate function,
// // in order to make the association between the models.
// Object.keys(db).forEach((modelName) => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db)
//   }
// })

// // Assign the sequelize variables to the db object and returning the db.
// db.sequelize = sequelize
// db.Sequelize = Sequelize

// module.exports = db

import * as fs from 'fs'
import * as path from 'path'
import * as Sequelize from 'sequelize'

import config from '../config/config'
import dbConfiguration from '../config/database'
// const config = require('../config/config.json')

// Import model specifications from its own definition files.
// import { LanguageInstance, LanguageAttributes } from './language'
import { UserAttributes, UserInstance } from './users.model'

/**
 * Database connetction interface.
 */
interface DbConnection {
  // Language: Sequelize.Model<LanguageInstance, LanguageAttributes>,
  AppUser: Sequelize.Model<UserInstance, UserAttributes>
}

/**
 * Set database object.
 */
const db = {}

/**
 * Database configuration depending on NODE_ENV.
 */
const dbConfig = dbConfiguration[config.env]
console.log(dbConfig)
const sequelize = new Sequelize(
  dbConfig['database'],
  dbConfig['username'],
  dbConfig['password'],
  dbConfig
)

const basename = path.basename(module.filename)
fs
  .readdirSync(__dirname)
  .filter(function (file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
  })
  .forEach(function (file) {
    const model = sequelize['import'](path.join(__dirname, file))
    // NOTE: you have to change from the original property notation to
    // index notation or tsc will complain about undefined property.
    db[model['name']] = model
  })

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db['sequelize'] = sequelize
db['Sequelize'] = Sequelize

export default <DbConnection>db
