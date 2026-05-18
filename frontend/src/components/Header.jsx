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
    <header className={`${bgColor} text-white px-8 py-5 flex items-center justify-between shadow-xl shadow-gray-200/20 sticky top-0 z-40 transition-all duration-300`}>
      <div className="flex items-center gap-4">
        <button 
          onClick={handleBack}
          className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl transition-all group relative focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95"
          aria-label="Kembali"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="h-8 w-[1px] bg-white/20 mx-2 hidden sm:block"></div>
        <h1 className="text-lg font-black tracking-tight uppercase">{title}</h1>
      </div>
      
      <div className="flex items-center gap-8">
        <NotificationDropdown />
        <div className="flex items-center gap-4 border-l border-white/20 pl-8 hidden sm:flex">
          <div className="text-right">
            <p className="text-sm font-black leading-none">{userName}</p>
            <p className="text-[10px] text-white/60 uppercase font-black tracking-[0.1em] mt-1.5">{userDetail}</p>
          </div>
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-black text-xs border border-white/10 group-hover:bg-white/20 transition-all">
            {userName?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
