import React from 'react';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';

export default function DashboardDosen() {
  const navigate = useNavigate();

  const stats = [
    { label: 'Mahasiswa Bimbingan', count: 12, icon: '👥', color: 'text-green-600' },
    { label: 'Magang Aktif', count: 8, icon: '📘', color: 'text-blue-600' },
    { label: 'Selesai', count: 4, icon: '🎓', color: 'text-purple-600' },
    { label: 'Perlu Dinilai', count: 3, icon: '📝', color: 'text-orange-600' },
  ];

  const mainMenus = [
    { title: 'Tinjau Progres', desc: 'Lihat logbook mahasiswa', icon: '📊', path: '/dosen/progres' },
    { title: 'Berikan Nilai', desc: 'Input nilai magang', icon: '🏅', path: '/dosen/nilai' },
    { title: 'Surat Rekomendasi', desc: 'Kelola permintaan', icon: '✍️', path: '/dosen/rekomendasi' },
  ];

  const mahasiswaList = [
    { nama: 'Muhammad Rizki', nim: '123456789', perusahaan: 'PT Tech Indonesia', progres: 60, nilai: 'Belum dinilai' },
    { nama: 'Siti Aminah', nim: '123456790', perusahaan: 'CV Digital Creative', progres: 85, nilai: 'A' },
    { nama: 'Budi Santoso', nim: '123456791', perusahaan: 'PT Data Solutions', progres: 40, nilai: 'Belum dinilai' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header 
        title="Dashboard Dosen Pembimbing" 
        userName="Dr. Ahmad Suryadi, M.Kom" 
        userDetail="NIDN. 0012345678" 
        bgColor="bg-green-600" 
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
              <div className="text-xl p-3 bg-green-50 text-green-600 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-colors">
                {menu.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{menu.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{menu.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabel Mahasiswa Bimbingan */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">Daftar Mahasiswa Bimbingan</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
                  <th className="py-4 px-6">Nama</th>
                  <th className="py-4 px-6">NIM</th>
                  <th className="py-4 px-6">Perusahaan</th>
                  <th className="py-4 px-6">Progres</th>
                  <th className="py-4 px-6">Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {mahasiswaList.map((mhs, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-4 px-6 font-medium text-gray-900">{mhs.nama}</td>
                    <td className="py-4 px-6 text-gray-500">{mhs.nim}</td>
                    <td className="py-4 px-6">{mhs.perusahaan}</td>
                    <td className="py-4 px-6 w-1/5">
                      <div className="flex items-center gap-3">
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-green-500 h-full" style={{ width: `${mhs.progres}%` }}></div>
                        </div>
                        <span className="text-xs font-semibold text-gray-500">{mhs.progres}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${mhs.nilai === 'A' ? 'bg-green-50 text-green-700 border border-green-200' : 'text-gray-400'}`}>
                        {mhs.nilai}
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