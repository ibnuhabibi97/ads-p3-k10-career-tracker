import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function SuratRekomendasi() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState({}); // mapping surat_id -> file

  const fetchRequests = async () => {
    try {
      const response = await api.get('/surat-rekomendasi/dosen/tinjauan');
      setRequests(response.data);
    } catch (err) {
      console.error('Gagal memuat permintaan surat:', err);
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
      alert("Silakan pilih file surat bertanda tangan terlebih dahulu!");
      return;
    }

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
        alert(`Surat berhasil di-${status.toLowerCase()}`);
        fetchRequests();
      }
    } catch (err) {
      alert(err.response?.data?.detail || "Gagal memproses surat.");
    }
  };

  const handleFileChange = (id, file) => {
    setSelectedFile({ ...selectedFile, [id]: file });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header 
        title="Surat Rekomendasi" 
        userName={user?.nama} 
        userDetail={`NIP. ${user?.nip}`} 
        bgColor="bg-green-600" 
      />

      <main className="max-w-4xl mx-auto px-6 mt-8 space-y-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4 mb-2">
            <h2 className="text-xl font-bold text-gray-900">Tinjauan Surat Rekomendasi</h2>
            <button 
              onClick={() => navigate(-1)} 
              className="px-4 py-1.5 bg-gray-50 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Kembali
            </button>
          </div>

          <div className="space-y-6">
            {isLoading ? (
              <div className="text-center py-10 text-gray-400">Memuat data...</div>
            ) : requests.length > 0 ? (
              requests.map((req) => (
                <div key={req.rekomendasi_id} className="border border-gray-100 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start gap-6 bg-white hover:shadow-md transition-all">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-gray-800 text-base">{req.mahasiswa_nama}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase ${
                        req.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        req.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">NIM: {req.mahasiswa_nim}</p>
                    <p className="text-xs text-gray-400">Diajukan: {new Date(req.tanggal_pengajuan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    
                    <div className="pt-2">
                      <a href={req.dokumen_draft} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1">
                        Lihat Draft Surat dari Mahasiswa
                      </a>
                    </div>

                    {/* Form Upload Jika Masih Pending */}
                    {req.status === 'PENDING' && (
                      <div className="mt-4 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-3">
                        <label className="text-[10px] font-bold text-indigo-700 uppercase block">Upload Surat TTD (Wajib jika setuju)</label>
                        <input 
                          type="file" 
                          accept=".pdf"
                          className="text-[10px] text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                          onChange={(e) => handleFileChange(req.rekomendasi_id, e.target.files[0])}
                        />
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleAction(req.rekomendasi_id, 'APPROVED')}
                            className="flex-1 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 shadow-sm"
                          >
                            Setujui
                          </button>
                          <button 
                            onClick={() => handleAction(req.rekomendasi_id, 'REJECTED')}
                            className="flex-1 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 shadow-sm"
                          >
                            Tolak
                          </button>
                        </div>
                      </div>
                    )}

                    {req.status === 'APPROVED' && req.dokumen_final && (
                      <div className="pt-2">
                        <a href={req.dokumen_final} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 font-bold hover:underline flex items-center gap-1">
                          Lihat Surat Bertanda Tangan
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400 text-xs italic">Belum ada permintaan surat rekomendasi.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
