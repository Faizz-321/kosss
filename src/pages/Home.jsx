import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { MessageCircle, CheckCircle, XCircle, MapPin } from 'lucide-react';

const Home = () => {
  const { rooms, addBooking } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedDetailRoom, setSelectedDetailRoom] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const adminWhatsApp = "6287762122507"; // Nomor Admin: 0877 6212 2507

  const handleBookingClick = (room) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // User is logged in, show confirmation modal
    setSelectedRoom(room);
  };

  const confirmBooking = () => {
    if (!selectedRoom || !user) return;

    // Tambah data ke database (context mock)
    addBooking({
      user_id: user.id,
      user_name: user.name,
      room_id: selectedRoom.id,
      room_name: selectedRoom.name,
      status: 'Menunggu'
    });

    // Format pesan WhatsApp
    const message = `Halo Admin KOS FAIZ, saya ${user.name} bermaksud untuk mem-booking kamar: *${selectedRoom.name}*. Apakah kamar tersebut bisa segera diproses? Terima kasih.`;
    const waUrl = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(message)}`;

    // Buka WhatsApp di tab baru
    window.open(waUrl, '_blank');
    
    // Tutup modal
    setSelectedRoom(null);
  };

  const getImages = (imageStr) => {
    if (!imageStr) return [];
    try {
      const parsed = JSON.parse(imageStr);
      if (Array.isArray(parsed)) return parsed;
      return [imageStr];
    } catch (e) {
      return [imageStr];
    }
  };

  return (
    <div className="container mt-8 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-primary">Temukan Kos Impianmu</h1>
        <p>Pilih kamar yang sesuai dengan kebutuhan dan budget Anda. Booking sekarang, chat langsung dengan Admin!</p>
      </div>

      <div className="grid grid-cols-1 grid-cols-2 grid-cols-3">
        {rooms.map(room => (
          <div key={room.id} className="glass-card flex" style={{ flexDirection: 'column' }}>
            <img 
              src={getImages(room.image || room.img)[0] || 'https://via.placeholder.com/500x300?text=No+Image'} 
              alt={room.name} 
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem', cursor: 'pointer', transition: 'transform 0.3s' }} 
              onClick={() => setSelectedDetailRoom(room)}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              title="Klik gambar untuk melihat detail kamar"
            />
            <div className="flex justify-between items-center mb-2">
              <h3 style={{ margin: 0 }}>{room.name}</h3>
              <span className={`badge ${room.status === 'Tersedia' ? 'badge-success' : room.status === 'Di Booking' ? 'badge-warning' : 'badge-danger'}`}>
                {room.status}
              </span>
            </div>
            <h4 className="text-accent mb-4" style={{ flexGrow: 1 }}>
              Rp {parseInt(room.price).toLocaleString('id-ID')} <span className="text-muted" style={{ fontSize: '0.9rem' }}>/ bulan</span>
            </h4>
            
            <div className="flex flex-col gap-2 mt-auto">
              <button 
                className="btn btn-outline flex justify-center items-center" 
                onClick={() => setSelectedDetailRoom(room)}
              >
                Lihat Detail Kamar
              </button>
              
              {user?.role === 'admin' ? (
                <div 
                  className="btn btn-outline flex justify-center items-center"
                  style={{ cursor: 'default' }}
                >
                  {room.status === 'Tersedia' ? 'Belum Terisi' : room.status === 'Di Booking' ? 'Sedang Di Booking' : 'Kamar Terisi'}
                </div>
              ) : (
                <button 
                  className={`btn ${room.status === 'Tersedia' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => handleBookingClick(room)}
                  disabled={room.status !== 'Tersedia'}
                >
                  <MessageCircle size={18} />
                  {room.status === 'Tersedia' ? 'Booking via WhatsApp' : room.status === 'Di Booking' ? 'Sedang Di Booking' : 'Kamar Terisi'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Konfirmasi Booking */}
      {selectedRoom && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setSelectedRoom(null)}><XCircle size={24} /></button>
            <h3 className="mb-4 text-primary">Konfirmasi Booking</h3>
            <p className="mb-4">
              Anda akan melakukan booking untuk kamar <strong>{selectedRoom.name}</strong>.
            </p>
            <div className="glass-card mb-4" style={{ background: 'rgba(0,0,0,0.2)' }}>
              <p className="text-muted mb-2">Data Anda:</p>
              <p>Nama: <strong>{user?.name}</strong></p>
              <p>Email: <strong>{user?.email}</strong></p>
            </div>
            <p className="mb-4 text-muted text-center" style={{ fontSize: '0.9rem' }}>
              Setelah menekan tombol Lanjutkan, Anda akan dialihkan ke WhatsApp untuk berkomunikasi langsung dengan Admin.
            </p>
            <div className="flex gap-4 justify-between">
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setSelectedRoom(null)}>Batal</button>
              <button className="btn btn-accent" style={{ flex: 1 }} onClick={confirmBooking}>
                <CheckCircle size={18} /> Lanjutkan ke WA
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Detail Kamar */}
      {selectedDetailRoom && (
        <div className="modal-overlay" onClick={() => setSelectedDetailRoom(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <button className="modal-close" onClick={() => setSelectedDetailRoom(null)}><XCircle size={24} /></button>
            <h3 className="mb-4 text-primary">{selectedDetailRoom.name}</h3>
            
            <div style={{ display: 'flex', overflowX: 'auto', gap: '1rem', marginBottom: '1rem', paddingBottom: '0.5rem' }}>
              {getImages(selectedDetailRoom.image || selectedDetailRoom.img).map((img, i) => (
                <img 
                  key={i}
                  src={img} 
                  alt={`${selectedDetailRoom.name} - ${i + 1}`} 
                  style={{ width: '85%', height: '250px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} 
                />
              ))}
            </div>
            
            <h4 className="text-accent mb-4">
              Rp {parseInt(selectedDetailRoom.price).toLocaleString('id-ID')} <span className="text-muted" style={{ fontSize: '0.9rem' }}>/ bulan</span>
            </h4>
            
            <div className="mb-6 p-4 glass-card" style={{ background: 'rgba(0,0,0,0.2)' }}>
              <h5 className="text-muted mb-2">Fasilitas / Deskripsi:</h5>
              <p>{selectedDetailRoom.description || selectedDetailRoom.desc}</p>
            </div>
            
            <div className="flex gap-4">
              <button 
                className="btn btn-outline flex-1 justify-center"
                style={{ flex: 1 }}
                onClick={() => setShowLocationModal(true)}
              >
                <MapPin size={18} /> Lihat Detail Lokasi
              </button>
              {user?.role === 'admin' ? (
                <div 
                  className="btn btn-outline flex justify-center items-center"
                  style={{ flex: 1, cursor: 'default' }}
                >
                  {selectedDetailRoom.status === 'Tersedia' ? 'Belum Terisi' : selectedDetailRoom.status === 'Di Booking' ? 'Sedang Di Booking' : 'Kamar Terisi'}
                </div>
              ) : (
                <button 
                  className={`btn ${selectedDetailRoom.status === 'Tersedia' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ flex: 1 }}
                  disabled={selectedDetailRoom.status !== 'Tersedia'}
                  onClick={() => {
                    setSelectedDetailRoom(null);
                    handleBookingClick(selectedDetailRoom);
                  }}
                >
                  <MessageCircle size={18} /> {selectedDetailRoom.status === 'Tersedia' ? 'Booking Sekarang' : selectedDetailRoom.status === 'Di Booking' ? 'Sedang Di Booking' : 'Kamar Terisi'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Modal Detail Lokasi */}
      {showLocationModal && (
        <div className="modal-overlay" onClick={() => setShowLocationModal(false)} style={{ zIndex: 1100 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <button className="modal-close" onClick={() => setShowLocationModal(false)}><XCircle size={24} /></button>
            <h3 className="mb-4 text-primary">Detail Lokasi Kos</h3>
            
            <p className="mb-4 text-muted">
              Karena titik di Google Maps kurang akurat, silakan jadikan patokan gambar denah/lokasi berikut:
            </p>

            {getImages(selectedDetailRoom?.location_images).length > 0 ? (
              <div style={{ display: 'flex', overflowX: 'auto', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
                {getImages(selectedDetailRoom.location_images).map((img, i) => (
                  <img 
                    key={i}
                    src={img} 
                    alt={`Lokasi - ${i + 1}`} 
                    style={{ width: '85%', height: '250px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} 
                  />
                ))}
              </div>
            ) : (
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=600" 
                alt="Panduan Lokasi" 
                title="Admin belum mengupload foto lokasi untuk kamar ini"
                style={{ width: '100%', height: '250px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1.5rem' }} 
              />
            )}
            
            <div className="flex gap-4">
              <button 
                className="btn btn-outline flex-1"
                onClick={() => setShowLocationModal(false)}
              >
                Kembali
              </button>
              <a 
                href="https://maps.app.goo.gl/Ehi2cZtnVi45jAQJ6?g_st=aw" 
                target="_blank" 
                rel="noreferrer"
                className="btn btn-accent flex-1 justify-center flex items-center gap-2"
                style={{ textDecoration: 'none' }}
              >
                <MapPin size={18} /> Buka Google Maps
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
