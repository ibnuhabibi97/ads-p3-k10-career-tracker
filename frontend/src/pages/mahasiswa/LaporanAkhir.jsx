import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { DashboardSkeleton } from '../../components/Skeleton';
import { useNavigate, useParams } from 'react-router-dom';

export default function LaporanAkhir() {
  const { laporanId } = useParams();
  const navigate = useNavigate();
  const [currentLaporan, setCurrentLaporan] = useState(null);
  const [logbooks, setLogbooks] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const response = await api.get(`/laporan/${laporanId}`);
      setCurrentLaporan(response.data);
      setLogbooks(response.data.logbooks || []);
    } catch (err) {
      toast.error('Gagal memuat data.');
      navigate('/mahasiswa/laporan');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [laporanId]);

  const handleFinalSubmit = async () => {
    if (!selectedFile && !currentLaporan?.dokumen_laporan) {
      toast.error("Silakan unggah file laporan PDF terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Memfinalisasi laporan...');

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('file_laporan', selectedFile);
      }
      formData.append('status', 'PENDING');

      await api.put(`/laporan/${currentLaporan.laporan_id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success("Laporan berhasil difinalisasi!", { id: loadingToast });
      fetchData();
    } catch (err) {
      toast.error("Gagal memfinalisasi laporan.", { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <DashboardSkeleton />;

  if (!currentLaporan) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-blue-900/5 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Progres Magang & Laporan 📈</h2>
          </div>
          <p className="text-sm text-gray-500 font-medium">{currentLaporan.lowongan?.judul_posisi} — {currentLaporan.lowongan?.perusahaan}</p>
        </div>
        <div className="flex items-center gap-6">
           <button 
             onClick={() => navigate(`/mahasiswa/laporan/${currentLaporan.laporan_id}/logbook`)}
             className="px-6 py-3 bg-blue-50 text-blue-600 font-bold rounded-2xl text-xs hover:bg-blue-100 transition-all border border-blue-100 shadow-sm"
           >
             Kelola Logbook Lengkap 📓
           </button>
           <div className="text-center bg-gray-50 px-5 py-2 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
              <span className={`px-4 py-1 rounded-xl text-[10px] font-black uppercase border ${
                  currentLaporan.status === 'GRADED' ? 'bg-green-100 text-green-700 border-green-200' :
                  currentLaporan.status === 'REVISION' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                  'bg-blue-100 text-blue-700 border-blue-200'
              }`}>
                {currentLaporan.status}
              </span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-8">
            {/* Hasil Penilaian Section */}
            {currentLaporan.status === 'GRADED' && (
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 rounded-[3rem] text-white shadow-xl shadow-green-900/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative z-10 flex justify-between items-center">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-100">Hasil Penilaian Akhir</p>
                            <h3 className="text-4xl font-black">Lulus Magang 🎓</h3>
                        </div>
                        <div className="text-center bg-white/20 backdrop-blur-md px-6 py-3 rounded-[2rem] border border-white/30">
                            <p className="text-[10px] font-black text-green-50 uppercase tracking-widest">Skor</p>
                            <p className="text-4xl font-black">{currentLaporan.nilai}</p>
                        </div>
                    </div>
                    {currentLaporan.catatan && (
                        <div className="mt-6 p-4 bg-white/10 rounded-2xl border border-white/10 italic text-sm">
                            "{currentLaporan.catatan}"
                        </div>
                    )}
                </div>
            )}

            {currentLaporan.status === 'REVISION' && (
                <div className="bg-amber-50 p-8 rounded-[3rem] border border-amber-200 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl">⚠️</div>
                        <div>
                            <h3 className="text-lg font-black text-amber-900">Perlu Revisi</h3>
                            <p className="text-xs font-bold text-amber-700">Silakan perbaiki laporan sesuai catatan dosen.</p>
                        </div>
                    </div>
                    {currentLaporan.catatan && (
                        <div className="p-5 bg-white rounded-2xl border border-amber-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 text-center border-b pb-2">Catatan Dosen</p>
                            <p className="text-sm text-amber-800 font-medium italic">"{currentLaporan.catatan}"</p>
                        </div>
                    )}
                </div>
            )}

            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                <h3 className="font-black text-gray-800 mb-6 uppercase text-xs tracking-widest text-center border-b pb-4">Logbook Terbaru</h3>
                <div className="space-y-3">
                    {logbooks.slice(0, 5).map(log => (
                        <div key={log.logbook_id} className="p-4 bg-gray-50 rounded-2xl text-xs font-bold text-gray-700 border border-transparent hover:border-blue-100 transition-all">
                            <div className="flex justify-between mb-1">
                                <span className="text-blue-600 uppercase text-[9px]">{log.jenis_kegiatan}</span>
                                <span className="text-gray-400 text-[9px]">{new Date(log.tanggal_log).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                            </div>
                            <p className="line-clamp-2 leading-relaxed">{log.keterangan || 'Log kosong'}</p>
                        </div>
                    ))}
                    {logbooks.length === 0 && (
                        <p className="text-center text-gray-400 text-xs italic py-4">Belum ada entri logbook.</p>
                    )}
                </div>
            </div>
        </div>

        <div className="bg-gray-900 rounded-[3rem] p-10 text-white space-y-8 flex flex-col justify-center">
           <div className="space-y-2 text-center">
              <h3 className="text-2xl font-black">Finalisasi Laporan 📄</h3>
              <p className="text-gray-400 text-xs font-medium px-10">Unggah dokumen laporan akhir Anda dalam format PDF untuk dinilai oleh dosen bimbingan.</p>
           </div>
           
           <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-700 hover:border-blue-500 rounded-[2.5rem] p-12 text-center cursor-pointer relative group transition-all bg-white/5">
                 <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => setSelectedFile(e.target.files[0])} />
                 <div className="space-y-4">
                    <div className="text-5xl group-hover:scale-110 transition-transform duration-300">{selectedFile ? '✅' : '📤'}</div>
                    <div>
                        <p className="text-sm font-black tracking-tight">{selectedFile ? selectedFile.name : 'Pilih Berkas Laporan'}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Format: PDF (Maks. 5MB)</p>
                    </div>
                 </div>
              </div>

              {currentLaporan.dokumen_laporan && (
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <span className="text-xl">📄</span>
                          <span className="text-xs font-bold text-gray-300">File sudah terunggah</span>
                      </div>
                      <a href={currentLaporan.dokumen_laporan} target="_blank" rel="noreferrer" className="text-[10px] font-black text-blue-400 hover:underline">LIHAT PDF ↗</a>
                  </div>
              )}

              <button 
                onClick={handleFinalSubmit} 
                disabled={isLoading || (!selectedFile && !currentLaporan?.dokumen_laporan)}
                className={`w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 active:scale-95 transition-all uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed ${isLoading ? 'animate-pulse' : ''}`}
              >
                {isLoading ? 'Mengirim...' : currentLaporan.status === 'REVISION' ? 'Unggah Revisi Laporan' : 'Kirim Laporan Akhir'}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
