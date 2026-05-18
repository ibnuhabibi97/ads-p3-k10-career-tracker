import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function RegisterMahasiswa() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nama: '',
    username: '',
    email: '',
    password: '',
    nim: '',
    fakultas: '',
    prodi: '',
    role: 'mahasiswa'
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/auth/register', formData);
      if (response.status === 201) {
        toast.success('Registrasi berhasil! Silakan login.');
        navigate('/login');
      }
    } catch (err) {
      // Error detail sudah ditangani global interceptor, tapi kita bisa override di sini jika perlu
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
      {/* Top Icon & Header */}
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="w-14 h-14 bg-blue-600 text-white flex items-center justify-center rounded-2xl shadow-lg mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">Registrasi Mahasiswa</h1>
        <p className="text-sm text-gray-500 font-medium">Buat akun untuk mengelola magang Anda</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 max-w-xl w-full shadow-xl shadow-blue-900/5">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Nama Lengkap</label>
              <input
                type="text"
                required
                placeholder="Contoh: Muhammad Rizki"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-medium"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Username</label>
              <input
                type="text"
                required
                placeholder="rizki_123"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-medium"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Email IPB</label>
            <input
              type="email"
              required
              placeholder="user@apps.ipb.ac.id"
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-medium"
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
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-medium"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">NIM</label>
              <input
                type="text"
                required
                placeholder="G641XXXX"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-medium"
                value={formData.nim}
                onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Fakultas</label>
              <input
                type="text"
                required
                placeholder="MIPA"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-medium"
                value={formData.fakultas}
                onChange={(e) => setFormData({ ...formData, fakultas: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Program Studi</label>
            <input
              type="text"
              required
              placeholder="Ilmu Komputer"
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-medium"
              value={formData.prodi}
              onChange={(e) => setFormData({ ...formData, prodi: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 mt-4 flex items-center justify-center gap-2 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Daftar Sekarang'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8 font-medium">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
