import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';

export default function ChangePassword() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    password_lama: '',
    password_baru: '',
    konfirmasi_password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password_baru !== formData.konfirmasi_password) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.put('/auth/change-password', {
        password_lama: formData.password_lama,
        password_baru: formData.password_baru
      });
      
      if (response.status === 200) {
        setSuccess('Password berhasil diubah!');
        setFormData({ password_lama: '', password_baru: '', konfirmasi_password: '' });
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal mengubah password. Pastikan password lama benar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header 
        title="Ubah Password" 
        userName={user?.nama} 
        userDetail={user?.role?.toUpperCase()}
        bgColor="bg-indigo-600"
        onBackClick={() => navigate(-1)}
      />

      <div className="max-w-md mx-auto mt-10 px-6">
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Keamanan Akun</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-100 text-green-600 text-sm rounded-xl text-center">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Password Lama</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                value={formData.password_lama}
                onChange={(e) => setFormData({ ...formData, password_lama: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Password Baru</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                value={formData.password_baru}
                onChange={(e) => setFormData({ ...formData, password_baru: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Konfirmasi Password Baru</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                value={formData.konfirmasi_password}
                onChange={(e) => setFormData({ ...formData, konfirmasi_password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 bg-indigo-500 text-white font-semibold rounded-xl hover:bg-indigo-600 transition-colors shadow-md shadow-indigo-100 mt-4 flex items-center justify-center ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Simpan Password Baru'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
