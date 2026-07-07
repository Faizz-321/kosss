const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'kost_ezcoo'
});

db.connect((err) => {
  if (err) throw err;
  
  const query = 'ALTER TABLE bookings ADD COLUMN IF NOT EXISTS start_date DATE, ADD COLUMN IF NOT EXISTS end_date DATE';
  
  db.query(query, (err, result) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Columns start_date and end_date added successfully.');
    }
    db.end();
  });
});
