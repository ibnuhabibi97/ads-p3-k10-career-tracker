import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function DashboardDosen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mahasiswaList, setMahasiswaList] = useState([]);
  const [stats, setStats] = useState([
    { label: 'Mahasiswa Bimbingan', count: 0, icon: '👥', color: 'text-green-600' },
    { label: 'Magang Aktif', count: 0, icon: '📘', color: 'text-blue-600' },
    { label: 'Selesai', count: 0, icon: '🎓', color: 'text-purple-600' },
    { label: 'Perlu Dinilai', count: 0, icon: '📝', color: 'text-orange-600' },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/laporan/dosen/${user.user_id}`);
        const data = response.data;
        setMahasiswaList(data);

        // Calculate stats
        const total = data.length;
        const active = data.filter(l => l.status === 'PENDING').length;
        const finished = data.filter(l => l.status === 'GRADED').length;
        const needGrading = data.filter(l => l.status === 'PENDING' && l.dokumen_laporan).length;

        setStats([
          { label: 'Mahasiswa Bimbingan', count: total, icon: '👥', color: 'text-green-600' },
          { label: 'Magang Aktif', count: active, icon: '📘', color: 'text-blue-600' },
          { label: 'Selesai', count: finished, icon: '🎓', color: 'text-purple-600' },
          { label: 'Perlu Dinilai', count: needGrading, icon: '📝', color: 'text-orange-600' },
        ]);
      } catch (err) {
        console.error('Gagal memuat data bimbingan:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user.user_id]);

  const mainMenus = [
    { title: 'Berikan Nilai', desc: 'Tinjau laporan & input nilai', icon: '🏅', path: '/dosen/nilai' },
    { title: 'Surat Rekomendasi', desc: 'Kelola permintaan', icon: '✍️', path: '/dosen/rekomendasi' },
  ];

  return (
    <div className="pb-12">
      <div className="max-w-7xl mx-auto space-y-8">
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
            {isLoading ? (
              <div className="p-10 text-center text-gray-500">Memuat data mahasiswa...</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
                    <th className="py-4 px-6">Nama</th>
                    <th className="py-4 px-6">NIM</th>
                    <th className="py-4 px-6">Status Laporan</th>
                    <th className="py-4 px-6">Nilai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {mahasiswaList.length > 0 ? (
                    mahasiswaList.map((laporan, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="py-4 px-6 font-medium text-gray-900">{laporan.mahasiswa_nama}</td>
                        <td className="py-4 px-6 text-gray-500">{laporan.mahasiswa_nim}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            laporan.status === 'GRADED' ? 'bg-green-50 text-green-700 border-green-200' : 
                            laporan.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' : 
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {laporan.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${laporan.nilai ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-gray-400'}`}>
                            {laporan.nilai || '-'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-gray-400 italic">Belum ada mahasiswa bimbingan.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
