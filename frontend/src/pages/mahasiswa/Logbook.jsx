import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

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
  const [error, setError] = useState('');

  const fetchLaporanAndLogs = async () => {
    try {
      // 1. Ambil data laporan mahasiswa untuk mendapatkan laporan_id dan dosen_id
      const laporanRes = await api.get(`/laporan/mahasiswa/${user.user_id}`);
      if (laporanRes.data.length > 0) {
        const activeLaporan = laporanRes.data[0]; // Ambil yang pertama/terbaru
        setLaporan(activeLaporan);
        
        // 2. Ambil logbook berdasarkan laporan_id tersebut
        const logsRes = await api.get(`/logbook/laporan/${activeLaporan.laporan_id}`);
        setLogs(logsRes.data);
      }
    } catch (err) {
      console.error('Gagal memuat data logbook:', err);
    }
  };

  useEffect(() => {
    fetchLaporanAndLogs();
  }, [user.user_id]);

  const handleSaveEntry = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!laporan) {
      setError('Anda belum memiliki laporan magang aktif. Pastikan status pendaftaran Anda sudah diterima.');
      return;
    }

    setIsLoading(true);

    const data = new FormData();
    data.append('laporan_id', laporan.laporan_id);
    data.append('dosen_id', laporan.dosen_pembimbing);
    data.append('waktu_mulai', formData.waktu_mulai);
    data.append('waktu_selesai', formData.waktu_selesai);
    data.append('jenis_kegiatan', formData.jenis_kegiatan);
    data.append('keterangan', formData.keterangan);
    data.append('media', formData.media);
    if (formData.file_dokumentasi) {
      data.append('file_dokumentasi', formData.file_dokumentasi);
    }

    try {
      const response = await api.post('/logbook/', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.status === 201) {
        alert("Entry logbook berhasil disimpan!");
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
      setError(err.response?.data?.detail || 'Gagal menyimpan entry logbook.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header 
        title="Logbook Magang" 
        userName={user?.nama} 
        userDetail={`NIM. ${user?.nim}`} 
        bgColor="bg-blue-600" 
      />

      <main className="max-w-4xl mx-auto px-6 mt-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-8">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <h2 className="text-xl font-bold text-gray-900">Aktivitas Harian</h2>
            <button 
              onClick={() => navigate(-1)} 
              className="px-4 py-1.5 bg-gray-50 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Kembali
            </button>
          </div>

          {!laporan && (
            <div className="p-4 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl text-sm font-medium">
              ⚠️ Anda belum dapat mengisi logbook karena belum memiliki laporan magang aktif.
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center">
              {error}
            </div>
          )}

          {/* Form Tambah Entry Baru */}
          <form onSubmit={handleSaveEntry} className="space-y-6 bg-gray-50/50 border border-gray-100 p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-2">Tambah Entry Baru</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Waktu Mulai</label>
                <input 
                  type="datetime-local" required
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                  value={formData.waktu_mulai}
                  onChange={(e) => setFormData({ ...formData, waktu_mulai: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Waktu Selesai</label>
                <input 
                  type="datetime-local" required
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                  value={formData.waktu_selesai}
                  onChange={(e) => setFormData({ ...formData, waktu_selesai: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Jenis Kegiatan</label>
                <select 
                  required
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                  value={formData.jenis_kegiatan}
                  onChange={(e) => setFormData({ ...formData, jenis_kegiatan: e.target.value })}
                >
                  <option value="">Pilih jenis...</option>
                  <option value="Teknis">Teknis</option>
                  <option value="Administrasi">Administrasi</option>
                  <option value="Koordinasi">Koordinasi</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Media (Opsional)</label>
                <input 
                  type="text" placeholder="Misal: Zoom, On-site, Jira"
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                  value={formData.media}
                  onChange={(e) => setFormData({ ...formData, media: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Deskripsi Aktivitas</label>
              <textarea 
                rows="3" required placeholder="Jelaskan secara detail apa yang Anda kerjakan..."
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              ></textarea>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Dokumentasi (Foto/File)</label>
              <input 
                type="file"
                accept="image/*,.pdf"
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
                onChange={(e) => setFormData({ ...formData, file_dokumentasi: e.target.files[0] })}
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading || !laporan}
              className={`px-6 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-100 flex items-center gap-2 ${
                (isLoading || !laporan) ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              Simpan Entry Logbook
            </button>
          </form>

          {/* Riwayat Logbook */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-2">Riwayat Logbook</h3>
            <div className="space-y-3">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <div key={log.logbook_id} className="p-5 border border-gray-100 rounded-2xl bg-white hover:shadow-sm transition-shadow space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase mb-1">
                          {log.jenis_kegiatan}
                        </span>
                        <h4 className="font-bold text-gray-800 text-sm">
                          {new Date(log.waktu_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </h4>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {new Date(log.waktu_mulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {new Date(log.waktu_selesai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs leading-relaxed">{log.keterangan}</p>
                    {log.dokumentasi && (
                      <a 
                        href={log.dokumentasi} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-blue-600 font-bold hover:underline"
                      >
                        📎 Lihat Dokumentasi
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-400 text-xs">Belum ada riwayat aktivitas.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
