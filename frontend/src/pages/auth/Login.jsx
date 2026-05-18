import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const result = await login(formData.identifier, formData.password);
    
    if (result.success) {
      // Redirect berdasarkan role dari backend (normalisasi ke UPPERCASE)
      const userRole = result.role.toUpperCase();
      const dashboardMap = {
        MAHASISWA: '/mahasiswa/dashboard',
        DOSEN: '/dosen/dashboard',
        STAFF: '/staff/dashboard',
      };
      navigate(dashboardMap[userRole] || '/');
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      {/* Top Icon & Header */}
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="w-14 h-14 bg-indigo-500 text-white flex items-center justify-center rounded-2xl shadow-lg mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Sistem Magang Mahasiswa</h1>
        <p className="text-sm text-gray-500">Kelola data magang mahasiswa</p>
      </div>

      {/* Card Form */}
      <div className="bg-white border border-gray-100 rounded-3xl p-8 max-w-md w-full shadow-sm">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center" role="alert">
            {error}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="identifier" className="text-sm font-semibold text-gray-700 block mb-1">Username atau Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400" aria-hidden="true">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                id="identifier"
                type="text"
                required
                placeholder="Masukkan username atau email"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-semibold text-gray-700 block mb-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400" aria-hidden="true">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                id="password"
                type="password"
                required
                placeholder="Masukkan password"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div className="text-right">
            <Link to="/forgot-password" title="Klik untuk mereset password Anda" className="text-xs text-indigo-600 hover:underline font-medium">
              Lupa password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 bg-indigo-500 text-white font-semibold rounded-xl hover:bg-indigo-600 transition-colors shadow-md shadow-indigo-100 mt-2 flex items-center justify-center ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          <p className="text-center text-xs text-gray-500">Belum punya akun?</p>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/register/mahasiswa"
              className="py-2 px-3 border border-indigo-100 bg-indigo-50 text-indigo-600 rounded-xl text-center text-xs font-semibold hover:bg-indigo-100 transition-colors"
            >
              Daftar Mahasiswa
            </Link>
            <Link
              to="/register/dosen-staff"
              className="py-2 px-3 border border-gray-100 bg-gray-50 text-gray-600 rounded-xl text-center text-xs font-semibold hover:bg-gray-100 transition-colors"
            >
              Daftar Dosen/Staff
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}