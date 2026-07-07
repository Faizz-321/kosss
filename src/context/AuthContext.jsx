import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const storedUser = localStorage.getItem('booking_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const register = async (name, email, password) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || 'Gagal mendaftar' };
      }
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Server tidak merespon. Pastikan backend sudah menyala.' };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || 'Email atau password salah!' };
      }
      
      const sessionUser = data.user;
      setUser(sessionUser);
      localStorage.setItem('booking_user', JSON.stringify(sessionUser));
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Server tidak merespon. Pastikan backend sudah menyala.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('booking_user');
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
