const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'kost_ezcoo'
});

db.connect((err) => {
  if (err) throw err;
  
  const query = 'ALTER TABLE rooms ADD COLUMN location_images TEXT';
  
  db.query(query, (err, result) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Column location_images added to rooms table.');
    }
    db.end();
  });
});
