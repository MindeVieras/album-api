
import mysql from 'mysql'

const host = process.env.DB_HOST
const user = process.env.DB_USER
const pass = process.env.DB_PASSWORD
const name = process.env.DB_NAME

const connection = mysql.createConnection({
  host: host,
  user: user,
  password : pass,
  database: name,
  acquireTimeout: 1000000
});

connection.connect(function(err) {
    if (err) throw err;
});

module.exports = connection;
