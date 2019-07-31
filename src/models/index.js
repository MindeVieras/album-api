
import fs from 'fs'
import path from 'path'
import Sequelize from 'sequelize'

import config from '../config/config'
import dbConfiguration from '../config/database'

const basename = path.basename(__filename)
const dbConfig = dbConfiguration[config.env]

const db = {}

/**
 * A function that gets executed every time Sequelize would log something.
 *
 * @param {string} message - Sequelize log message.
 */
function databaseLogging(message) {
  // For now just simply console.log sequelize messages for developer only.
  if (config.env === 'development') {
    console.log(message)
  }
}

// Connect to database
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  ...dbConfig,
  logging: databaseLogging,
})

// Loop through all files in models directory ignoring hidden files.
fs.readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  // Import model files and save model names.
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file))
    db[model.name] = model
  })

// Calling all the associate function,
// in order to make the association between the models.
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

// Assign the sequelize variables to the db object and returning the db.
db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
