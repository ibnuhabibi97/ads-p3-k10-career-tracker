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
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Progres Magang & Laporan 📈</h2>
          <p className="text-sm text-gray-500 font-medium">Kelola logbook dan unggah laporan di sini.</p>
        </div>
        <div className="flex items-center gap-6">
           <button 
             onClick={() => navigate(`/mahasiswa/laporan/${currentLaporan.laporan_id}/logbook`)}
             className="px-6 py-3 bg-blue-50 text-blue-600 font-bold rounded-2xl text-xs hover:bg-blue-100 transition-all"
           >
             Kelola Logbook Lengkap 📓
           </button>
           <div className="text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
              <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase border border-blue-100">
                {currentLaporan.status}
              </span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
            <h3 className="font-black text-gray-800 mb-6">Logbook Terbaru</h3>
            <div className="space-y-4">
                {logbooks.slice(0, 5).map(log => (
                    <div key={log.logbook_id} className="p-4 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 border border-gray-100">
                        {new Date(log.tanggal_log).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })} - {log.keterangan || 'Log kosong'}
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-gray-900 rounded-[3rem] p-10 text-white space-y-8">
           <h3 className="text-2xl font-black">Finalisasi</h3>
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
