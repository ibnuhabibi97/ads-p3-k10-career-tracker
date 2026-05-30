import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        try {
          // Tambahan: Validasi token di sisi server
          // Asumsi endpoint /auth/me atau setara ada, 
          // tapi karena belum ada, kita gunakan validasi ringan atau langsung set user
          setUser(JSON.parse(storedUser));
        } catch (err) {
          console.error("Gagal inisialisasi user:", err);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (identifier, password) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', identifier);
      formData.append('password', password);

      const response = await api.post('/auth/login', formData);

      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true, role: userData.role };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Gagal login.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
