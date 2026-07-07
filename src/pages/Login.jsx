import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      // Bersihkan state agar pesan tidak muncul terus menerus jika direfresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    const result = await login(email, password);
    if (result.success) {
      // Redirect based on role
      const userStr = localStorage.getItem('booking_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role === 'admin') navigate('/dashboard');
        else navigate('/');
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="container mt-8 flex justify-center items-center" style={{ minHeight: '60vh' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-8">
          <h2 className="text-primary flex justify-center items-center gap-2">
            <LogIn size={28} /> Masuk Akun
          </h2>
          <p>Silakan login untuk mulai booking kamar.</p>
        </div>
        
        {message && (
          <div className="mb-4 text-center text-accent p-2" style={{ background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 text-center text-danger p-2" style={{ background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
            Masuk
          </button>
          
          <div className="mt-4 text-center text-muted" style={{ fontSize: '0.9rem' }}>
            Belum punya akun? <Link to="/register" className="text-accent" style={{ textDecoration: 'none' }}>Daftar di sini</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
