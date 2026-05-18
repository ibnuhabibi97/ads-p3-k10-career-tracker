import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setIsSubmitted(true);
      toast.success('Link reset password telah dikirim ke email Anda.');
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
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Lupa Password</h1>
        <p className="text-sm text-gray-500">Masukkan email Anda untuk menerima link reset password</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-8 max-w-md w-full shadow-sm">
        {isSubmitted ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-50 text-green-500 flex items-center justify-center rounded-full mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-700">Kami telah mengirimkan instruksi reset password ke email <strong>{email}</strong>.</p>
            <p className="text-xs text-gray-500">Silakan periksa kotak masuk atau folder spam Anda.</p>
            <Link
              to="/login"
              className="block w-full py-3 bg-indigo-500 text-white font-semibold rounded-xl hover:bg-indigo-600 transition-colors shadow-md shadow-indigo-100 mt-6"
            >
              Kembali ke Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-semibold text-gray-700 block mb-1">Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                'Kirim Link Reset'
              )}
            </button>
            
            <div className="text-center mt-4">
              <Link to="/login" className="text-xs text-gray-500 hover:text-indigo-600 font-medium">
                Tiba-tiba ingat password? Login saja
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
