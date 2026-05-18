import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { TableSkeleton } from '../../components/Skeleton';
import toast from 'react-hot-toast';

export default function LihatLowongan() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [lowonganList, setLowonganList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLowongan = async (query = '') => {
    setIsLoading(true);
    try {
      let endpoint = '/lowongan/aktif';
      if (query) {
        endpoint = `/lowongan/?q=${encodeURIComponent(query)}`;
      }
      const response = await api.get(endpoint);
      setLowonganList(response.data);
    } catch (err) {
      toast.error('Gagal memuat daftar lowongan.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLowongan(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      {/* Search Header Section */}
      <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Eksplorasi Lowongan 💼</h2>
          <p className="text-sm text-gray-500 font-medium">Temukan peluang magang terbaik untuk karir masa depan Anda.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Cari posisi, skill, atau perusahaan..."
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Lowongan Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        {isLoading ? (
          <div className="col-span-full">
            <TableSkeleton />
          </div>
        ) : lowonganList.length > 0 ? (
          lowonganList.map((job) => (
            <div key={job.lowongan_id} className="bg-white p-6 rounded-[2rem] border border-gray-100 flex flex-col justify-between hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-bl-[4rem] -mr-8 -mt-8 group-hover:bg-blue-600 transition-colors duration-500"></div>
              
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-2xl font-black group-hover:scale-110 transition-transform duration-300">
                    {job.perusahaan.charAt(0)}
                  </div>
                  <span className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-gray-100">
                    {job.tipe_magang || 'Full-time'}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-black text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">{job.judul_posisi}</h3>
                  <p className="text-sm font-bold text-gray-400">{job.perusahaan}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-gray-50">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                    <span className="text-lg">📍</span> {job.lokasi || 'Remote'}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                    <span className="text-lg">⏱️</span> {job.durasi || '6 Bulan'}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => toast.success('Fitur Detail segera hadir!')}
                  className="flex-1 py-3 px-4 bg-gray-50 text-gray-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-all"
                >
                  Detail
                </button>
                <button 
                  className="flex-1 py-3 px-4 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                  Lamar Sekarang
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] border border-dashed border-gray-200">
            <div className="text-6xl mb-6 grayscale opacity-20">🔎</div>
            <h3 className="text-xl font-bold text-gray-800">Tidak ada lowongan ditemukan</h3>
            <p className="text-sm text-gray-400 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
          </div>
        )}
      </div>
    </div>
  );
}
