import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { DashboardSkeleton } from '../../components/Skeleton';

export default function LaporanAkhir() {
  const { user } = useAuth();
  const [currentLaporan, setCurrentLaporan] = useState(null);
  const [logbooks, setLogbooks] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [editingLogbook, setEditingLogbook] = useState(null);

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const response = await api.get(`/laporan/mahasiswa/${user.user_id}`);
      if (response.data.length > 0) {
        const laporan = response.data.find(l => l.status === 'ONGOING') || response.data[0];
        setCurrentLaporan(laporan);
        setLogbooks(laporan.logbooks || []);
      } else {
        setCurrentLaporan(null);
      }
    } catch (err) {
      console.error('Gagal memuat data:', err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.user_id]);

  const handleSaveLogbook = async (logbookId, data) => {
    const loadingToast = toast.loading('Menyimpan logbook...');
    try {
      await api.put(`/logbook/${logbookId}`, data);
      toast.success('Logbook berhasil disimpan', { id: loadingToast });
      setEditingLogbook(null);
      fetchData();
    } catch (err) {
      toast.error('Gagal menyimpan logbook', { id: loadingToast });
    }
  };

  const handleFinalSubmit = async () => {
    if (!selectedFile && !currentLaporan?.dokumen_laporan) {
      toast.error("Silakan unggah file laporan PDF terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Memfinalisasi laporan...');

    try {
      let docUrl = currentLaporan.dokumen_laporan;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const uploadRes = await api.post('/laporan/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        docUrl = uploadRes.data.dokumen_laporan;
      }

      await api.put(`/laporan/${currentLaporan.laporan_id}`, {
        dokumen_laporan: docUrl,
        status: 'PENDING'
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

  if (!currentLaporan) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-6">
        <div className="text-8xl">🏜️</div>
        <h2 className="text-2xl font-black text-gray-900">Belum Ada Program Magang Aktif</h2>
        <p className="text-gray-500 max-w-sm mx-auto">Anda perlu diterima di salah satu lowongan untuk memulai.</p>
        <button onClick={() => window.location.href='/mahasiswa/lowongan'} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl">Cari Lowongan</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-blue-900/5 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Progres Magang & Laporan 📈</h2>
          <p className="text-sm text-gray-500 font-medium">Isi logbook dan unggah laporan di sini.</p>
        </div>
        <div className="flex items-center gap-6">
           <div className="text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
              <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase border border-blue-100">
                {currentLaporan.status}
              </span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-black text-gray-800 px-4">Logbook Harian 📓</h3>
          <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
            {logbooks.map((log) => (
              <div key={log.logbook_id} className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                   <p className="text-sm font-black text-gray-900">{new Date(log.tanggal_log).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                   {currentLaporan.status === 'ONGOING' && (
                     <button onClick={() => setEditingLogbook(editingLogbook === log.logbook_id ? null : log.logbook_id)} className="text-[10px] font-black text-blue-600 uppercase">
                       {editingLogbook === log.logbook_id ? 'Batal' : 'Isi Log'}
                     </button>
                   )}
                </div>

                {editingLogbook === log.logbook_id ? (
                  <div className="space-y-4">
                    <textarea id={`desc-${log.logbook_id}`} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm" defaultValue={log.keterangan} />
                    <button onClick={() => handleSaveLogbook(log.logbook_id, {
                           keterangan: document.getElementById(`desc-${log.logbook_id}`).value,
                           jenis_kegiatan: 'Harian',
                           waktu_mulai: new Date().toISOString(),
                           waktu_selesai: new Date().toISOString(),
                         })} className="w-full bg-blue-600 text-white text-[10px] font-black py-3 rounded-xl">Simpan</button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">{log.keterangan || 'Belum ada aktivitas.'}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 rounded-[3rem] p-10 text-white space-y-8 h-fit">
           <h3 className="text-2xl font-black">Finalisasi 🚀</h3>
           <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-700 rounded-3xl p-8 text-center cursor-pointer relative">
                 <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setSelectedFile(e.target.files[0])} />
                 <p className="text-[10px] font-bold">{selectedFile ? selectedFile.name : 'Pilih File PDF'}</p>
              </div>
              <button onClick={handleFinalSubmit} className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl">Kirim Laporan</button>
           </div>
        </div>
      </div>
    </div>
  );
}
