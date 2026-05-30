import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { DashboardSkeleton } from '../../components/Skeleton';

export default function DashboardMahasiswa() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStatus] = useState({
    pendaftaran: null,
    logbookCount: 0,
    laporanStatus: 'Belum Upload'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Jalankan semua request secara paralel untuk kecepatan maksimal
        const [resPendaftaran, resLogbook, resLaporan] = await Promise.all([
          api.get('/pendaftaran/saya'),
          api.get(`/logbook/mahasiswa/${user.user_id}`),
          api.get(`/laporan/mahasiswa/${user.user_id}`)
        ]);

        const listPendaftaran = resPendaftaran.data;
        const pendaftaranTerbaru = listPendaftaran.length > 0 ? listPendaftaran[0] : null;

        const laporanTerbaru = resLaporan.data.length > 0 ? resLaporan.data[0] : null;

        setStatus({
          pendaftaran: pendaftaranTerbaru,
          logbookCount: resLogbook.data.length,
          laporanStatus: laporanTerbaru ? laporanTerbaru.status : 'Belum Upload'
        });
      } catch (err) {
        console.error('Gagal mengambil data dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user.user_id]);

  if (isLoading) return <DashboardSkeleton />;

  const menus = [
    { title: 'Lihat Lowongan', desc: 'Cari magang', icon: '🔍', path: '/mahasiswa/lowongan' },
    { title: 'Daftar Magang', desc: 'Kirim lamaran', icon: '🚀', path: '/mahasiswa/daftar' },
    { title: 'Logbook Harian', desc: 'Catat aktivitas', icon: '📖', path: '/mahasiswa/laporan' },
    { title: 'Laporan Magang', desc: 'Upload laporan', icon: '📤', path: '/mahasiswa/laporan' },
    { title: 'Surat Rekomendasi', desc: 'Minta rekomendasi', icon: '📄', path: '/mahasiswa/hubungi-dosen' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2rem] p-10 text-white shadow-xl shadow-blue-200">
        <h1 className="text-3xl font-black mb-2 tracking-tight">Selamat Datang, {user?.nama}! 👋</h1>
        <p className="text-blue-100 font-medium">Kelola seluruh aktivitas magang Anda dalam satu dashboard terintegrasi.</p>
      </div>

      {/* Grid Menu Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {menus.map((menu, index) => (
          <div
            key={index}
            onClick={() => navigate(menu.path)}
            className="bg-white p-5 border border-gray-100 rounded-3xl flex flex-col items-center text-center gap-3 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group"
          >
            <div className="text-3xl p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              {menu.icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">{menu.title}</h3>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-1">{menu.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Status Magang Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-gray-800 tracking-tight">Status Pendaftaran</h2>
            <button onClick={() => navigate('/mahasiswa/riwayat')} className="text-xs font-bold text-blue-600 hover:underline">Lihat Detail</button>
          </div>
          
          {stats.pendaftaran ? (
            <div className="space-y-6">
               <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl">🏢</div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Perusahaan</p>
                    <p className="text-sm font-bold text-gray-800">{stats.pendaftaran.lowongan?.perusahaan || 'N/A'}</p>
                  </div>
               </div>
               <div className="flex justify-between items-center px-2">
                 <span className="text-sm font-bold text-gray-500 uppercase tracking-wider text-[10px]">Status Seleksi</span>
                 <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest ${
                   stats.pendaftaran.status_seleksi === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                   stats.pendaftaran.status_seleksi === 'REJECTED' ? 'bg-red-100 text-red-700' :
                   'bg-amber-100 text-amber-700'
                 }`}>
                   {stats.pendaftaran.status_seleksi}
                 </span>
               </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-sm text-gray-400 font-medium italic">Anda belum mendaftar di lowongan mana pun.</p>
              <button onClick={() => navigate('/mahasiswa/lowongan')} className="mt-4 px-6 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-200">Cari Lowongan</button>
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm">
          <h2 className="text-xl font-black text-gray-800 tracking-tight mb-6">Progres Aktivitas</h2>
          <div className="space-y-5">
            <div className="p-5 bg-indigo-50 rounded-2xl flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <span className="text-2xl">📓</span>
                 <span className="text-sm font-bold text-indigo-900">Logbook Harian</span>
               </div>
               <span className="text-lg font-black text-indigo-600">{stats.logbookCount} <span className="text-xs font-medium text-indigo-400 uppercase">Entri</span></span>
            </div>
            <div className="p-5 bg-emerald-50 rounded-2xl flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <span className="text-2xl">📤</span>
                 <span className="text-sm font-bold text-emerald-900">Laporan Akhir</span>
               </div>
               <span className="px-3 py-1 bg-white text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">
                 {stats.laporanStatus}
               </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

