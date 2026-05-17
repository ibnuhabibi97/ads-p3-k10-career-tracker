import React from 'react';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';

export default function DashboardMahasiswa() {
  const navigate = useNavigate();

  const menus = [
    { title: 'Lihat Lowongan', desc: 'Cari magang', icon: '🔍', path: '/mahasiswa/lowongan' },
    { title: 'Dokumen', desc: 'Kelola berkas', icon: '📄', path: '/mahasiswa/dokumen' },
    { title: 'Daftar Magang', desc: 'Kirim lamaran', icon: '🚀', path: '/mahasiswa/daftar' },
    { title: 'Hubungi Dosen', desc: 'Minta rekomendasi', icon: '💬', path: '/mahasiswa/hubungi-dosen' },
    { title: 'Logbook', desc: 'Catat aktivitas', icon: '📖', path: '/mahasiswa/logbook' },
    { title: 'Laporan Akhir', desc: 'Upload laporan', icon: '📤', path: '/mahasiswa/laporan-akhir' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header 
        title="Dashboard Mahasiswa" 
        userName="Muhammad Rizki" 
        userDetail="NIM. 123456789" 
        bgColor="bg-blue-600" 
      />

      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        {/* Grid Menu Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {menus.map((menu, index) => (
            <div
              key={index}
              onClick={() => navigate(menu.path)}
              className="bg-white p-5 border border-gray-200/80 rounded-2xl flex items-start gap-4 cursor-pointer hover:shadow-md transition-all group"
            >
              <div className="text-2xl p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {menu.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{menu.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{menu.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Status Magang Section */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Status Magang</h2>
          <div className="divide-y divide-gray-100">
            <div className="flex justify-between items-center py-3.5">
              <span className="text-sm font-medium text-gray-600">Pendaftaran</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Diterima</span>
            </div>
            <div className="flex justify-between items-center py-3.5">
              <span className="text-sm font-medium text-gray-600">Logbook terisi</span>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">12/20 hari</span>
            </div>
            <div className="flex justify-between items-center py-3.5">
              <span className="text-sm font-medium text-gray-600">Laporan akhir</span>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">Belum upload</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}