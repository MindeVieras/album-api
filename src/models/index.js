
import Sequelize from 'sequelize'
import fs from 'fs'
import path from 'path'

import config from '../config/config'
import dbConfiguration from '../config/database'

const basename = path.basename(__filename)
const dbConfig = dbConfiguration[config.env]

let db = {}

// Connect to database
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig)

// Loop through all files in models directory ignoring hidden files.
fs.readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
  })
  // Import model files and save model names.
  .forEach((file) => {
    const model = sequelize['import'](path.join(__dirname, file))
    db[model.name] = model
  })

// Calling all the associate function, in order to make the association between the models.
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

// Database logging function.
function databaseLogging(msg, query) {
  console.log(msg)
}

// Assign the sequelize variables to the db object and returning the db.
db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
