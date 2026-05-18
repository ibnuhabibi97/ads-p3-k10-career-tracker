import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function ChangePassword() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    password_lama: '',
    password_baru: '',
    konfirmasi_password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password_baru !== formData.konfirmasi_password) {
      toast.error('Konfirmasi password tidak cocok.');
      return;
    }

    if (formData.password_baru.length < 8) {
      toast.error('Password baru minimal 8 karakter.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.put('/auth/change-password', {
        password_lama: formData.password_lama,
        password_baru: formData.password_baru
      });
      
      if (response.status === 200) {
        toast.success('Password berhasil diperbarui!');
        setFormData({ password_lama: '', password_baru: '', konfirmasi_password: '' });
        // Optional: Logout or redirect
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : 'Gagal mengubah password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header 
        title="Pengaturan Keamanan" 
        userName={user?.nama} 
        userDetail={user?.role?.toUpperCase()}
        bgColor="bg-indigo-600"
        onBackClick={() => navigate(-1)}
      />

      <div className="max-w-xl mx-auto mt-12 px-6">
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-xl shadow-indigo-900/5">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl">
              🔐
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Ubah Password</h2>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Perbarui keamanan akun Anda</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Password Saat Ini</label>
              <input
                type="password"
                required
                placeholder="Masukkan password lama"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-medium"
                value={formData.password_lama}
                onChange={(e) => setFormData({ ...formData, password_lama: e.target.value })}
              />
            </div>

            <div className="pt-2 border-t border-gray-50 mt-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Password Baru</label>
              <input
                type="password"
                required
                placeholder="Minimal 8 karakter"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-medium"
                value={formData.password_baru}
                onChange={(e) => setFormData({ ...formData, password_baru: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Ulangi Password Baru</label>
              <input
                type="password"
                required
                placeholder="Pastikan sama dengan password baru"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-medium"
                value={formData.konfirmasi_password}
                onChange={(e) => setFormData({ ...formData, konfirmasi_password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 mt-4 flex items-center justify-center gap-2 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Simpan Perubahan'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
