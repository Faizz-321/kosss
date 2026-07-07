import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Plus, Trash2, Home as HomeIcon, CheckCircle, XCircle, Edit2 } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { rooms, addRoom, deleteRoom, bookings, deleteBooking, updateBookingStatus, updateUserName } = useData();
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', price: '', description: '', images: [], location_images: [], locationImagesStr: '[]', status: 'Tersedia' });
  const [filterStatus, setFilterStatus] = useState('Semua');
  
  const openAddRoomModal = () => {
    let lastLocImages = '[]';
    if (rooms && rooms.length > 0) {
      const lastRoom = rooms[rooms.length - 1];
      if (lastRoom.location_images) lastLocImages = lastRoom.location_images;
    }
    setNewRoom({ name: '', price: '', description: '', images: [], location_images: [], locationImagesStr: lastLocImages, status: 'Tersedia' });
    setShowAddRoom(true);
  };
  
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [acceptData, setAcceptData] = useState({ id: null, startDate: '', endDate: '', isExtend: false });

  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [editNameData, setEditNameData] = useState({ userId: null, name: '' });

  const handleEditNameClick = (b) => {
    setEditNameData({ userId: b.user_id, name: b.user_name });
    setShowEditNameModal(true);
  };

  const submitEditName = async (e) => {
    e.preventDefault();
    await updateUserName(editNameData.userId, editNameData.name);
    setShowEditNameModal(false);
  };

  const handleAcceptClick = (id) => {
    setAcceptData({ id, startDate: '', endDate: '', isExtend: false });
    setShowAcceptModal(true);
  };

  const handleExtendClick = (b) => {
    const start = b.start_date ? new Date(b.start_date).toISOString().split('T')[0] : '';
    const end = b.end_date ? new Date(b.end_date).toISOString().split('T')[0] : '';
    setAcceptData({ id: b.id, startDate: start, endDate: end, isExtend: true });
    setShowAcceptModal(true);
  };

  const submitAccept = (e) => {
    e.preventDefault();
    updateBookingStatus(acceptData.id, 'Selesai', { start_date: acceptData.startDate, end_date: acceptData.endDate });
    setShowAcceptModal(false);
  };

  // Perlindungan route admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const handleAddRoom = (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', newRoom.name);
    formData.append('price', parseInt(newRoom.price));
    formData.append('description', newRoom.description);
    formData.append('status', newRoom.status);
    
    if (newRoom.images && newRoom.images.length > 0) {
      for (let i = 0; i < newRoom.images.length; i++) {
        formData.append('images', newRoom.images[i]);
      }
    }
    
    if (newRoom.location_images && newRoom.location_images.length > 0) {
      for (let i = 0; i < newRoom.location_images.length; i++) {
        formData.append('location_images', newRoom.location_images[i]);
      }
    } else {
      formData.append('location_images', newRoom.locationImagesStr);
    }

    addRoom(formData);
    setShowAddRoom(false);
    setNewRoom({ name: '', price: '', description: '', images: [], location_images: [], locationImagesStr: '[]', status: 'Tersedia' });
  };

  return (
    <div className="container mt-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2>Dashboard Admin</h2>
      </div>

      <div className="grid grid-cols-1" style={{ gap: '2rem' }}>
        
        {/* Manajemen Booking */}
        <div className="glass-card">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <h3 className="mb-0 text-primary">Daftar Booking</h3>
            <div className="flex gap-2 flex-wrap">
              <button 
                className={`btn ${filterStatus === 'Semua' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterStatus('Semua')}
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}
              >Semua</button>
              <button 
                className={`btn ${filterStatus === 'Menunggu' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterStatus('Menunggu')}
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}
              >Menunggu</button>
              <button 
                className={`btn ${filterStatus === 'Selesai' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterStatus('Selesai')}
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}
              >Selesai</button>
              <button 
                className={`btn ${filterStatus === 'Batal' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterStatus('Batal')}
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}
              >Ditolak/Batal</button>
            </div>
          </div>
          {bookings.length === 0 ? (
            <div className="empty-state">
              <p className="text-muted">Belum ada data booking saat ini.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th className="mb-2 p-2">Tanggal Booking</th>
                    <th className="mb-2 p-2">Penyewa</th>
                    <th className="mb-2 p-2">Kamar</th>
                    <th className="mb-2 p-2">Status</th>
                    <th className="mb-2 p-2">Periode</th>
                    <th className="mb-2 p-2 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.filter(b => filterStatus === 'Semua' || b.status === filterStatus).map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td className="p-2 text-muted">{new Date(b.date).toLocaleDateString('id-ID')}</td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          {b.user_name}
                          <button onClick={() => handleEditNameClick(b)} className="text-accent hover:text-primary transition-colors" title="Edit Nama Penyewa">
                            <Edit2 size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="p-2">{b.room_name}</td>
                      <td className="p-2">
                        <span className={`badge ${b.status === 'Selesai' ? 'badge-success' : b.status === 'Batal' ? 'badge-danger' : 'badge-warning'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-2" style={{ fontSize: '0.85rem' }}>
                        {b.start_date && b.end_date ? (
                          <>
                            Masuk: <span className="text-accent">{new Date(b.start_date).toLocaleDateString('id-ID')}</span><br/>
                            Keluar: <span className="text-danger">{new Date(b.end_date).toLocaleDateString('id-ID')}</span>
                            <br/>
                            <span className={`badge ${new Date(b.end_date) < new Date(new Date().setHours(0,0,0,0)) ? 'badge-danger' : 'badge-success'}`} style={{ marginTop: '4px', display: 'inline-block', fontSize: '0.7rem' }}>
                              {new Date(b.end_date) < new Date(new Date().setHours(0,0,0,0)) ? 'Habis Masa Sewanya' : 'Masih Menyewa'}
                            </span>
                          </>
                        ) : '-'}
                      </td>
                      <td className="p-2 text-center flex justify-center gap-2">
                        {b.status === 'Menunggu' && (
                          <>
                            <button onClick={() => handleAcceptClick(b.id)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }} title="Tandai Selesai">
                              <CheckCircle size={16} className="text-accent" />
                            </button>
                            <button onClick={() => updateBookingStatus(b.id, 'Batal')} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }} title="Batalkan">
                              <XCircle size={16} className="text-danger" />
                            </button>
                          </>
                        )}
                        {b.status === 'Selesai' && (
                          <button onClick={() => handleExtendClick(b)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }} title="Perpanjang / Ubah Sewa">
                            <Plus size={16} className="text-primary" />
                          </button>
                        )}
                        <button onClick={() => deleteBooking(b.id)} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} title="Hapus Data">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Manajemen Kamar */}
        <div className="glass-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-primary">Manajemen Kamar</h3>
            <button className="btn btn-primary" onClick={openAddRoomModal}>
              <Plus size={18} /> Tambah Kamar
            </button>
          </div>

          <div className="grid grid-cols-1 grid-cols-2 grid-cols-3">
            {rooms.map(room => (
              <div key={room.id} className="glass-card" style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)' }}>
                <div className="flex justify-between items-center mb-2">
                  <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{room.name}</h4>
                  <button onClick={() => deleteRoom(room.id)} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-accent mb-2">Rp {room.price.toLocaleString('id-ID')}</p>
                <span className={`badge ${room.status === 'Tersedia' ? 'badge-success' : room.status === 'Di Booking' ? 'badge-warning' : 'badge-danger'}`}>
                  {room.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Modal Tambah Kamar */}
      {showAddRoom && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowAddRoom(false)}><XCircle size={24} /></button>
            <h3 className="mb-4 text-primary flex items-center gap-2"><HomeIcon size={20}/> Tambah Kamar Baru</h3>
            <form onSubmit={handleAddRoom}>
              <div className="form-group">
                <label className="form-label">Nama Kamar</label>
                <input type="text" className="form-control" required value={newRoom.name} onChange={e => setNewRoom({...newRoom, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Harga (Rp)</label>
                <input type="number" className="form-control" required value={newRoom.price} onChange={e => setNewRoom({...newRoom, price: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Fasilitas / Deskripsi</label>
                <textarea className="form-control" rows="3" required value={newRoom.description} onChange={e => setNewRoom({...newRoom, description: e.target.value})}></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Foto Kamar (Maks. 7 File)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  className="form-control" 
                  onChange={e => {
                    if (e.target.files.length > 7) {
                      alert('Maksimal 7 foto!');
                      e.target.value = '';
                      return;
                    }
                    setNewRoom({...newRoom, images: Array.from(e.target.files)});
                  }} 
                  style={{ padding: '0.6rem 1rem' }} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Foto Detail Lokasi (Maks. 3 File)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  className="form-control" 
                  onChange={e => {
                    if (e.target.files.length > 3) {
                      alert('Maksimal 3 foto lokasi!');
                      e.target.value = '';
                      return;
                    }
                    setNewRoom({...newRoom, location_images: Array.from(e.target.files)});
                  }} 
                  style={{ padding: '0.6rem 1rem' }} 
                />
                {newRoom.location_images.length === 0 && newRoom.locationImagesStr && newRoom.locationImagesStr !== '[]' && (
                  <p className="text-muted mt-2" style={{ fontSize: '0.8rem' }}>
                    * Akan menggunakan {JSON.parse(newRoom.locationImagesStr || '[]').length} foto lokasi dari kamar sebelumnya secara otomatis.
                  </p>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={newRoom.status} onChange={e => setNewRoom({...newRoom, status: e.target.value})}>
                  <option value="Tersedia">Tersedia</option>
                  <option value="Penuh">Penuh</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Simpan Kamar</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Terima / Perpanjang Booking */}
      {showAcceptModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowAcceptModal(false)}><XCircle size={24} /></button>
            <h3 className="mb-4 text-primary flex items-center gap-2">
              <CheckCircle size={20}/> 
              {acceptData.isExtend ? 'Perpanjang / Ubah Periode' : 'Terima Booking'}
            </h3>
            <form onSubmit={submitAccept}>
              <div className="form-group">
                <label className="form-label">Tanggal Masuk</label>
                <input type="date" className="form-control" required value={acceptData.startDate} onChange={e => setAcceptData({...acceptData, startDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Tanggal Keluar</label>
                <input type="date" className="form-control" required value={acceptData.endDate} onChange={e => setAcceptData({...acceptData, endDate: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-accent" style={{ width: '100%' }}>
                {acceptData.isExtend ? 'Simpan Perubahan' : 'Simpan & Terima'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Nama Penyewa */}
      {showEditNameModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowEditNameModal(false)}><XCircle size={24} /></button>
            <h3 className="mb-4 text-primary flex items-center gap-2">
              <Edit2 size={20}/> Edit Nama Penyewa
            </h3>
            <form onSubmit={submitEditName}>
              <div className="form-group">
                <label className="form-label">Nama Baru</label>
                <input type="text" className="form-control" required value={editNameData.name} onChange={e => setEditNameData({...editNameData, name: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-accent" style={{ width: '100%' }}>Simpan Nama</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
