
import Sequelize from 'sequelize'
import fs from 'fs'
import path from 'path'

import config from './config'

let db = {}

// Connect to database
const sequelize = new Sequelize(
  config.db.name,
  config.db.user,
  config.db.pass,
  {
    dialect: 'mariadb',
    port: config.db.port,
    host: config.db.host,
    dialectOptions: {
      collate: 'utf8mb4_general_ci',
      useUTC: false,
      timezone: 'Etc/GMT0'
    },
    timezone: 'Etc/GMT0',
    logging: databaseLogging
  }
)

const modelsDir = path.normalize(`${__dirname}/../models`)

// Loop through all files in models directory ignoring hidden files.
fs.readdirSync(modelsDir)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== path.basename(__filename)) && (file.slice(-3) === '.js')
  })
  // Import model files and save model names.
  .forEach((file) => {
    const model = sequelize.import(path.join(modelsDir, file))
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

// Synchronizing any model changes with database.
// sequelize.sync({force: true}).then(() => {
  // if (err) {
  //   console.error('An error occured %j', err)
  // }
  // else {
  //   console.info('Database synchronized')
  // }
// })

// Assign the sequelize variables to the db object and returning the db.
db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
