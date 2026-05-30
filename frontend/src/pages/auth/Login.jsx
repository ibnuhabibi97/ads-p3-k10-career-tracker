import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
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
    } catch (err) {
      setError('Terjadi kesalahan saat mencoba masuk.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      {/* Top Icon & Header */}
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="w-14 h-14 bg-indigo-500 text-white flex items-center justify-center rounded-2xl shadow-lg mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Sistem Magang Mahasiswa</h1>
        <p className="text-sm text-gray-400 font-medium">Kelola data magang mahasiswa</p>
      </div>

      {/* Card Form */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 max-w-md w-full shadow-xl shadow-indigo-900/5">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl text-center flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="identifier" className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Username atau Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                id="identifier"
                type="text"
                required
                placeholder="Masukkan username atau email"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-sm"
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Masukkan password"
                className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all shadow-sm"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="text-right">
            <Link to="/forgot-password" core-title="Klik untuk mereset password Anda" className="text-[10px] text-indigo-600 hover:underline font-black uppercase tracking-widest px-1">
              Lupa password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 mt-2 flex items-center justify-center gap-3 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'
            }`}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Masuk Sekarang'
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-50 space-y-4">
          <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Belum punya akun?</p>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/register/mahasiswa"
              className="py-3 px-3 border border-blue-100 bg-blue-50 text-blue-600 rounded-xl text-center text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all shadow-sm"
            >
              Mahasiswa
            </Link>
            <Link
              to="/register/dosen-staff"
              className="py-3 px-3 border border-gray-100 bg-gray-50 text-gray-600 rounded-xl text-center text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all shadow-sm"
            >
              Dosen / Staff
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
