import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { TableSkeleton } from '../../components/Skeleton';

export default function BerikanNilai() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mahasiswaList, setMahasiswaList] = useState([]);
  const [selectedLaporan, setSelectedLaporan] = useState(null);
  const [logbooks, setLogbooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsLoadingSubmit] = useState(false);
  const [isFetchingLogbook, setIsFetchingLogbook] = useState(false);
  
  const [formData, setFormData] = useState({
    nilai: '',
    status: 'GRADED',
    catatan: ''
  });

  useEffect(() => {
    const fetchMahasiswa = async () => {
      try {
        const response = await api.get(`/laporan/dosen/${user.user_id}`);
        // Filter: Hanya mahasiswa yang sudah submit laporan (status PENDING atau sudah dinilai untuk revisi)
        const readyToGrade = response.data.filter(l => l.status === 'PENDING' || l.status === 'GRADED' || l.status === 'REVISION');
        setMahasiswaList(readyToGrade);
      } catch (err) {
        console.error('Gagal memuat daftar mahasiswa:', err);
        toast.error('Gagal memuat daftar mahasiswa.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMahasiswa();
  }, [user.user_id]);

  const handleSelectMahasiswa = async (laporanId) => {
    if (!laporanId) {
      setSelectedLaporan(null);
      setLogbooks([]);
      return;
    }

    const laporan = mahasiswaList.find(m => m.laporan_id === parseInt(laporanId));
    setSelectedLaporan(laporan);
    setFormData({
      nilai: laporan.nilai || '',
      status: laporan.status === 'GRADED' ? 'GRADED' : 'GRADED',
      catatan: laporan.catatan || ''
    });

    setIsFetchingLogbook(true);
    try {
      const response = await api.get(`/logbook/laporan/${laporanId}`);
      setLogbooks(response.data);
    } catch (err) {
      console.error('Gagal memuat logbook:', err);
      toast.error('Gagal memuat logbook mahasiswa.');
    } finally {
      setIsFetchingLogbook(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedLaporan) {
      toast.error('Silakan pilih mahasiswa terlebih dahulu.');
      return;
    }

    const loadingToast = toast.loading('Menyimpan penilaian...');
    setIsLoadingSubmit(true);

    try {
      const response = await api.patch(`/laporan/${selectedLaporan.laporan_id}/nilai`, {
        nilai: parseInt(formData.nilai),
        status: formData.status,
        catatan: formData.catatan
      });
      
      if (response.status === 200) {
        toast.success("Penilaian berhasil disimpan!", { id: loadingToast });
        navigate('/dosen/dashboard');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Gagal menyimpan penilaian.';
      toast.error(errorMsg, { id: loadingToast });
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  return (
    <div className="pb-20">
      <main className="max-w-6xl mx-auto mt-8 space-y-8">
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
           <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Penilaian & Tinjauan Laporan</h2>
              <p className="text-sm text-gray-500 font-medium">Tinjau logbook dan laporan akhir sebelum memberikan nilai.</p>
           </div>
           <button 
             onClick={() => navigate(-1)} 
             className="px-6 py-2.5 bg-gray-50 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-100 transition-all"
           >
             Kembali
           </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Left: Selection & Info */}
           <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pilih Mahasiswa</label>
                    {isLoading ? (
                      <div className="py-4 text-center text-gray-400 text-xs italic">Memuat data...</div>
                    ) : (
                      <select 
                        className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                        value={selectedLaporan?.laporan_id || ''}
                        onChange={(e) => handleSelectMahasiswa(e.target.value)}
                      >
                        <option value="">-- Pilih Mahasiswa --</option>
                        {mahasiswaList.map((m) => (
                          <option key={m.laporan_id} value={m.laporan_id}>
                            {m.mahasiswa_nama} ({m.status})
                          </option>
                        ))}
                      </select>
                    )}
                 </div>

                 {selectedLaporan && (
                   <div className="p-5 bg-green-50 rounded-3xl border border-green-100 space-y-4">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">🎓</div>
                         <div>
                            <p className="text-xs text-green-800 font-black uppercase tracking-tight">Status Saat Ini</p>
                            <p className="text-sm font-bold text-green-700">{selectedLaporan.status}</p>
                         </div>
                      </div>
                      {selectedLaporan.dokumen_laporan && (
                        <a 
                          href={selectedLaporan.dokumen_laporan}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-3 bg-white text-green-700 border border-green-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-green-100 transition-all shadow-sm"
                        >
                          📄 Lihat Laporan PDF
                        </a>
                      )}
                   </div>
                 )}
              </div>

              {selectedLaporan && (
                <form onSubmit={handleSubmit} className="bg-gray-900 p-8 rounded-[2.5rem] text-white shadow-xl space-y-6">
                   <h3 className="font-black text-lg">Input Penilaian</h3>
                   <div className="space-y-4">
                      <div className="space-y-1">
                         <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nilai Akhir (0-100)</label>
                         <input 
                           type="number" min="0" max="100" required placeholder="Contoh: 85"
                           className="w-full p-3.5 bg-white/10 border border-white/10 rounded-2xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                           value={formData.nilai}
                           onChange={(e) => setFormData({ ...formData, nilai: e.target.value })}
                         />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Keputusan</label>
                         <select 
                           required
                           className="w-full p-3.5 bg-white/10 border border-white/10 rounded-2xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                           value={formData.status}
                           onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                         >
                           <option value="GRADED" className="text-gray-900">Selesai & Beri Nilai</option>
                           <option value="REVISION" className="text-gray-900">Tolak & Minta Revisi</option>
                         </select>
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Catatan / Feedback</label>
                         <textarea 
                           rows="4" placeholder="Berikan evaluasi Anda..."
                           className="w-full p-3.5 bg-white/10 border border-white/10 rounded-2xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                           value={formData.catatan}
                           onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                         ></textarea>
                      </div>
                   </div>
                   <button 
                     type="submit" 
                     disabled={isSubmitting}
                     className="w-full py-4 bg-green-500 text-gray-900 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-green-400 transition-all shadow-lg shadow-green-500/20 active:scale-95"
                   >
                     {isSubmitting ? 'Menyimpan...' : 'Simpan Penilaian'}
                   </button>
                </form>
              )}
           </div>

           {/* Right: Logbook Review */}
           <div className="lg:col-span-2">
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                 <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                    <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Tinjauan Logbook Mahasiswa</h3>
                    {selectedLaporan && (
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold">{logbooks.length} Entri</span>
                    )}
                 </div>

                 {!selectedLaporan ? (
                   <div className="flex flex-col items-center justify-center py-24 text-gray-400 space-y-4">
                      <div className="text-6xl grayscale opacity-20">📖</div>
                      <p className="font-bold text-sm italic">Pilih mahasiswa untuk meninjau riwayat logbook.</p>
                   </div>
                 ) : isFetchingLogbook ? (
                   <div className="p-10">
                      <TableSkeleton />
                   </div>
                 ) : (
                   <div className="divide-y divide-gray-50">
                      {logbooks.length > 0 ? (
                        logbooks.map((entry) => (
                          <div key={entry.logbook_id} className="p-6 hover:bg-gray-50/50 transition-all group">
                             <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                      {new Date(entry.tanggal_log).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                   </span>
                                   <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-[9px] font-black uppercase border border-green-100">{entry.jenis_kegiatan}</span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl group-hover:bg-white border border-transparent group-hover:border-gray-100 transition-all">
                                   <p className="text-sm text-gray-700 leading-relaxed font-medium">{entry.keterangan || 'Tidak ada keterangan.'}</p>
                                </div>
                                {entry.file_dokumentasi && (
                                  <a 
                                    href={entry.file_dokumentasi} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-[10px] text-blue-600 font-black uppercase tracking-widest hover:underline"
                                  >
                                    📁 Lihat Dokumentasi
                                  </a>
                                )}
                             </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-20 text-center text-gray-400 text-sm font-bold italic">Belum ada entri logbook yang diisi.</div>
                      )}
                   </div>
                 )}
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
