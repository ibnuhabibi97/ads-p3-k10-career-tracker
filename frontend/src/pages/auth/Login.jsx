import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Ambil state role dari halaman home (jika ada), default ke 'mahasiswa'
  const [activeRole, setActiveRole] = useState('mahasiswa');
  const [formData, setFormData] = useState({ identifier: '', password: '' });

  useEffect(() => {
    if (location.state?.selectedRole) {
      setActiveRole(location.state.selectedRole);
    }
  }, [location.state]);

  const handleLogin = (e) => {
    e.preventDefault();
    // Proses autentikasi di sini...
    
    // Contoh redirect setelah login sukses berdasarkan role
    if (activeRole === 'mahasiswa') navigate('/mahasiswa/dashboard');
    else if (activeRole === 'dosen') navigate('/dosen/dashboard');
    else if (activeRole === 'staff') navigate('/staff/dashboard');
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
        <p className="text-sm text-gray-500">Kelola data magang mahasiswa</p>
      </div>

      {/* Card Form */}
      <div className="bg-white border border-gray-100 rounded-3xl p-8 max-w-md w-full shadow-sm">
        <label className="text-sm font-semibold text-gray-700 block mb-3">Masuk Sebagai</label>
        
        {/* Role Tabs Selection */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {[
            { id: 'mahasiswa', label: 'Mahasiswa', icon: '🎓' },
            { id: 'dosen', label: 'Dosen', icon: '👥' },
            { id: 'staff', label: 'Staff', icon: '💼' },
          ].map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => setActiveRole(role.id)}
              className={`py-3 px-2 rounded-xl border flex flex-col items-center gap-1 text-xs font-medium transition-all ${
                activeRole === role.id
                  ? 'border-indigo-500 bg-indigo-50/50 text-indigo-600 ring-2 ring-indigo-100'
                  : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{role.icon}</span>
              {role.label}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Email atau NIM/NIP</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                type="text"
                required
                placeholder="Masukkan email atau NIM/NIP"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
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
            <button type="button" className="text-xs text-indigo-600 hover:underline font-medium">
              Lupa password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-500 text-white font-semibold rounded-xl hover:bg-indigo-600 transition-colors shadow-md shadow-indigo-100 mt-2"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}