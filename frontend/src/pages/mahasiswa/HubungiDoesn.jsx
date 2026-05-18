import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function HubungiDosen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dosenList, setDosenList] = useState([]);
  const [history, setHistory] = useState([]);
  const [formData, setFormData] = useState({ dosen_id: '', file_draft: null });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const fetchData = async () => {
    try {
      const [dosenRes, historyRes] = await Promise.all([
        api.get('/users/dosen'),
        api.get('/surat-rekomendasi/mahasiswa/saya')
      ]);
      setDosenList(dosenRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      console.error('Gagal memuat data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.dosen_id || !formData.file_draft) {
      alert("Silakan pilih dosen dan unggah draf surat!");
      return;
    }

    setIsLoading(true);
    const data = new FormData();
    data.append('dosen_id', formData.dosen_id);
    data.append('file_draft', formData.file_draft);

    try {
      const response = await api.post('/surat-rekomendasi/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.status === 201) {
        alert("Permintaan surat rekomendasi berhasil dikirim!");
        setFormData({ dosen_id: '', file_draft: null });
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.detail || "Gagal mengirim permintaan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header 
        title="Surat Rekomendasi" 
        userName={user?.nama} 
        userDetail={`NIM. ${user?.nim}`} 
        bgColor="bg-blue-600" 
      />

      <main className="max-w-6xl mx-auto px-6 mt-6 space-y-6">
        <div className="flex justify-end">
          <button 
            onClick={() => navigate(-1)} 
            className="px-4 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            Kembali
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Form Request */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Ajukan Rekomendasi</h2>
              <p className="text-sm text-gray-500 mt-1">Pilih dosen dan unggah draf surat rekomendasi Anda (PDF).</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Pilih Dosen</label>
                <select 
                  required
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                  value={formData.dosen_id}
                  onChange={(e) => setFormData({ ...formData, dosen_id: e.target.value })}
                >
                  <option value="">Pilih dosen...</option>
                  {dosenList.map((d) => (
                    <option key={d.user_id} value={d.user_id}>{d.nama} ({d.nip || 'N/A'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Unggah Draf Surat (PDF)</label>
                <input 
                  type="file" 
                  required 
                  accept=".pdf"
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
                  onChange={(e) => setFormData({ ...formData, file_draft: e.target.files[0] })}
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-100 flex items-center justify-center gap-2 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading && (
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                Kirim Permintaan
              </button>
            </form>
          </div>

          {/* History Request */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Riwayat Pengajuan</h2>
            <div className="space-y-4">
              {isLoadingData ? (
                <p className="text-center text-gray-400 text-sm py-8">Memuat riwayat...</p>
              ) : history.length > 0 ? (
                history.map((item) => (
                  <div key={item.rekomendasi_id} className="p-4 border border-gray-100 rounded-xl bg-gray-50/30 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-gray-800">{item.dosen_nama}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{new Date(item.tanggal_pengajuan).toLocaleDateString('id-ID')}</p>
                      <div className="mt-2 flex gap-2">
                        <a href={item.dokumen_draft} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 font-bold hover:underline">Draft</a>
                        {item.dokumen_final && (
                          <a href={item.dokumen_final} target="_blank" rel="noopener noreferrer" className="text-[10px] text-green-600 font-bold hover:underline">Surat TTD</a>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      item.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      item.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 text-sm py-8 italic">Belum ada riwayat pengajuan.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
