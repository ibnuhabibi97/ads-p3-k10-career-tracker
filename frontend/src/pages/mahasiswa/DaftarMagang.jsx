import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function DaftarMagang() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [lowonganList, setLowonganList] = useState([]);
  const [formData, setFormData] = useState({
    lowongan_id: location.state?.lowongan_id || '',
    file_cv: null,
    file_rekomendasi: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchLowongan = async () => {
      setIsFetching(true);
      try {
        const response = await api.get('/lowongan/aktif');
        setLowonganList(response.data);

        // Jika ada state lowongan_id dari navigasi, pastikan terpasang
        if (location.state?.lowongan_id) {
          setFormData(prev => ({ ...prev, lowongan_id: location.state.lowongan_id }));
        }
      } catch (err) {
        toast.error('Gagal memuat daftar lowongan.');
      } finally {
        setIsFetching(false);
      }
    };
    fetchLowongan();
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.lowongan_id || !formData.file_cv || !formData.file_rekomendasi) {
      toast.error('Semua berkas dan pilihan lowongan wajib diisi.');
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
        toast.success("Pendaftaran magang Anda berhasil dikirim!");
        navigate('/mahasiswa/dashboard');
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : 'Gagal mengirim pendaftaran.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 p-10 space-y-8">
        <div className="flex justify-between items-center border-b border-gray-50 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Form Pendaftaran Magang</h2>
              <p className="text-sm text-gray-400 font-medium">Lengkapi berkas pendaftaran Anda dengan benar.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pilihan Lowongan */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2.5">Target Perusahaan & Posisi</label>
            <select 
              required
              disabled={isFetching}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all appearance-none cursor-pointer"
              value={formData.lowongan_id}
              onChange={(e) => setFormData({ ...formData, lowongan_id: e.target.value })}
            >
              <option value="">{isFetching ? 'Memuat Lowongan...' : 'Pilih lowongan magang yang tersedia...'}</option>
              {lowonganList.map((job) => (
                <option key={job.lowongan_id} value={job.lowongan_id}>
                  {job.judul_posisi} — {job.perusahaan}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input CV */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Curriculum Vitae (PDF)</label>
              <div className="relative group">
                <div className={`border-2 border-dashed rounded-[2rem] p-8 flex flex-col items-center justify-center transition-all ${
                  formData.file_cv ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50 group-hover:border-blue-400 group-hover:bg-blue-50/30'
                }`}>
                  <input 
                    type="file" 
                    required 
                    accept=".pdf"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => setFormData({ ...formData, file_cv: e.target.files[0] })}
                  />
                  <span className="text-3xl mb-3">
                    {formData.file_cv ? (
                      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    )}
                  </span>
                  <span className={`text-xs font-black uppercase tracking-widest text-center px-4 ${formData.file_cv ? 'text-green-600' : 'text-blue-600'}`}>
                    {formData.file_cv ? formData.file_cv.name : 'Klik atau seret CV Anda'}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-tight">Format PDF • Maks 2MB</p>
                </div>
              </div>
            </div>

            {/* Input Surat Rekomendasi */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Surat Rekomendasi (PDF)</label>
              <div className="relative group">
                <div className={`border-2 border-dashed rounded-[2rem] p-8 flex flex-col items-center justify-center transition-all ${
                  formData.file_rekomendasi ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50 group-hover:border-blue-400 group-hover:bg-blue-50/30'
                }`}>
                  <input 
                    type="file" 
                    required 
                    accept=".pdf"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => setFormData({ ...formData, file_rekomendasi: e.target.files[0] })}
                  />
                  <span className="text-3xl mb-3">{formData.file_rekomendasi ? '✅' : '✉️'}</span>
                  <span className={`text-xs font-black uppercase tracking-widest text-center px-4 ${formData.file_rekomendasi ? 'text-green-600' : 'text-blue-600'}`}>
                    {formData.file_rekomendasi ? formData.file_rekomendasi.name : 'Klik atau seret Surat'}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-tight">Format PDF • Maks 2MB</p>
                </div>
              </div>
            </div>
          </div>

          {/* Warning Banner */}
          <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl flex gap-4">
             <span className="text-2xl">⚠️</span>
             <div className="space-y-1">
               <p className="text-xs font-black text-amber-900 uppercase tracking-wider">Perhatian Penting</p>
               <p className="text-xs text-amber-800 font-medium leading-relaxed">
                 Anda hanya diperbolehkan mendaftar satu kali per posisi. Pastikan seluruh berkas sudah benar karena data yang sudah dikirim tidak dapat diubah kembali.
               </p>
             </div>
          </div>

          {/* Tombol Kirim */}
          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-5 bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'
              }`}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>Submit Lamaran Magang</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
