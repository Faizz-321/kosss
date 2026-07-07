-- phpMyAdmin SQL Dump
-- Struktur database untuk `kost_ezcoo`

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data untuk tabel `users`
-- (Akun Admin Default)
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) VALUES
(1, 'Administrator', 'admin@gmail.com', 'admin123', 'admin');

-- --------------------------------------------------------

--
-- Struktur dari tabel `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `price` int(11) NOT NULL,
  `description` text NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `status` enum('Tersedia','Penuh') NOT NULL DEFAULT 'Tersedia',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data sementara untuk tabel `rooms`
--

INSERT INTO `rooms` (`id`, `name`, `price`, `description`, `image`, `status`) VALUES
(1, 'Kamar Reguler A1', 1500000, 'Fasilitas: Kasur, Kipas Angin, Lemari, Kamar Mandi Luar', 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=500', 'Tersedia'),
(2, 'Kamar VIP B2', 2500000, 'Fasilitas: Kasur Springbed, AC, TV, Lemari, Kamar Mandi Dalam', 'https://images.unsplash.com/photo-1522771731570-8682f598ed38?auto=format&fit=crop&q=80&w=500', 'Tersedia'),
(3, 'Kamar Suite C3', 3500000, 'Fasilitas: AC, TV Kulkas, Dapur Mini, Kamar Mandi Dalam', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=500', 'Penuh');

-- --------------------------------------------------------

--
-- Struktur dari tabel `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `status` enum('Menunggu','Selesai','Batal') NOT NULL DEFAULT 'Menunggu',
  `booking_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

COMMIT;
