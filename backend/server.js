const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kosss_uploads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});
const upload = multer({ storage: storage });

// Koneksi ke Database
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kost_ezcoo',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log('Berhasil terhubung ke database.');

// ================= AUTH ENDPOINTS =================

app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  
  // Cek apakah email sudah ada
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) return res.status(400).json({ success: false, message: 'Email sudah terdaftar!' });
    
    // Insert user baru
    db.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, password, 'user'], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: 'Pendaftaran berhasil' });
    });
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(401).json({ success: false, message: 'Email atau password salah!' });
    
    const user = results[0];
    res.json({ 
      success: true, 
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  });
});

app.put('/api/users/:id/name', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  db.query('UPDATE users SET name = ? WHERE id = ?', [name, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ================= ROOMS ENDPOINTS =================

app.get('/api/rooms', (req, res) => {
  db.query('SELECT * FROM rooms', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/rooms', upload.fields([{ name: 'images', maxCount: 7 }, { name: 'location_images', maxCount: 3 }]), (req, res) => {
  const { name, price, description, status } = req.body;
  
  let image = req.body.image || '[]';
  if (req.files && req.files['images']) {
    const urls = req.files['images'].map(file => file.path); // Cloudinary returns URL in file.path
    image = JSON.stringify(urls);
  } else if (req.body.image && !req.body.image.startsWith('[')) {
    image = JSON.stringify([req.body.image]);
  }
  
  let location_images = req.body.location_images || '[]';
  if (req.files && req.files['location_images']) {
    const locUrls = req.files['location_images'].map(file => file.path);
    location_images = JSON.stringify(locUrls);
  }
  
  db.query('INSERT INTO rooms (name, price, description, image, status, location_images) VALUES (?, ?, ?, ?, ?, ?)', 
    [name, price, description, image, status, location_images], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, name, price, description, image, status, location_images });
  });
});

app.delete('/api/rooms/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM rooms WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ================= BOOKINGS ENDPOINTS =================

app.get('/api/bookings', (req, res) => {
  const query = `
    SELECT b.id, b.status, b.booking_date, b.start_date, b.end_date, b.user_id, u.name as user_name, r.name as room_name 
    FROM bookings b
    JOIN users u ON b.user_id = u.id
    JOIN rooms r ON b.room_id = r.id
    ORDER BY b.booking_date DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    // Ubah format key agar sesuai dengan frontend lama yang berharap user_name dan room_name, dan date (bukan booking_date)
    const formatted = results.map(row => ({
      ...row,
      date: row.booking_date
    }));
    res.json(formatted);
  });
});

app.post('/api/bookings', (req, res) => {
  const { user_id, room_id, status } = req.body;
  db.query('INSERT INTO bookings (user_id, room_id, status) VALUES (?, ?, ?)', 
    [user_id, room_id, status], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Update room status to 'Di Booking'
    db.query("UPDATE rooms SET status = 'Di Booking' WHERE id = ?", [room_id], (err2) => {
      if (err2) console.error('Failed to update room status:', err2);
      res.json({ id: result.insertId, ...req.body });
    });
  });
});

app.put('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const { status, start_date, end_date } = req.body;
  
  let updateQuery = 'UPDATE bookings SET status = ? WHERE id = ?';
  let updateParams = [status, id];
  
  if (status === 'Selesai' && start_date && end_date) {
    updateQuery = 'UPDATE bookings SET status = ?, start_date = ?, end_date = ? WHERE id = ?';
    updateParams = [status, start_date, end_date, id];
  }

  db.query(updateQuery, updateParams, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Get room_id from this booking to update room status
    // Get room_id from this booking to update room status and log transaction
    db.query('SELECT b.room_id, r.price, r.name as room_name, u.name as user_name FROM bookings b JOIN rooms r ON b.room_id = r.id JOIN users u ON b.user_id = u.id WHERE b.id = ?', [id], (err2, results) => {
      if (err2 || results.length === 0) return res.json({ success: true });
      
      const { room_id: roomId, price, room_name, user_name } = results[0];
      
      // Log income transaction if booking is 'Selesai' (accepted or extended)
      if (status === 'Selesai' && start_date && end_date) {
        db.query("INSERT INTO transactions (type, amount, description) VALUES ('Pemasukan', ?, ?)", 
          [price, `Pembayaran Sewa Kamar ${room_name} oleh ${user_name}`],
          (err3) => {
            if (err3) console.error('Failed to insert transaction:', err3);
          }
        );
      }

      let roomStatus = '';
      if (status === 'Selesai') roomStatus = 'Terisi';
      else if (status === 'Batal') roomStatus = 'Tersedia';
      
      if (roomStatus) {
        db.query('UPDATE rooms SET status = ? WHERE id = ?', [roomStatus, roomId], (err4) => {
          if (err4) console.error('Failed to update room status:', err4);
          res.json({ success: true });
        });
      } else {
        res.json({ success: true });
      }
    });
  });
});

app.delete('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  
  db.query('SELECT room_id FROM bookings WHERE id = ?', [id], (err, results) => {
    if (err || results.length === 0) {
      return db.query('DELETE FROM bookings WHERE id = ?', [id], (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ success: true });
      });
    }
    
    const roomId = results[0].room_id;
    db.query('DELETE FROM bookings WHERE id = ?', [id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      
      db.query("UPDATE rooms SET status = 'Tersedia' WHERE id = ?", [roomId], (err3) => {
        if (err3) console.error('Failed to update room status:', err3);
        res.json({ success: true });
      });
    });
  });
});

// ================= TRANSACTIONS ENDPOINTS =================

app.get('/api/transactions', (req, res) => {
  db.query('SELECT * FROM transactions ORDER BY date DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/transactions', (req, res) => {
  const { type, amount, description } = req.body;
  db.query('INSERT INTO transactions (type, amount, description) VALUES (?, ?, ?)', 
    [type, amount, description], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, type, amount, description });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

module.exports = app;
