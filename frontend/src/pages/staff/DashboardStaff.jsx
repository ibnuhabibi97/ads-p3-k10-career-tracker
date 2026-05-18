import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function DashboardStaff() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState([
    { label: 'Total Lowongan', count: 0, icon: '💼' },
    { label: 'Total Pelamar', count: 0, icon: '👥' },
    { label: 'Perlu Verifikasi', count: 0, icon: '📋' },
    { label: 'Lowongan Aktif', count: 0, icon: '⚡' },
  ]);
  const [lowonganList, setLowonganList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lowonganRes, pendaftaranRes] = await Promise.all([
          api.get('/lowongan/'),
          api.get('/pendaftaran/')
        ]);

        const jobs = lowonganRes.data;
        const apps = pendaftaranRes.data;

        setLowonganList(jobs.slice(0, 5)); // Show latest 5

        setStats([
          { label: 'Total Lowongan', count: jobs.length, icon: '💼' },
          { label: 'Total Pelamar', count: apps.length, icon: '👥' },
          { label: 'Perlu Verifikasi', count: apps.filter(a => a.status_seleksi === 'PENDING').length, icon: '📋' },
          { label: 'Lowongan Aktif', count: jobs.filter(j => j.is_active).length, icon: '⚡' },
        ]);
      } catch (err) {
        console.error('Gagal memuat data dashboard staff:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const mainMenus = [
    { title: 'Kelola Lowongan', desc: 'CRUD data lowongan', icon: '⚙️', path: '/staff/kelola-lowongan' },
    { title: 'Tambah Lowongan', desc: 'Buat lowongan baru', icon: '➕', path: '/staff/tambah-lowongan' },
    { title: 'Verifikasi Pendaftaran', desc: 'Review lamaran', icon: '🔍', path: '/staff/verifikasi' },
    { title: 'Ubah Password', desc: 'Keamanan akun', icon: '🔐', path: '/staff/ubah-password' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header 
        title="Dashboard Staff Akademik" 
        userName={user?.nama} 
        userDetail={user?.role?.toUpperCase()} 
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
            {isLoading ? (
              <div className="p-10 text-center text-gray-400 italic">Memuat data...</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
                    <th className="py-4 px-6">Perusahaan</th>
                    <th className="py-4 px-6">Posisi</th>
                    <th className="py-4 px-6 text-center">Kuota</th>
                    <th className="py-4 px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {lowonganList.length > 0 ? (
                    lowonganList.map((job, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="py-4 px-6 font-medium text-gray-900">{job.perusahaan}</td>
                        <td className="py-4 px-6 text-gray-600">{job.judul_posisi}</td>
                        <td className="py-4 px-6 text-center font-medium">{job.kuota}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                            job.is_active 
                              ? 'bg-green-50 text-green-700 border border-green-100' 
                              : 'bg-red-50 text-red-700 border border-red-100'
                          }`}>
                            {job.is_active ? 'Aktif' : 'Non-Aktif'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-gray-400 italic">Belum ada data lowongan.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
