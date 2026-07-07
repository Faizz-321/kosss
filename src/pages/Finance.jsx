import { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { DollarSign, PlusCircle, ArrowDownCircle, ArrowUpCircle, XCircle, Trash2 } from 'lucide-react';

const Finance = () => {
  const { user } = useAuth();
  const { transactions, addTransaction, deleteTransaction } = useData();

  const [showModal, setShowModal] = useState(false);
  const [newTx, setNewTx] = useState({ type: 'Pemasukan', amount: '', description: '' });
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [txFilter, setTxFilter] = useState('Semua');

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Calculate overall totals
  const overallIncome = (transactions || []).filter(t => t.type === 'Pemasukan').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const overallExpense = (transactions || []).filter(t => t.type === 'Pengeluaran').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const overallBalance = overallIncome - overallExpense;

  // Filter transactions by selected month & year
  const monthlyTransactions = useMemo(() => {
    return (transactions || []).filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === parseInt(selectedMonth) && d.getFullYear() === parseInt(selectedYear);
    });
  }, [transactions, selectedMonth, selectedYear]);

  // Calculate monthly totals
  const monthlyIncome = monthlyTransactions.filter(t => t.type === 'Pemasukan').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const monthlyExpense = monthlyTransactions.filter(t => t.type === 'Pengeluaran').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const monthlyBalance = monthlyIncome - monthlyExpense;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTx.amount || newTx.amount <= 0) return alert('Jumlah uang tidak valid!');
    addTransaction({ ...newTx, amount: parseFloat(newTx.amount) });
    setShowModal(false);
    setNewTx({ type: 'Pemasukan', amount: '', description: '' });
  };

  return (
    <div className="container mt-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2>Laporan Keuangan</h2>
        <button className="btn btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
          <PlusCircle size={18} /> Catat Transaksi
        </button>
      </div>

      {/* OVERALL TOTALS */}
      <div className="glass-card mb-8">
        <h3 className="mb-4 text-primary">Total Keseluruhan (Semua Waktu)</h3>
        <div className="grid grid-cols-1 grid-cols-3" style={{ gap: '1rem' }}>
          <div className="glass-card" style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'center' }}>
            <p className="text-muted mb-2">Total Pemasukan</p>
            <h3 className="text-success m-0">Rp {overallIncome.toLocaleString('id-ID')}</h3>
          </div>
          <div className="glass-card" style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'center' }}>
            <p className="text-muted mb-2">Total Pengeluaran</p>
            <h3 className="text-danger m-0">Rp {overallExpense.toLocaleString('id-ID')}</h3>
          </div>
          <div className="glass-card" style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'center' }}>
            <p className="text-muted mb-2">Saldo Keseluruhan</p>
            <h3 className="text-accent m-0">Rp {overallBalance.toLocaleString('id-ID')}</h3>
          </div>
        </div>
      </div>

      {/* MONTHLY FILTER */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <label className="text-muted">Pilih Bulan & Tahun:</label>
        <select className="form-control" style={{ width: 'auto' }} value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
          {['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'].map((m, i) => (
            <option key={i} value={i}>{m}</option>
          ))}
        </select>
        <select className="form-control" style={{ width: 'auto' }} value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
          {[2024, 2025, 2026, 2027, 2028].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* MONTHLY TOTALS */}
      <div className="grid grid-cols-1 grid-cols-3 mb-8" style={{ gap: '1rem' }}>
        <div className="glass-card" style={{ background: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>
          <p className="text-muted mb-2">Masuk Bulan Ini</p>
          <h4 className="text-success m-0 flex justify-center items-center gap-2"><ArrowUpCircle size={20}/> Rp {monthlyIncome.toLocaleString('id-ID')}</h4>
        </div>
        <div className="glass-card" style={{ background: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>
          <p className="text-muted mb-2">Keluar Bulan Ini</p>
          <h4 className="text-danger m-0 flex justify-center items-center gap-2"><ArrowDownCircle size={20}/> Rp {monthlyExpense.toLocaleString('id-ID')}</h4>
        </div>
        <div className="glass-card" style={{ background: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>
          <p className="text-muted mb-2">Saldo Bulan Ini</p>
          <h4 className="text-primary m-0 flex justify-center items-center gap-2"><DollarSign size={20}/> Rp {monthlyBalance.toLocaleString('id-ID')}</h4>
        </div>
      </div>

      {/* MONTHLY TRANSACTIONS LIST */}
      <div className="glass-card">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <h3 className="mb-0 text-primary">Riwayat Transaksi (Bulan yang Dipilih)</h3>
          <div className="flex gap-2 flex-wrap">
            <button 
              className={`btn ${txFilter === 'Semua' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setTxFilter('Semua')}
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}
            >Semua</button>
            <button 
              className={`btn ${txFilter === 'Pemasukan' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setTxFilter('Pemasukan')}
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}
            >Pemasukan</button>
            <button 
              className={`btn ${txFilter === 'Pengeluaran' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setTxFilter('Pengeluaran')}
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.9rem' }}
            >Pengeluaran</button>
          </div>
        </div>
        
        {monthlyTransactions.filter(t => txFilter === 'Semua' || t.type === txFilter).length === 0 ? (
          <div className="empty-state">
            <p className="text-muted">Tidak ada transaksi yang sesuai pada bulan ini.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th className="mb-2 p-2">Tanggal</th>
                  <th className="mb-2 p-2">Jenis</th>
                  <th className="mb-2 p-2">Keterangan</th>
                  <th className="mb-2 p-2 text-right">Jumlah</th>
                  <th className="mb-2 p-2 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {monthlyTransactions.filter(t => txFilter === 'Semua' || t.type === txFilter).map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td className="p-2 text-muted">{new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' })}</td>
                    <td className="p-2">
                      <span className={`badge ${t.type === 'Pemasukan' ? 'badge-success' : 'badge-danger'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="p-2">{t.description}</td>
                    <td className={`p-2 text-right ${t.type === 'Pemasukan' ? 'text-success' : 'text-danger'}`}>
                      {t.type === 'Pemasukan' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="p-2 text-center">
                      <button 
                        onClick={() => {
                          if (window.confirm('Yakin ingin menghapus transaksi ini? Saldo akan otomatis disesuaikan.')) {
                            deleteTransaction(t.id);
                          }
                        }}
                        className="text-danger"
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
                        title="Hapus Transaksi"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add Transaction */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowModal(false)}><XCircle size={24} /></button>
            <h3 className="mb-4 text-primary flex items-center gap-2"><DollarSign size={20}/> Catat Transaksi Manual</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Jenis Transaksi</label>
                <select className="form-control" value={newTx.type} onChange={e => setNewTx({...newTx, type: e.target.value})}>
                  <option value="Pemasukan">Uang Masuk (Pemasukan)</option>
                  <option value="Pengeluaran">Uang Keluar (Pengeluaran)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Jumlah (Rp)</label>
                <input type="number" className="form-control" required value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Keterangan / Catatan</label>
                <textarea className="form-control" rows="3" required value={newTx.description} onChange={e => setNewTx({...newTx, description: e.target.value})}></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Simpan Transaksi</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
