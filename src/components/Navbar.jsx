import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, LayoutDashboard, LogOut, LogIn, MessageCircle, DollarSign } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="nav-brand">
          <Home className="text-primary" />
          <span>Kos</span>Premium
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Beranda</Link>
          {(!user || user.role !== 'admin') && (
            <a 
              href="https://wa.me/6287762122507?text=Halo%20Admin%20Kos%20Premium%2C%20saya%20ingin%20bertanya-tanya%20mengenai%20informasi%20kos.%20Mohon%20bantuannya%2C%20terima%20kasih!"
              target="_blank" 
              rel="noreferrer"
              className="nav-link flex items-center gap-1 text-accent hover:text-primary transition-colors"
            >
              <MessageCircle size={16} /> Hubungi Admin
            </a>
          )}
          
          {user ? (
            <>
              {user.role === 'admin' && (
                <>
                  <Link to="/dashboard" className="nav-link flex items-center gap-2">
                    <LayoutDashboard size={18} /> Dashboard
                  </Link>
                  <Link to="/finance" className="nav-link flex items-center gap-2">
                    <DollarSign size={18} /> Keuangan
                  </Link>
                </>
              )}
              <span className="text-muted">Halo, {user.name}</span>
              <button onClick={handleLogout} className="btn btn-danger flex items-center gap-2">
                <LogOut size={16} /> Keluar
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary flex items-center gap-2">
              <LogIn size={16} /> Masuk
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
