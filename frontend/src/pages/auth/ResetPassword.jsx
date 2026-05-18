import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password_baru: '',
    confirm_password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Token reset password tidak valid atau tidak ditemukan.');
      navigate('/login');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password_baru !== formData.confirm_password) {
      toast.error('Konfirmasi password tidak cocok.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        password_baru: formData.password_baru,
      });
      toast.success('Password berhasil direset. Silakan login dengan password baru.');
      navigate('/login');
    } catch (error) {
      // Error handled by api interceptor
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="w-14 h-14 bg-indigo-500 text-white flex items-center justify-center rounded-2xl shadow-lg mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset Password</h1>
        <p className="text-sm text-gray-500">Silakan masukkan password baru Anda</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-8 max-w-md w-full shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password_baru" className="text-sm font-semibold text-gray-700 block mb-1">Password Baru</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                id="password_baru"
                type="password"
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                value={formData.password_baru}
                onChange={(e) => setFormData({ ...formData, password_baru: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirm_password" className="text-sm font-semibold text-gray-700 block mb-1">Konfirmasi Password Baru</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                id="confirm_password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 bg-indigo-500 text-white font-semibold rounded-xl hover:bg-indigo-600 transition-colors shadow-md shadow-indigo-100 mt-2 flex items-center justify-center ${
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
  );
}
