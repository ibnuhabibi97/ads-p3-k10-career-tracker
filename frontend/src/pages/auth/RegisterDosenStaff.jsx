import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

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
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        role: activeRole
      };
      const response = await api.post('/auth/register', payload);
      if (response.status === 201) {
        alert(`Registrasi ${activeRole} berhasil! Silakan login.`);
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal melakukan registrasi. Pastikan data benar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="w-14 h-14 bg-indigo-500 text-white flex items-center justify-center rounded-2xl shadow-lg mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Registrasi Dosen & Staff</h1>
        <p className="text-sm text-gray-500">Buat akun untuk mengelola sistem magang</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-8 max-w-lg w-full shadow-sm">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center">
            {error}
          </div>
        )}

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveRole('dosen')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeRole === 'dosen' ? 'bg-indigo-500 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            Dosen
          </button>
          <button
            onClick={() => setActiveRole('staff')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeRole === 'staff' ? 'bg-indigo-500 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            Staff
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Username</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">NIP</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              value={formData.nip}
              onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
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
              `Daftar Sebagai ${activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}`
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
