
const mysql = require('mysql');

const host = process.env.DB_HOST || 'localhost';
const user = process.env.DB_USER || 'root';
const pass = process.env.DB_PASS || 'root';
const name = process.env.DB_NAME || 'react_album';

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
