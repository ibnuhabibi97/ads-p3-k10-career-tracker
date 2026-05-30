import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password_lama: '',
    password_baru: '',
    konfirmasi_password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password_baru !== formData.konfirmasi_password) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Memperbarui password...');
    try {
      await api.post('/auth/change-password', {
        password_lama: formData.password_lama,
        password_baru: formData.password_baru
      });
      toast.success('Password berhasil diperbarui!', { id: loadingToast });
      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Gagal memperbarui password', { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="pb-12">
      <main className="max-w-2xl mx-auto mt-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <h2 className="text-xl font-bold text-gray-900">Ubah Password Akun</h2>
            <button 
              onClick={() => navigate(-1)} 
              className="px-4 py-1.5 bg-gray-50 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Kembali
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Password Saat Ini</label>
              <input 
                type="password" name="password_lama" required
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 transition-all"
                value={formData.password_lama}
                onChange={handleChange}
              />
            </div>
            <div className="pt-2 border-t border-gray-50">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Password Baru</label>
              <input 
                type="password" name="password_baru" required minLength={8}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 transition-all"
                value={formData.password_baru}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Konfirmasi Password Baru</label>
              <input 
                type="password" name="konfirmasi_password" required
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 transition-all"
                value={formData.konfirmasi_password}
                onChange={handleChange}
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full py-4 bg-indigo-600 text-white font-black tracking-widest uppercase text-xs rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 ${isSubmitting ? 'opacity-70' : ''}`}
            >
              Update Password
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
