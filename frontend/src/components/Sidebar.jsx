import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MENU_ITEMS = {
  MAHASISWA: [
    { path: '/mahasiswa/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/mahasiswa/lowongan', label: 'Lowongan Magang', icon: '💼' },
    { path: '/mahasiswa/daftar', label: 'Daftar Magang', icon: '📝' },
    { path: '/mahasiswa/riwayat', label: 'Riwayat Lamaran', icon: '📂' },
    { path: '/mahasiswa/laporan', label: 'Laporan Magang', icon: '📁' },
    { path: '/mahasiswa/hubungi-dosen', label: 'Hubungi Dosen', icon: '💬' },
  ],
  DOSEN: [
    { path: '/dosen/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/dosen/nilai', label: 'Input Nilai', icon: '⭐' },
    { path: '/dosen/rekomendasi', label: 'Surat Rekomendasi', icon: '✉️' },
  ],
  STAFF: [
    { path: '/staff/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/staff/kelola-lowongan', label: 'Kelola Lowongan', icon: '⚙️' },
    { path: '/staff/tambah-lowongan', label: 'Tambah Lowongan', icon: '➕' },
    { path: '/staff/verifikasi', label: 'Verifikasi Pelamar', icon: '✅' },
  ],
};

const THEME_COLORS = {
  MAHASISWA: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
  DOSEN: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100',
  STAFF: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100',
};

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const role = user?.role?.toUpperCase() || 'MAHASISWA';
  const links = MENU_ITEMS[role] || [];
  const theme = THEME_COLORS[role] || THEME_COLORS.STAFF;

  return (
    <aside className="w-72 bg-white border-r border-gray-200 min-h-screen p-6 flex flex-col justify-between sticky top-0 overflow-y-auto">
      <div>
        <div className="mb-10 px-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-200">
            C
          </div>
          <h2 className="text-xl font-black text-gray-800 tracking-tight">Career Tracker</h2>
        </div>
        
        <nav className="space-y-2">
          {links.map((link, idx) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={idx}
                to={link.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? theme
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <span className="text-xl opacity-80">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-4">
        <Link 
          to={`/${role.toLowerCase()}/profil`}
          className="flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
        >
          <span className="text-xl opacity-80">👤</span>
          Profil Saya
        </Link>
        <Link 
          to={`/${role.toLowerCase()}/ubah-password`}
          className="flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
        >
          <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Ubah Password
        </Link>
        <div className="pt-4 border-t border-gray-100">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-all duration-200"
          >
            Keluar Sistem
          </button>
        </div>
      </div>
    </aside>
  );
}
