import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header({ title, userName, userDetail, bgColor = 'bg-blue-600', onBackClick }) {
  const navigate = useNavigate();

  const handleBack = () => {
    // Jika ada fungsi custom yang dikirim lewat props (misal untuk logout), jalankan fungsi tersebut
    if (onBackClick) {
      onBackClick();
    } else {
      // Jika tidak ada, fungsi defaultnya adalah kembali ke halaman sebelumnya (Home/Role Selection)
      navigate('/');
    }
  };

  return (
    <header className={`${bgColor} text-white px-6 py-4 flex items-center justify-between shadow-md rounded-b-xl`}>
      <div className="flex items-center gap-3">
        {/* Tombol Back / Logout */}
        <button 
          onClick={handleBack}
          className="hover:bg-white/20 p-2 rounded-full transition-colors group relative"
          title="Kembali / Keluar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold tracking-wide">{title}</h1>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">{userName}</p>
        <p className="text-xs text-white/80">{userDetail}</p>
      </div>
    </header>
  );
}