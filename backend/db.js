require('dotenv').config();

console.log(process.env.DB_HOST);
console.log(process.env.DB_USER);
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});
db.connect((err) => {
  if (err) {
    console.error('Connection Failed:', err);
  } else {
    console.log('MySQL Connected Successfully');
  }
});

module.exports = db;