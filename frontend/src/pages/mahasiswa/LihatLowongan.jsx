import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function LihatLowongan() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [lowonganList, setLowonganList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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
      setError('Gagal memuat daftar lowongan.');
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
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Lihat Lowongan" 
        userName={user?.nama} 
        userDetail={`NIM. ${user?.nim}`} 
        bgColor="bg-blue-600" 
      />
      
      <main className="max-w-4xl mx-auto px-6 mt-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Lowongan Magang</h2>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Cari posisi atau perusahaan..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-100 text-red-600 rounded-xl text-center text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4 pb-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-500 text-sm font-medium">Memuat lowongan...</p>
            </div>
          ) : lowonganList.length > 0 ? (
            lowonganList.map((job) => (
              <div key={job.lowongan_id} className="bg-white p-5 rounded-2xl border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 text-xl font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {job.perusahaan.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{job.judul_posisi}</h3>
                    <p className="text-sm text-gray-500">{job.perusahaan}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="text-xs text-gray-400 flex items-center gap-1">📍 {job.lokasi}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">⏱️ {job.durasi}</span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md font-medium">{job.tipe_magang}</span>
                    </div>
                  </div>
                </div>
                <button className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                  Detail
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-gray-500 text-sm">Tidak ada lowongan yang ditemukan.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
