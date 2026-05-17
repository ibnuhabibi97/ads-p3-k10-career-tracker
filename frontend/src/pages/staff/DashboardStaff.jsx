import React from 'react';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';

export default function DashboardStaff() {
  const navigate = useNavigate();

  const stats = [
    { label: 'Total Lowongan', count: 15, icon: '💼' },
    { label: 'Total Pelamar', count: 48, icon: '👥' },
    { label: 'Perlu Verifikasi', count: 5, icon: '📋' },
    { label: 'Lowongan Aktif', count: 8, icon: '⚡' },
  ];

  const mainMenus = [
    { title: 'Kelola Lowongan', desc: 'CRUD data lowongan', icon: '⚙️', path: '/staff/kelola-lowongan' },
    { title: 'Tambah Lowongan', desc: 'Buat lowongan baru', icon: '➕', path: '/staff/tambah-lowongan' },
    { title: 'Verifikasi Pendaftaran', desc: 'Review lamaran', icon: '🔍', path: '/staff/verifikasi' },
  ];

  const lowonganList = [
    { perusahaan: 'PT Tech Indonesia', posisi: 'Frontend Developer', kuota: 5, pelamar: 12, status: 'Aktif' },
    { perusahaan: 'CV Digital Creative', posisi: 'UI/UX Designer', kuota: 3, pelamar: 8, status: 'Aktif' },
    { perusahaan: 'PT Data Solutions', posisi: 'Data Analyst', kuota: 4, pelamar: 15, status: 'Penuh' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header 
        title="Dashboard Staff Akademik" 
        userName="Henny Kusumawati, S.Kom" 
        userDetail="Staff Akademik" 
        bgColor="bg-purple-600" 
      />

      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        {/* Row Stat Kecil */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div>
                <span className="block text-2xl font-bold text-gray-800">{stat.count}</span>
                <span className="text-xs text-gray-400 font-medium">{stat.label}</span>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          ))}
        </div>

        {/* Row Menu Utama */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {mainMenus.map((menu, idx) => (
            <div
              key={idx}
              onClick={() => navigate(menu.path)}
              className="bg-white p-5 border border-gray-200 rounded-2xl flex items-start gap-4 cursor-pointer hover:shadow-md transition-all group"
            >
              <div className="text-xl p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                {menu.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{menu.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{menu.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabel Lowongan Terbaru */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">Lowongan Terbaru</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
                  <th className="py-4 px-6">Perusahaan</th>
                  <th className="py-4 px-6">Posisi</th>
                  <th className="py-4 px-6 text-center">Kuota</th>
                  <th className="py-4 px-6 text-center">Pelamar</th>
                  <th className="py-4 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {lowonganList.map((job, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-4 px-6 font-medium text-gray-900">{job.perusahaan}</td>
                    <td className="py-4 px-6 text-gray-600">{job.posisi}</td>
                    <td className="py-4 px-6 text-center font-medium">{job.kuota}</td>
                    <td className="py-4 px-6 text-center font-medium">{job.pelamar}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded text-xs font-semibold ${
                        job.status === 'Aktif' 
                          ? 'bg-green-50 text-green-700 border border-green-100' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}