import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function LaporanAkhir() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentLaporan, setCurrentLaporan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCurrentLaporan = async () => {
    try {
      const response = await api.get(`/laporan/mahasiswa/${user.user_id}`);
      if (response.data.length > 0) {
        setCurrentLaporan(response.data[0]);
      }
    } catch (err) {
      console.error('Gagal memuat status laporan:', err);
    }
  };

  useEffect(() => {
    fetchCurrentLaporan();
  }, [user.user_id]);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Silakan pilih file terlebih dahulu!");
      return;
    }

    setIsLoading(true);
    setError('');

    const data = new FormData();
    data.append('file', selectedFile);

    try {
      const response = await api.post('/laporan/', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.status === 201) {
        alert("Laporan akhir berhasil diunggah!");
        setSelectedFile(null);
        fetchCurrentLaporan();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal mengunggah laporan.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      'PENDING': { label: 'Menunggu Penilaian', class: 'bg-amber-100 text-amber-700 border-amber-200' },
      'GRADED': { label: 'Sudah Dinilai', class: 'bg-green-100 text-green-700 border-green-200' },
      'REJECTED': { label: 'Perlu Revisi', class: 'bg-red-100 text-red-700 border-red-200' },
    };
    const style = map[status] || { label: status, class: 'bg-gray-100 text-gray-700' };
    return <span className={`px-3 py-1 rounded-full text-xs font-bold border ${style.class}`}>{style.label}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header 
        title="Laporan Akhir" 
        userName={user?.nama} 
        userDetail={`NIM. ${user?.nim}`} 
        bgColor="bg-blue-600" 
      />

      <main className="max-w-4xl mx-auto px-6 mt-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-8">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <h2 className="text-xl font-bold text-gray-900">Progres Laporan</h2>
            <button 
              onClick={() => navigate(-1)} 
              className="px-4 py-1.5 bg-gray-50 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Kembali
            </button>
          </div>

          {currentLaporan ? (
            <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase">Status Laporan Terkini</p>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-gray-800">Laporan Akhir Magang</h3>
                  {getStatusBadge(currentLaporan.status_laporan)}
                </div>
                <p className="text-xs text-gray-500">
                  Diunggah pada: {new Date(currentLaporan.tanggal_submit).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href={currentLaporan.dokumen_laporan} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                >
                  📄 Lihat File
                </a>
                {currentLaporan.status_laporan === 'REJECTED' && (
                  <button 
                    onClick={() => setCurrentLaporan(null)}
                    className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Upload Ulang
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Container Kotak Upload Dashed */
            <div className="border-2 border-dashed border-gray-200 rounded-3xl p-12 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-all group">
              <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">📤</span>
              <p className="text-lg font-bold text-gray-800 mb-1">Unggah Laporan Akhir</p>
              <p className="text-sm text-gray-400 mb-6">Format PDF (Maks 10MB)</p>
              
              <label className="px-8 py-3 bg-blue-600 text-white text-sm font-bold rounded-2xl cursor-pointer hover:bg-blue-700 transition-colors shadow-md shadow-blue-100">
                {selectedFile ? 'Ganti File' : 'Pilih File PDF'}
                <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
              </label>

              {selectedFile && (
                <div className="mt-6 text-center animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-sm font-semibold text-green-600 mb-3">📄 {selectedFile.name}</p>
                  <button 
                    onClick={handleUpload}
                    disabled={isLoading}
                    className={`px-6 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-colors shadow-lg flex items-center gap-2 ${
                      isLoading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading && (
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    Mulai Unggah Laporan
                  </button>
                </div>
              )}
            </div>
          )}

          {currentLaporan?.catatan_revisi && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
              <h4 className="text-sm font-bold text-red-800 mb-2">Catatan Revisi dari Dosen:</h4>
              <p className="text-sm text-red-700 leading-relaxed italic">"{currentLaporan.catatan_revisi}"</p>
            </div>
          )}

          {currentLaporan?.nilai !== null && (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-6 flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-green-800">Nilai Akhir Magang:</h4>
                <p className="text-xs text-green-600">Diberikan oleh Dosen Pembimbing</p>
              </div>
              <div className="text-3xl font-black text-green-700">{currentLaporan.nilai}</div>
            </div>
          )}

          {/* Banner Peringatan Bawah */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-start gap-3">
            <span className="text-amber-600 text-xl mt-0.5">⚠️</span>
            <p className="text-xs text-amber-800 font-medium leading-relaxed">
              <span className="font-bold block mb-1 text-sm">Penting!</span>
              Pastikan laporan sudah disetujui pembimbing sebelum upload. Laporan yang sudah diunggah akan langsung divalidasi oleh pihak staff akademik. File yang sudah diunggah tidak dapat dihapus kecuali status laporan adalah "Perlu Revisi".
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
