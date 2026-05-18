import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function RegisterDosenStaff() {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState('dosen'); // 'dosen' or 'staff'
  const [formData, setFormData] = useState({
    nama: '',
    username: '',
    email: '',
    password: '',
    nip: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        role: activeRole
      };
      const response = await api.post('/auth/register', payload);
      if (response.status === 201) {
        toast.success(`Registrasi ${activeRole} berhasil! Silakan login.`);
        navigate('/login');
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        toast.error(detail);
      } else {
        toast.error('Gagal melakukan registrasi. Pastikan data benar.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 py-12">
      <div className="flex flex-col items-center mb-6 text-center">
        <div className={`w-14 h-14 text-white flex items-center justify-center rounded-2xl shadow-lg mb-4 transition-colors duration-300 ${activeRole === 'dosen' ? 'bg-emerald-600' : 'bg-indigo-600'}`}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">Registrasi Dosen & Staff</h1>
        <p className="text-sm text-gray-500 font-medium">Buat akun untuk mengelola sistem magang</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 max-w-xl w-full shadow-xl shadow-indigo-900/5">
        <div className="flex gap-3 mb-8 bg-gray-50 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveRole('dosen')}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeRole === 'dosen' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Dosen
          </button>
          <button
            type="button"
            onClick={() => setActiveRole('staff')}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeRole === 'staff' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Staff
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Nama Lengkap</label>
              <input
                type="text"
                required
                placeholder="Nama Lengkap & Gelar"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-medium"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Username</label>
              <input
                type="text"
                required
                placeholder="username_dosen"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-medium"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Email Institusi</label>
            <input
              type="email"
              required
              placeholder="nama@apps.ipb.ac.id"
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-medium"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-medium"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">NIP</label>
            <input
              type="text"
              required
              placeholder="Masukkan 18 digit NIP"
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-medium"
              value={formData.nip}
              onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-lg mt-4 flex items-center justify-center gap-2 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            } ${activeRole === 'dosen' ? 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700' : 'bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700'}`}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              `Daftar Sebagai ${activeRole.toUpperCase()}`
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8 font-medium">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-indigo-600 font-bold hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
