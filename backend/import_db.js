require('dotenv').config();
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  multipleStatements: true
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to Aiven DB:', err);
    process.exit(1);
  }
  console.log('Connected to Aiven DB successfully.');

  const sqlFilePath = path.join(__dirname, '../database.sql');
  const sqlString = fs.readFileSync(sqlFilePath, 'utf8');

  console.log('Importing database.sql...');
  db.query(sqlString, (err, results) => {
    if (err) {
      console.error('Error importing SQL:', err);
      process.exit(1);
    }
    console.log('Database imported successfully!');
    db.end();
  });
});
