const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'kost_ezcoo'
});

db.connect((err) => {
  if (err) throw err;
  
  const query = `
    CREATE TABLE IF NOT EXISTS transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      type ENUM('Pemasukan', 'Pengeluaran') NOT NULL,
      amount INT NOT NULL,
      description TEXT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  db.query(query, (err, result) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Table transactions created successfully.');
    }
    db.end();
  });
});
