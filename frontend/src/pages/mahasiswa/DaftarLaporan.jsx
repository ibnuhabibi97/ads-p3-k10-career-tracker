import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { DashboardSkeleton } from '../../components/Skeleton';
import toast from 'react-hot-toast';

export default function DaftarLaporan() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [laporanList, setLaporanList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLaporans = async () => {
      try {
        const response = await api.get(`/laporan/mahasiswa/${user.user_id}`);
        setLaporanList(response.data);
      } catch (err) {
        toast.error('Gagal memuat daftar laporan.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLaporans();
  }, [user.user_id]);

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900">Daftar Magang Anda 🚀</h2>
        <p className="text-gray-500 text-sm">Pilih program magang di bawah untuk melihat detail logbook dan laporan.</p>
      </div>

      <div className="space-y-4">
        {laporanList.length > 0 ? (
          laporanList.map((laporan) => (
            <div 
              key={laporan.laporan_id} 
              className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all flex justify-between items-center cursor-pointer group"
              onClick={() => navigate(`/mahasiswa/laporan/${laporan.laporan_id}`)}
            >
              <div className="flex items-center gap-5 flex-1 pr-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-colors ${
                  laporan.status === 'GRADED' ? 'bg-green-50' : 'bg-blue-50'
                }`}>
                  {laporan.status === 'GRADED' ? '🎯' : '💼'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-gray-800 text-lg tracking-tight group-hover:text-blue-600 transition-colors truncate">{laporan.lowongan?.judul_posisi || 'Posisi Magang'}</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest truncate">{laporan.lowongan?.perusahaan || 'Perusahaan'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                      laporan.status === 'GRADED' ? 'bg-green-50 text-green-700 border-green-100' :
                      laporan.status === 'REVISION' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      laporan.status === 'PENDING' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      'bg-gray-50 text-gray-600 border-gray-100'
                    }`}>
                      {laporan.status}
                    </span>
                    {laporan.status === 'GRADED' && (
                      <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm">
                        Nilai Akhir: {laporan.nilai}
                      </span>
                    )}
                  </div>
                  {laporan.catatan && (
                    <div className="mt-3 text-[11px] text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 italic relative overflow-hidden">
                      <div className="absolute left-0 top-0 w-1 h-full bg-indigo-200"></div>
                      " {laporan.catatan} "
                    </div>
                  )}
                </div>
              </div>
              <button className="px-5 py-2.5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl group-hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-gray-900/20 group-hover:shadow-blue-600/20 shrink-0">Kelola</button>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
            <div className="text-5xl mb-4 grayscale opacity-20">📂</div>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Belum ada riwayat laporan magang.</p>
          </div>
        )}
      </div>
    </div>
  );
}
