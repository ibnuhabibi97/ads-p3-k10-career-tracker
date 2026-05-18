import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function DaftarMagang() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lowonganList, setLowonganList] = useState([]);
  const [formData, setFormData] = useState({
    lowongan_id: '',
    file_cv: null,
    file_rekomendasi: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLowongan = async () => {
      try {
        const response = await api.get('/lowongan/aktif');
        setLowonganList(response.data);
      } catch (err) {
        console.error('Gagal memuat lowongan:', err);
      }
    };
    fetchLowongan();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.lowongan_id || !formData.file_cv || !formData.file_rekomendasi) {
      setError('Semua field dan file wajib diisi.');
      return;
    }

    setIsLoading(true);

    const data = new FormData();
    data.append('lowongan_id', formData.lowongan_id);
    data.append('file_cv', formData.file_cv);
    data.append('file_rekomendasi', formData.file_rekomendasi);

    try {
      const response = await api.post('/pendaftaran/', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.status === 201) {
        alert("Pendaftaran magang Anda berhasil dikirim!");
        navigate('/mahasiswa/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal mengirim pendaftaran.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header 
        title="Pendaftaran Magang" 
        userName={user?.nama} 
        userDetail={`NIM. ${user?.nim}`} 
        bgColor="bg-blue-600" 
      />

      <main className="max-w-xl mx-auto px-6 mt-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <h2 className="text-xl font-bold text-gray-900">Form Pendaftaran</h2>
            <button 
              onClick={() => navigate(-1)} 
              className="px-4 py-1.5 bg-gray-50 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Batal
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Pilihan Lowongan */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Pilih Lowongan Perusahaan</label>
              <select 
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                value={formData.lowongan_id}
                onChange={(e) => setFormData({ ...formData, lowongan_id: e.target.value })}
              >
                <option value="">Pilih lowongan...</option>
                {lowonganList.map((job) => (
                  <option key={job.lowongan_id} value={job.lowongan_id}>
                    {job.judul_posisi} - {job.perusahaan}
                  </option>
                ))}
              </select>
            </div>

            {/* Input CV */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">File CV (PDF)</label>
              <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-blue-400 transition-colors bg-gray-50/50">
                <input 
                  type="file" 
                  required 
                  accept=".pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => setFormData({ ...formData, file_cv: e.target.files[0] })}
                />
                <div className="text-center">
                  <span className="text-blue-600 font-medium text-sm">
                    {formData.file_cv ? formData.file_cv.name : 'Pilih file CV...'}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">Format PDF, Maks 2MB</p>
                </div>
              </div>
            </div>

            {/* Input Surat Rekomendasi */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">File Surat Rekomendasi (PDF)</label>
              <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-blue-400 transition-colors bg-gray-50/50">
                <input 
                  type="file" 
                  required 
                  accept=".pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => setFormData({ ...formData, file_rekomendasi: e.target.files[0] })}
                />
                <div className="text-center">
                  <span className="text-blue-600 font-medium text-sm">
                    {formData.file_rekomendasi ? formData.file_rekomendasi.name : 'Pilih file Surat Rekomendasi...'}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">Format PDF, Maks 2MB</p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
              <p className="text-xs text-blue-700 leading-relaxed">
                <span className="font-bold">Info:</span> Pastikan dokumen yang diunggah sudah sesuai dengan persyaratan perusahaan. Status seleksi dapat Anda pantau di dashboard setelah lamaran dikirim.
              </p>
            </div>

            {/* Tombol Kirim */}
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-100 flex items-center justify-center ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Kirim Lamaran Sekarang'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
