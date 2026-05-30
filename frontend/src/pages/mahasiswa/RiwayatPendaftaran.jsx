import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { TableSkeleton } from '../../components/Skeleton';

export default function RiwayatPendaftaran() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/pendaftaran/saya');
        setApplications(response.data);
      } catch (err) {
        toast.error('Gagal memuat riwayat pendaftaran.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-8">
      <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Riwayat Lamaran Saya 📂</h2>
          <p className="text-sm text-gray-500 font-medium">Pantau status pendaftaran magang Anda di sini secara real-time.</p>
        </div>
        <div className="flex items-center gap-4 bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100">
          <div className="text-center">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Total Lamaran</p>
            <p className="text-2xl font-black text-blue-600">{applications.length}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <TableSkeleton />
        ) : applications.length > 0 ? (
          applications.map((app) => (
            <div key={app.pendaftaran_id} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 flex flex-col md:flex-row justify-between items-center gap-8 hover:shadow-2xl hover:shadow-blue-900/5 transition-all group border-l-8 border-l-blue-600">
              <div className="space-y-6 flex-1 w-full">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-500">
                    🏢
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 text-xl leading-tight">{app.lowongan?.judul_posisi || 'Posisi Magang'}</h3>
                    <p className="text-sm font-bold text-blue-600 mt-1">{app.lowongan?.perusahaan || 'Perusahaan'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tanggal Daftar</p>
                    <p className="text-sm font-bold text-gray-700">
                      {new Date(app.tanggal_daftar).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status Seleksi</p>
                    <span className={`inline-block px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                      app.status_seleksi === 'ACCEPTED' 
                        ? 'bg-green-50 text-green-600 border-green-100'
                        : app.status_seleksi === 'REJECTED'
                        ? 'bg-red-50 text-red-600 border-red-100'
                        : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {app.status_seleksi}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dokumen Terkirim</p>
                    <div className="flex gap-2">
                      <a href={app.dokumen_cv} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline">CV</a>
                      <span className="text-gray-300">•</span>
                      <a href={app.dokumen_surat_rekomendasi} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline">Rekomendasi</a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-center gap-3">
                {app.status_seleksi === 'ACCEPTED' ? (
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl shadow-lg shadow-green-100">
                    🎉
                  </div>
                ) : app.status_seleksi === 'REJECTED' ? (
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xl shadow-lg shadow-red-100">
                    ❌
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-xl shadow-lg shadow-amber-100 animate-pulse">
                    ⏳
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
            <div className="text-7xl mb-8 grayscale opacity-20">🚀</div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Belum Ada Lamaran</h3>
            <p className="text-gray-400 font-medium max-w-xs mx-auto text-sm">Anda belum mengirimkan lamaran magang. Silakan cari lowongan yang tersedia!</p>
          </div>
        )}
      </div>
    </div>
  );
}
