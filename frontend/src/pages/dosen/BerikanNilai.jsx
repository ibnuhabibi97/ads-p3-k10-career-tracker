import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function BerikanNilai() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mahasiswaList, setMahasiswaList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsLoadingSubmit] = useState(false);
  const [formData, setFormData] = useState({
    laporan_id: '',
    nilai: '',
    status: 'GRADED',
    catatan: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMahasiswa = async () => {
      try {
        const response = await api.get(`/laporan/dosen/${user.user_id}`);
        // Hanya ambil yang sudah upload laporan atau yang statusnya pending/rejected
        setMahasiswaList(response.data);
      } catch (err) {
        console.error('Gagal memuat daftar mahasiswa:', err);
        toast.error('Gagal memuat daftar mahasiswa.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMahasiswa();
  }, [user.user_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.laporan_id) {
      toast.error('Silakan pilih mahasiswa terlebih dahulu.');
      return;
    }

    const loadingToast = toast.loading('Menyimpan penilaian...');
    setIsLoadingSubmit(true);

    try {
      const response = await api.patch(`/laporan/${formData.laporan_id}/nilai`, {
        nilai: parseInt(formData.nilai),
        status: formData.status,
        catatan: formData.catatan
      });
      
      if (response.status === 200) {
        toast.success("Penilaian berhasil disimpan!", { id: loadingToast });
        navigate('/dosen/dashboard');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Gagal menyimpan penilaian.';
      setError(errorMsg);
      toast.error(errorMsg, { id: loadingToast });
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header 
        title="Berikan Nilai" 
        userName={user?.nama} 
        userDetail={`NIP. ${user?.nip}`} 
        bgColor="bg-green-600" 
      />

      <main className="max-w-3xl mx-auto px-6 mt-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <h2 className="text-xl font-bold text-gray-900">Form Penilaian Magang</h2>
            <button 
              type="button"
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

          {/* Pilihan Mahasiswa */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Pilih Mahasiswa Bimbingan</label>
            <select 
              required
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 transition-all"
              value={formData.laporan_id}
              onChange={(e) => setFormData({ ...formData, laporan_id: e.target.value })}
            >
              <option value="">Pilih mahasiswa...</option>
              {mahasiswaList.map((m) => (
                <option key={m.laporan_id} value={m.laporan_id}>
                  {m.mahasiswa_nama} ({m.mahasiswa_nim}) - Status: {m.status}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Nilai */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Nilai Akhir (0-100)</label>
              <input 
                type="number" min="0" max="100" required placeholder="Contoh: 85"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 transition-all"
                value={formData.nilai}
                onChange={(e) => setFormData({ ...formData, nilai: e.target.value })}
              />
            </div>

            {/* Status Laporan */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Keputusan Status</label>
              <select 
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 transition-all"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="GRADED">Selesai & Beri Nilai</option>
                <option value="REJECTED">Tolak & Minta Revisi</option>
              </select>
            </div>
          </div>

          {/* Catatan / Feedback */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Catatan / Feedback Revisi</label>
            <textarea 
              rows="4" placeholder="Tuliskan feedback atau alasan jika meminta revisi..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 transition-all"
              value={formData.catatan}
              onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
            ></textarea>
          </div>

          {/* Tombol Simpan */}
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isSubmitting || isLoading}
              className={`w-full py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-md shadow-green-100 flex items-center justify-center ${
                (isSubmitting || isLoading) ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Simpan Penilaian'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
