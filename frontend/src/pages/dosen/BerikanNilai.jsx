import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { TableSkeleton } from '../../components/Skeleton';
import FilePreviewModal from '../../components/FilePreviewModal';

export default function BerikanNilai() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mahasiswaList, setMahasiswaList] = useState([]);
  const [selectedLaporan, setSelectedLaporan] = useState(null);
  const [logbooks, setLogbooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsLoadingSubmit] = useState(false);
  const [isFetchingLogbook, setIsFetchingLogbook] = useState(false);
  
  // Preview State
  const [previewData, setPreviewData] = useState({ isOpen: false, url: '', title: '' });

  const [formData, setFormData] = useState({
    nilai: '',
    status: 'GRADED',
    catatan: ''
  });

  const fetchMahasiswa = async () => {
    try {
      const response = await api.get(`/laporan/dosen/${user.user_id}`);
      // Filter: Hanya mahasiswa yang sudah submit laporan (status PENDING atau sudah dinilai untuk revisi)
      // Kita tampilkan semua agar dosen bisa melihat riwayat yang sudah diberi nilai juga
      setMahasiswaList(response.data);
    } catch (err) {
      console.error('Gagal memuat daftar mahasiswa:', err);
      toast.error('Gagal memuat daftar mahasiswa.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMahasiswa();
  }, [user.user_id]);

  const handleSelectMahasiswa = async (laporan) => {
    if (!laporan) {
      setSelectedLaporan(null);
      setLogbooks([]);
      return;
    }

    setSelectedLaporan(laporan);
    setFormData({
      nilai: laporan.nilai || '',
      status: laporan.status === 'REVISION' ? 'REVISION' : 'GRADED',
      catatan: laporan.catatan || ''
    });

    setIsFetchingLogbook(true);
    try {
      const response = await api.get(`/logbook/laporan/${laporan.laporan_id}`);
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
      // Jika pilih REVISION, gunakan endpoint revisi-dosen
      let endpoint = `/laporan/${selectedLaporan.laporan_id}/nilai`;
      let payload = {
        nilai: parseInt(formData.nilai),
        status: formData.status,
        catatan: formData.catatan
      };

      if (formData.status === 'REVISION') {
        endpoint = `/laporan/${selectedLaporan.laporan_id}/revisi-dosen`;
        payload = {
            catatan: formData.catatan,
            status: 'REVISION'
        };
      }

      await api.patch(endpoint, payload);
      
      toast.success("Penilaian berhasil disimpan!", { id: loadingToast });
      fetchMahasiswa(); // Refresh list
      // Tetap di halaman tapi reset selection atau biarkan terpilih
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Gagal menyimpan penilaian.';
      toast.error(errorMsg, { id: loadingToast });
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  return (
    <div className="pb-20">
      <main className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
           <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Penilaian & Tinjauan Laporan 🎓</h2>
              <p className="text-sm text-gray-500 font-medium">Tinjau progres dan berikan evaluasi akhir kepada mahasiswa bimbingan.</p>
           </div>
           <button 
             onClick={() => navigate('/dosen/dashboard')} 
             className="px-6 py-2.5 bg-gray-50 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-100 transition-all border border-gray-100"
           >
             Kembali ke Dashboard
           </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Left: Student List */}
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col h-[700px]">
                 <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 px-2">Daftar Mahasiswa Bimbingan</h3>
                 
                 {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                 ) : (
                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {mahasiswaList.length > 0 ? (
                            mahasiswaList.map((laporan) => (
                                <div 
                                    key={laporan.laporan_id}
                                    onClick={() => handleSelectMahasiswa(laporan)}
                                    className={`p-4 rounded-3xl border transition-all cursor-pointer group ${
                                        selectedLaporan?.laporan_id === laporan.laporan_id 
                                        ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-200' 
                                        : 'bg-gray-50 border-gray-50 hover:border-indigo-200 hover:bg-white'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-lg shadow-sm">
                                            {laporan.status === 'GRADED' ? '✅' : '📝'}
                                        </div>
                                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${
                                            selectedLaporan?.laporan_id === laporan.laporan_id
                                            ? 'bg-white/20 text-white'
                                            : laporan.status === 'GRADED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            {laporan.status === 'GRADED' ? `Nilai: ${laporan.nilai}` : laporan.status}
                                        </span>
                                    </div>
                                    <h4 className={`text-sm font-bold truncate ${selectedLaporan?.laporan_id === laporan.laporan_id ? 'text-white' : 'text-gray-800'}`}>
                                        {laporan.mahasiswa?.nama || 'Tanpa Nama'}
                                    </h4>
                                    <p className={`text-[10px] font-medium ${selectedLaporan?.laporan_id === laporan.laporan_id ? 'text-indigo-100' : 'text-gray-500'}`}>
                                        {laporan.mahasiswa?.nim || '-'} • {laporan.lowongan?.perusahaan || 'Program Magang'}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-xs font-bold text-gray-400">Belum ada mahasiswa bimbingan.</p>
                            </div>
                        )}
                    </div>
                 )}
              </div>
           </div>

           {/* Right: Detail & Form */}
           <div className="lg:col-span-8 space-y-8">
              {!selectedLaporan ? (
                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center py-40 text-gray-400 space-y-4">
                    <div className="text-8xl grayscale opacity-10">👈</div>
                    <p className="font-bold text-lg">Pilih mahasiswa di daftar kiri untuk memulai penilaian.</p>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Header Info Mahasiswa */}
                    <div className="bg-gray-900 p-8 rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center text-3xl font-black shadow-xl">
                                {selectedLaporan.mahasiswa?.nama?.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-2xl font-black tracking-tight">{selectedLaporan.mahasiswa?.nama}</h3>
                                <p className="text-indigo-300 font-bold text-sm uppercase tracking-widest">{selectedLaporan.mahasiswa?.nim}</p>
                                <p className="text-gray-400 text-xs mt-1 font-medium">{selectedLaporan.mahasiswa?.prodi} • {selectedLaporan.mahasiswa?.fakultas}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Program Magang</p>
                            <p className="text-right font-bold text-indigo-400">{selectedLaporan.lowongan?.judul_posisi}</p>
                            <p className="text-right text-xs text-gray-400">{selectedLaporan.lowongan?.perusahaan}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Logbook Section */}
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col h-[500px]">
                            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                                <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Riwayat Logbook</h3>
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold">{logbooks.length} Entri</span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                                {isFetchingLogbook ? (
                                    <div className="space-y-4">
                                        {[1,2,3].map(n => <div key={n} className="h-20 bg-gray-50 rounded-2xl animate-pulse" />)}
                                    </div>
                                ) : logbooks.length > 0 ? (
                                    logbooks.map((entry) => (
                                        <div key={entry.logbook_id} className="p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[9px] font-black text-gray-400 uppercase">
                                                    {new Date(entry.tanggal_log).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                </span>
                                                <span className="px-2 py-0.5 bg-white text-indigo-600 rounded text-[8px] font-black uppercase shadow-sm">{entry.jenis_kegiatan}</span>
                                            </div>
                                            <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">{entry.keterangan || 'Tidak ada keterangan.'}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-20 text-gray-400 text-xs font-bold italic">Belum ada logbook.</div>
                                )}
                            </div>
                        </div>

                        {/* Grade Form Section */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8 flex flex-col">
                            <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Evaluasi & Penilaian</h3>
                            
                            {selectedLaporan.dokumen_laporan ? (
                                <button 
                                    onClick={() => setPreviewData({ 
                                        isOpen: true, 
                                        url: selectedLaporan.dokumen_laporan, 
                                        title: `Laporan: ${selectedLaporan.mahasiswa?.nama}` 
                                    })}
                                    className="p-5 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center justify-between group hover:bg-indigo-600 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl group-hover:scale-110 transition-transform">📄</span>
                                        <div className="text-left">
                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest group-hover:text-indigo-200">Berkas Laporan Akhir</p>
                                            <p className="text-sm font-bold text-indigo-900 group-hover:text-white">Lihat Dokumen PDF</p>
                                        </div>
                                    </div>
                                    <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all">↗</span>
                                </button>
                            ) : (
                                <div className="p-5 bg-amber-50 border border-amber-100 rounded-3xl text-center">
                                    <p className="text-xs font-bold text-amber-600">⚠️ Mahasiswa belum mengunggah laporan.</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col justify-end">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nilai (0-100)</label>
                                        <input 
                                            type="number" min="0" max="100" required placeholder="0"
                                            className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                            value={formData.nilai}
                                            onChange={(e) => setFormData({ ...formData, nilai: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Keputusan</label>
                                        <select 
                                            required
                                            className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="GRADED">Selesai (Graded)</option>
                                            <option value="REVISION">Minta Revisi</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Catatan Feedback</label>
                                    <textarea 
                                        rows="3" placeholder="Masukkan saran atau evaluasi..."
                                        className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        value={formData.catatan}
                                        onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                                    ></textarea>
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting || !selectedLaporan.dokumen_laporan}
                                    className="w-full py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                >
                                    {isSubmitting ? 'Menyimpan...' : 'Kirim Penilaian'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
              )}
           </div>
        </div>
      </main>

      <FilePreviewModal 
        isOpen={previewData.isOpen}
        fileUrl={previewData.url}
        title={previewData.title}
        onClose={() => setPreviewData({ ...previewData, isOpen: false })}
      />
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }
      `}</style>
    </div>
  );
}
