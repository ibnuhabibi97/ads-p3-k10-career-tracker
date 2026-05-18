import React from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';

export default function Header({ title, userName, userDetail, bgColor = 'bg-blue-600', onBackClick }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className={`${bgColor} text-white px-6 py-4 flex items-center justify-between shadow-lg sticky top-0 z-40`}>
      <div className="flex items-center gap-3">
        <button 
          onClick={handleBack}
          className="hover:bg-white/20 p-2 rounded-full transition-colors group relative"
          title="Kembali"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-xl font-bold tracking-wide">{title}</h1>
      </div>
      
      <div className="flex items-center gap-6">
        <NotificationDropdown />
        <div className="text-right border-l border-white/20 pl-6 hidden sm:block">
          <p className="text-sm font-bold">{userName}</p>
          <p className="text-[10px] text-white/70 uppercase font-black tracking-widest">{userDetail}</p>
        </div>
      </div>
    </header>
  );
}
