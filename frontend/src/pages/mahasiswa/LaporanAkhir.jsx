import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { DashboardSkeleton } from '../../components/Skeleton';

export default function LaporanAkhir() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentLaporan, setCurrentLaporan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const fetchCurrentLaporan = async () => {
    setIsFetching(true);
    try {
      const response = await api.get(`/laporan/mahasiswa/${user.user_id}`);
      if (response.data.length > 0) {
        setCurrentLaporan(response.data[0]);
      } else {
        setCurrentLaporan(null);
      }
    } catch (err) {
      console.error('Gagal memuat status laporan:', err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchCurrentLaporan();
  }, [user.user_id]);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Silakan pilih file laporan terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Mengunggah laporan akhir...');

    const data = new FormData();
    data.append('file', selectedFile);

    try {
      const response = await api.post('/laporan/', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.status === 201) {
        toast.success("Laporan akhir Anda berhasil diunggah!", { id: loadingToast });
        setSelectedFile(null);
        fetchCurrentLaporan();
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : 'Gagal mengunggah laporan.', { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      'PENDING': { label: 'Menunggu Penilaian', class: 'bg-amber-100 text-amber-700 border-amber-200' },
      'GRADED': { label: 'Selesai & Dinilai', class: 'bg-green-100 text-green-700 border-green-200' },
      'REVISION': { label: 'Perlu Revisi', class: 'bg-red-100 text-red-700 border-red-200' },
    };
    const style = map[status] || { label: status, class: 'bg-gray-100 text-gray-700 border-gray-200' };
    return <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${style.class}`}>{style.label}</span>;
  };

  if (isFetching) return <DashboardSkeleton />;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Page Info */}
      <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Laporan Akhir Magang 📤</h2>
          <p className="text-sm text-gray-500 font-medium">Unggah hasil final pelaksanaan magang Anda untuk penilaian dosen.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 p-10 space-y-10">
        {currentLaporan ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Status Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-gray-50 rounded-[2rem] border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/50 rounded-bl-[5rem] -mr-10 -mt-10"></div>
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                   <span className="text-3xl">📄</span>
                   <div>
                     <h3 className="text-xl font-black text-gray-900 leading-tight">Berkas Laporan Anda</h3>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Submitted: {new Date(currentLaporan.tanggal_submit).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                   </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  {getStatusBadge(currentLaporan.status_laporan)}
                  <a 
                    href={currentLaporan.dokumen_laporan} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-5 py-1.5 bg-white text-blue-600 border border-blue-100 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  >
                    Pratinjau File
                  </a>
                </div>
              </div>

              {currentLaporan.status_laporan === 'REVISION' && (
                <button 
                  onClick={() => {
                    if(window.confirm("Apakah Anda ingin mengganti file laporan yang lama dengan file baru?")) {
                      setCurrentLaporan(null);
                    }
                  }}
                  className="relative z-10 px-6 py-3 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
                >
                  Upload Ulang
                </button>
              )}
            </div>

            {/* Results Section (Grade or Revision) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentLaporan.nilai !== null && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-8 flex justify-between items-center group hover:bg-emerald-100 transition-colors">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-emerald-900 uppercase tracking-widest">Nilai Akhir</h4>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase">Diberikan oleh Dosen</p>
                  </div>
                  <div className="text-5xl font-black text-emerald-700 group-hover:scale-110 transition-transform">{currentLaporan.nilai}</div>
                </div>
              )}

              {currentLaporan.catatan_revisi && (
                <div className={`${currentLaporan.status_laporan === 'REVISION' ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'} border rounded-[2rem] p-8 space-y-3`}>
                  <h4 className={`text-xs font-black uppercase tracking-widest ${currentLaporan.status_laporan === 'REVISION' ? 'text-red-900' : 'text-gray-900'}`}>
                    Catatan Pembimbing
                  </h4>
                  <p className={`text-sm font-medium leading-relaxed italic ${currentLaporan.status_laporan === 'REVISION' ? 'text-red-700' : 'text-gray-600'}`}>
                    "{currentLaporan.catatan_revisi}"
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Upload Interface */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="border-2 border-dashed border-gray-100 rounded-[3rem] p-16 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-all group relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               
               <div className="w-24 h-24 bg-white rounded-[2rem] shadow-sm flex items-center justify-center text-5xl mb-8 group-hover:rotate-12 transition-transform duration-500">
                 📤
               </div>
               
               <div className="text-center space-y-2 mb-10">
                 <h3 className="text-2xl font-black text-gray-900 tracking-tight">Kumpulkan Laporan Akhir</h3>
                 <p className="text-sm text-gray-400 font-medium">Pastikan semua logbook sudah terisi sebelum mengunggah.</p>
               </div>
               
               <div className="flex flex-col items-center gap-6 w-full max-w-sm">
                  <label className="w-full text-center px-10 py-5 bg-blue-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl cursor-pointer hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95">
                    {selectedFile ? 'Ganti Berkas Laporan' : 'Pilih File PDF'}
                    <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                  </label>

                  {selectedFile && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl w-full animate-in zoom-in-95 duration-300">
                       <span className="text-xl">📄</span>
                       <div className="flex-1 min-w-0">
                         <p className="text-[10px] font-black text-green-900 uppercase tracking-widest truncate">{selectedFile.name}</p>
                         <p className="text-[9px] text-green-600 font-bold uppercase tracking-tighter">Ready to Submit</p>
                       </div>
                    </div>
                  )}
               </div>
            </div>

            <button 
              onClick={handleUpload}
              disabled={isLoading || !selectedFile}
              className={`w-full py-5 bg-gray-900 text-white font-black uppercase tracking-[0.3em] text-xs rounded-[2rem] hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-4 ${
                (isLoading || !selectedFile) ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'
              }`}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                '🚀 Finalisasi dan Kirim Laporan'
              )}
            </button>
          </div>
        )}

        {/* Informational Footer */}
        <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-8 flex items-start gap-5">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-xl shrink-0">💡</div>
          <div className="space-y-2">
            <p className="text-xs font-black text-amber-900 uppercase tracking-widest">Informasi Penilaian</p>
            <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
              Laporan yang sudah dikirim akan masuk ke antrean penilaian dosen pembimbing. Jika dosen meminta revisi, status akan berubah menjadi <span className="font-black text-red-700">"PERLU REVISI"</span> dan Anda dapat mengunggah file yang telah diperbaiki.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
