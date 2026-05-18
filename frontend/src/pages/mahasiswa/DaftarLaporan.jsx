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
        <h2 className="text-2xl font-black text-gray-900">Daftar Magang Anda</h2>
        <p className="text-gray-500 text-sm">Pilih program magang di bawah untuk melihat detail logbook dan laporan.</p>
      </div>

      <div className="space-y-4">
        {laporanList.length > 0 ? (
          laporanList.map((laporan) => (
            <div 
              key={laporan.laporan_id} 
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex justify-between items-center cursor-pointer"
              onClick={() => navigate(`/mahasiswa/laporan/${laporan.laporan_id}`)}
            >
              <div>
                <h3 className="font-bold text-gray-800">{laporan.lowongan?.judul_posisi || 'Posisi Magang'}</h3>
                <p className="text-sm text-gray-500">{laporan.lowongan?.perusahaan || 'Perusahaan'}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                  laporan.status === 'ONGOING' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {laporan.status}
                </span>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl">Kelola</button>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-500 font-bold">Belum ada riwayat laporan magang.</p>
          </div>
        )}
      </div>
    </div>
  );
}
