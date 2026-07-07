import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await register(name, email, password);
    if (result.success) {
      // Setelah sukses mendaftar, arahkan ke halaman login
      navigate('/login', { state: { message: 'Pendaftaran berhasil! Silakan login.' } });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="container mt-8 flex justify-center items-center" style={{ minHeight: '60vh' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-8">
          <h2 className="text-primary flex justify-center items-center gap-2">
            <UserPlus size={28} /> Buat Akun
          </h2>
          <p>Daftar sekarang untuk mulai booking kamar idamanmu.</p>
        </div>
        
        {error && (
          <div className="mb-4 text-center text-danger p-2" style={{ background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nama Lengkap</label>
            <input 
              type="text" 
              className="form-control" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Budi Santoso"
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-control" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="contoh@email.com"
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-wrapper">
              <input 
                type={showPassword ? "text" : "password"}
                className="form-control" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
                required 
                minLength="4"
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Daftar
          </button>
          
          <div className="mt-4 text-center text-muted" style={{ fontSize: '0.9rem' }}>
            Sudah punya akun? <Link to="/login" className="text-accent" style={{ textDecoration: 'none' }}>Masuk di sini</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
