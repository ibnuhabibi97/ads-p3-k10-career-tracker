import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { TableSkeleton } from '../../components/Skeleton';
import FilePreviewModal from '../../components/FilePreviewModal';

export default function SuratRekomendasi() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState({}); // mapping surat_id -> file
  
  // Preview State
  const [previewData, setPreviewData] = useState({ isOpen: false, url: '', title: '' });

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/surat-rekomendasi/dosen/tinjauan');
      setRequests(response.data);
    } catch (err) {
      console.error('Gagal memuat permintaan surat:', err);
      toast.error('Gagal memuat daftar permintaan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, status) => {
    const file = selectedFile[id];
    
    if (status === 'APPROVED' && !file) {
      toast.error("Silakan pilih file surat bertanda tangan terlebih dahulu!");
      return;
    }

    const loadingToast = toast.loading('Memproses surat...');
    const formData = new FormData();
    formData.append('status', status);
    if (file) {
      formData.append('file_signed', file);
    }

    try {
      const response = await api.patch(`/surat-rekomendasi/${id}/proses`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.status === 200) {
        toast.success(`Surat berhasil ${status === 'APPROVED' ? 'disetujui' : 'ditolak'}`, { id: loadingToast });
        fetchRequests();
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Gagal memproses surat.", { id: loadingToast });
    }
  };

  const handleFileChange = (id, file) => {
    setSelectedFile({ ...selectedFile, [id]: file });
  };

  return (
    <div className="pb-12">
      <main className="max-w-5xl mx-auto mt-8 space-y-6">
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 p-10 space-y-8">
          <div className="flex justify-between items-center border-b border-gray-50 pb-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Tinjauan Surat Rekomendasi ✉️</h2>
              <p className="text-sm text-gray-400 font-medium">Tinjau draft dan unggah surat bertanda tangan untuk mahasiswa.</p>
            </div>
            <button 
              onClick={() => navigate(-1)} 
              className="px-6 py-2.5 bg-gray-50 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-100 transition-all"
            >
              Kembali
            </button>
          </div>

          <div className="space-y-6">
            {isLoading ? (
              <TableSkeleton />
            ) : requests.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {requests.map((req) => (
                  <div key={req.surat_id} className="bg-white border border-gray-100 rounded-[2rem] p-8 flex flex-col md:flex-row justify-between items-center gap-8 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-6 flex-1">
                       <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black group-hover:bg-blue-600 group-hover:text-white transition-all">
                          {req.mahasiswa?.nama?.charAt(0) || 'M'}
                       </div>
                       <div className="space-y-1">
                          <h4 className="font-black text-gray-800 text-lg">{req.mahasiswa?.nama || 'Mahasiswa'}</h4>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Diajukan pada {new Date(req.tanggal_pengajuan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          <div className="pt-2">
                             <button 
                               onClick={() => setPreviewData({ 
                                 isOpen: true, 
                                 url: req.dokumen_surat, 
                                 title: `Draft Surat: ${req.mahasiswa?.nama}` 
                               })}
                               className="text-xs text-blue-600 font-black uppercase tracking-widest hover:underline flex items-center gap-2"
                             >
                               📄 Preview Draft Surat
                             </button>
                          </div>
                       </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6">
                       <div className="text-right">
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                            req.status_surat === 'APPROVED' ? 'bg-green-50 text-green-600 border-green-100' :
                            req.status_surat === 'DECLINED' ? 'bg-red-50 text-red-600 border-red-100' :
                            'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                            {req.status_surat}
                          </span>
                       </div>

                       {/* Action Controls */}
                       {req.status_surat === 'PENDING' && (
                         <div className="flex flex-col gap-3 min-w-[240px]">
                            <div className="relative group/file">
                               <div className={`border-2 border-dashed rounded-xl p-3 flex items-center justify-center gap-3 transition-all ${
                                 selectedFile[req.surat_id] ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'
                               }`}>
                                  <input 
                                    type="file" 
                                    accept=".pdf" 
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => handleFileChange(req.surat_id, e.target.files[0])}
                                  />
                                  <span className="text-xl">{selectedFile[req.surat_id] ? '✅' : '🖋️'}</span>
                                  <p className="text-[9px] font-bold text-gray-500 uppercase truncate max-w-[150px]">
                                    {selectedFile[req.surat_id] ? selectedFile[req.surat_id].name : 'Upload TTD (PDF)'}
                                  </p>
                               </div>
                            </div>
                            <div className="flex gap-2">
                               <button 
                                 onClick={() => handleAction(req.surat_id, 'APPROVED')}
                                 className="flex-1 py-2.5 bg-green-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all"
                               >
                                 Setujui
                               </button>
                               <button 
                                 onClick={() => handleAction(req.surat_id, 'DECLINED')}
                                 className="flex-1 py-2.5 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-100 transition-all"
                               >
                                 Tolak
                               </button>
                            </div>
                         </div>
                       )}

                       {req.status_surat === 'APPROVED' && (
                         <button 
                           onClick={() => setPreviewData({ 
                             isOpen: true, 
                             url: req.dokumen_surat, 
                             title: `Surat APPROVED: ${req.mahasiswa?.nama}` 
                           })}
                           className="p-4 bg-green-50 text-green-600 hover:bg-green-100 rounded-2xl transition-all flex items-center gap-2 text-xs font-black uppercase"
                         >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Preview TTD
                         </button>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                <div className="text-6xl mb-4 grayscale opacity-20">📂</div>
                <p className="text-gray-400 font-bold italic">Belum ada permintaan surat rekomendasi yang perlu ditinjau.</p>
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
    </div>
  );
}
