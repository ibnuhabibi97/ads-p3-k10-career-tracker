import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { TableSkeleton } from '../../components/Skeleton';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function LihatLowongan() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [lowonganList, setLowonganList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk Detail Modal
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

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

  const fetchDetail = async (id) => {
    setIsModalLoading(true);
    try {
      const response = await api.get(`/lowongan/${id}`);
      setSelectedJob(response.data);
    } catch (err) {
      toast.error('Gagal memuat detail lowongan.');
    } finally {
      setIsModalLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLowongan(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div className="space-y-6 relative">
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
                  onClick={() => fetchDetail(job.lowongan_id)}
                  className="flex-1 py-3 px-4 bg-gray-50 text-gray-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-all"
                >
                  Detail
                </button>
                <button 
                  onClick={() => navigate('/mahasiswa/daftar', { state: { lowongan_id: job.lowongan_id } })}
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

      {/* Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setSelectedJob(null)}
          ></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {isModalLoading ? (
              <div className="p-20 flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Memuat Detail...</p>
              </div>
            ) : (
              <>
                {/* Modal Header */}
                <div className="relative h-32 bg-blue-600 flex items-end px-8 pb-4">
                  <div className="absolute top-4 right-4">
                    <button 
                      onClick={() => setSelectedJob(null)}
                      className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center text-3xl font-black text-blue-600 absolute -bottom-6 left-8">
                    {selectedJob.perusahaan.charAt(0)}
                  </div>
                </div>

                <div className="px-8 pt-12 pb-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 leading-tight">{selectedJob.judul_posisi}</h2>
                    <p className="text-lg font-bold text-blue-600 mt-1">{selectedJob.perusahaan}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lokasi</p>
                      <p className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                        <span className="text-base">📍</span> {selectedJob.lokasi || 'Remote'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Durasi</p>
                      <p className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                        <span className="text-base">⏱️</span> {selectedJob.durasi || '6 Bulan'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipe</p>
                      <p className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                        <span className="text-base">💼</span> {selectedJob.tipe_magang || 'Full-time'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quota</p>
                      <p className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                        <span className="text-base">👥</span> {selectedJob.quota || '-'} Orang
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Deskripsi Pekerjaan</h4>
                    <p className="text-sm text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">
                      {selectedJob.deskripsi || 'Belum ada deskripsi untuk posisi ini.'}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Kualifikasi & Persyaratan</h4>
                    <p className="text-sm text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">
                      {selectedJob.persyaratan || 'Belum ada persyaratan khusus untuk posisi ini.'}
                    </p>
                  </div>
                </div>

                <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex gap-4">
                  <button 
                    onClick={() => setSelectedJob(null)}
                    className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Tutup
                  </button>
                  <button 
                    onClick={() => navigate('/mahasiswa/daftar', { state: { lowongan_id: selectedJob.lowongan_id } })}
                    className="flex-[2] py-4 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    Lamar Sekarang
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
