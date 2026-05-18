import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { TableSkeleton } from '../../components/Skeleton';

export default function VerifikasiPendaftaran() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applicants, setApplicants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchApplicants = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/pendaftaran/');
      setApplicants(response.data);
    } catch (err) {
      toast.error('Gagal memuat data pendaftaran.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleVerify = async (id, newStatus) => {
    const loadingToast = toast.loading('Memperbarui status...');
    try {
      await api.patch(`/pendaftaran/${id}/status`, {
        status_seleksi: newStatus
      });
      toast.success(`Pendaftaran berhasil di-${newStatus.toLowerCase()}`, { id: loadingToast });
      fetchApplicants();
    } catch (err) {
      toast.error("Gagal mengubah status pendaftaran.", { id: loadingToast });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Verifikasi Pelamar 👥</h2>
          <p className="text-sm text-gray-500 font-medium">Tinjau dan tentukan kelulusan mahasiswa pada posisi magang.</p>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
           <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Antrean</span>
           <span className="text-lg font-black text-indigo-600">{applicants.filter(a => a.status_seleksi === 'PENDING').length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 pb-12">
        {isLoading ? (
          <TableSkeleton />
        ) : applicants.length > 0 ? (
          applicants.map((app) => (
            <div key={app.pendaftaran_id} className="bg-white rounded-[2rem] border border-gray-100 p-8 flex flex-col md:flex-row justify-between items-start gap-8 hover:shadow-xl hover:shadow-indigo-900/5 transition-all group relative overflow-hidden">
              {app.status_seleksi === 'PENDING' && (
                <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400"></div>
              )}
              
              <div className="space-y-6 flex-1">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-xl font-black text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    {app.mahasiswa?.nama?.charAt(0) || 'M'}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 text-lg leading-tight">{app.mahasiswa?.nama || 'Mahasiswa'}</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">NIM: {app.mahasiswa?.nim || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Posisi Dilamar</p>
                      <p className="text-sm font-bold text-gray-800">{app.lowongan?.judul_posisi} — {app.lowongan?.perusahaan}</p>
                   </div>
                   <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tanggal Daftar</p>
                      <p className="text-sm font-bold text-gray-800">{new Date(app.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                   </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Berkas Pendaftaran</p>
                  <div className="flex flex-wrap gap-3">
                    <a 
                      href={app.dokumen_cv} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white text-indigo-600 border border-indigo-100 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2 shadow-sm"
                    >
                      📄 Curriculum Vitae
                    </a>
                    <a 
                      href={app.dokumen_surat_rekomendasi} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white text-indigo-600 border border-indigo-100 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2 shadow-sm"
                    >
                      📄 Rekomendasi
                    </a>
                  </div>
                </div>

                {app.status_seleksi === 'PENDING' && (
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => handleVerify(app.pendaftaran_id, 'ACCEPTED')}
                      className="flex-1 md:flex-none px-8 py-3 bg-green-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition-all active:scale-95"
                    >
                      Terima
                    </button>
                    <button 
                      onClick={() => handleVerify(app.pendaftaran_id, 'REJECTED')}
                      className="flex-1 md:flex-none px-8 py-3 bg-red-50 text-red-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-95"
                    >
                      Tolak
                    </button>
                  </div>
                )}
              </div>

              <div className="shrink-0">
                <span className={`px-5 py-2 rounded-xl text-[10px] font-black tracking-[0.15em] uppercase border ${
                  app.status_seleksi === 'ACCEPTED' 
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : app.status_seleksi === 'REJECTED'
                    ? 'bg-red-100 text-red-700 border-red-200'
                    : 'bg-amber-100 text-amber-700 border-amber-200'
                }`}>
                  {app.status_seleksi}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
            <div className="text-6xl mb-6 grayscale opacity-20">🔎</div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Semua pendaftaran telah diproses.</p>
          </div>
        )}
      </div>
    </div>
  );
}
