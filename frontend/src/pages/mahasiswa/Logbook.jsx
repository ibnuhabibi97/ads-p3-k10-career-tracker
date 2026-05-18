import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { TableSkeleton } from '../../components/Skeleton';

export default function Logbook() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [laporan, setLaporan] = useState(null);
  const [logs, setLogs] = useState([]);
  const [formData, setFormData] = useState({
    waktu_mulai: '',
    waktu_selesai: '',
    jenis_kegiatan: '',
    keterangan: '',
    media: '',
    file_dokumentasi: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const fetchLaporanAndLogs = async () => {
    setIsFetching(true);
    try {
      // 1. Ambil data laporan mahasiswa untuk mendapatkan laporan_id dan dosen_id
      const laporanRes = await api.get(`/laporan/mahasiswa/${user.user_id}`);
      if (laporanRes.data.length > 0) {
        const activeLaporan = laporanRes.data[0]; 
        setLaporan(activeLaporan);
        
        // 2. Ambil logbook berdasarkan laporan_id tersebut
        const logsRes = await api.get(`/logbook/laporan/${activeLaporan.laporan_id}`);
        setLogs(logsRes.data);
      }
    } catch (err) {
      console.error('Gagal memuat data logbook:', err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchLaporanAndLogs();
  }, [user.user_id]);

  const handleSaveEntry = async (e) => {
    e.preventDefault();
    
    if (!laporan) {
      toast.error('Anda belum memiliki laporan magang aktif.');
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Menyimpan entri...');

    const data = new FormData();
    data.append('laporan_id', laporan.laporan_id);
    data.append('dosen_id', laporan.dosen_id); // Gunakan field yang benar dari model backend
    data.append('waktu_mulai', formData.waktu_mulai);
    data.append('waktu_selesai', formData.waktu_selesai);
    data.append('jenis_kegiatan', formData.jenis_kegiatan);
    data.append('keterangan', formData.keterangan);
    data.append('media', formData.media || '');
    
    if (formData.file_dokumentasi) {
      data.append('file_dokumentasi', formData.file_dokumentasi);
    }

    try {
      const response = await api.post('/logbook/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.status === 201) {
        toast.success("Aktivitas harian berhasil dicatat!", { id: loadingToast });
        setFormData({
          waktu_mulai: '',
          waktu_selesai: '',
          jenis_kegiatan: '',
          keterangan: '',
          media: '',
          file_dokumentasi: null
        });
        fetchLaporanAndLogs();
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Gagal menyimpan entri.', { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <TableSkeleton />;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Logbook Aktivitas 📓</h2>
          <p className="text-sm text-gray-500 font-medium">Dokumentasikan progres pengerjaan magang harian Anda.</p>
        </div>
        {!laporan && (
          <div className="px-4 py-2 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl border border-amber-100 animate-pulse">
            ⚠️ Belum Memiliki Laporan Aktif
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 sticky top-24">
            <h3 className="text-lg font-black text-gray-800 mb-6 uppercase tracking-wider text-xs">Tambah Aktivitas</h3>
            <form onSubmit={handleSaveEntry} className="space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Waktu Mulai</label>
                  <input 
                    type="datetime-local" required
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    value={formData.waktu_mulai}
                    onChange={(e) => setFormData({ ...formData, waktu_mulai: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Waktu Selesai</label>
                  <input 
                    type="datetime-local" required
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    value={formData.waktu_selesai}
                    onChange={(e) => setFormData({ ...formData, waktu_selesai: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Kategori Kegiatan</label>
                <select 
                  required
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                  value={formData.jenis_kegiatan}
                  onChange={(e) => setFormData({ ...formData, jenis_kegiatan: e.target.value })}
                >
                  <option value="">Pilih Kategori...</option>
                  <option value="Teknis">Implementasi Teknis</option>
                  <option value="Administrasi">Pekerjaan Administrasi</option>
                  <option value="Koordinasi">Rapat & Koordinasi</option>
                  <option value="Riset">Riset & Analisis</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Deskripsi Singkat</label>
                <textarea 
                  rows="4" required placeholder="Apa yang Anda selesaikan hari ini?"
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                ></textarea>
              </div>

              <div className="relative group">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Dokumentasi (PDF/Image)</label>
                <div className="border-2 border-dashed border-gray-100 rounded-xl p-4 flex items-center justify-center bg-gray-50 hover:border-blue-400 transition-all cursor-pointer relative overflow-hidden">
                  <input 
                    type="file" accept="image/*,.pdf"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    onChange={(e) => setFormData({ ...formData, file_dokumentasi: e.target.files[0] })}
                  />
                  <p className="text-[10px] font-bold text-blue-600 truncate px-2">
                    {formData.file_dokumentasi ? formData.file_dokumentasi.name : 'Pilih File...'}
                  </p>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading || !laporan}
                className={`w-full py-4 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 ${
                  (isLoading || !laporan) ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'
                }`}
              >
                💾 Simpan Aktivitas
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: List Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
             <span className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-sm">🕒</span>
             Riwayat Aktivitas Terakhir
          </h3>
          
          <div className="relative border-l-2 border-gray-100 ml-4 pl-8 space-y-8 py-4">
            {logs.length > 0 ? (
              logs.map((log) => (
                <div key={log.logbook_id} className="relative">
                  <div className="absolute -left-[2.6rem] top-0 w-8 h-8 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center text-[10px] z-10 shadow-sm">
                    ✅
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                      <div>
                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest mb-2 border border-blue-100">
                          {log.jenis_kegiatan}
                        </span>
                        <h4 className="font-black text-gray-800 text-lg leading-none">
                          {new Date(log.waktu_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </h4>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Durasi Kerja</p>
                        <p className="text-xs font-bold text-gray-600 px-3 py-1 bg-gray-50 rounded-lg">
                          {new Date(log.waktu_mulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {new Date(log.waktu_selesai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">{log.keterangan}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div className="flex gap-4">
                        {log.media && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase">
                            <span>📱 Media:</span>
                            <span className="text-gray-600">{log.media}</span>
                          </div>
                        )}
                        {log.dokumentasi && (
                          <a 
                            href={log.dokumentasi} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase hover:underline"
                          >
                            📄 Dokumentasi
                          </a>
                        )}
                      </div>
                      <button className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-50 rounded-[2rem] p-12 border border-dashed border-gray-200 text-center">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Belum ada aktivitas tercatat.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
