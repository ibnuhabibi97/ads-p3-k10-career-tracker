import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { DashboardSkeleton } from '../../components/Skeleton';

export default function TambahLowongan() {
  const navigate = useNavigate();
  const { lowonganId } = useParams();
  const location = useLocation();
  const isEditMode = !!lowonganId || location.state?.edit;

  const [formData, setFormData] = useState({
    perusahaan: '',
    judul_posisi: '',
    deskripsi_pekerjaan: '',
    kualifikasi: '',
    deadline: '',
    kuota: 1,
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const fetchDetail = async () => {
        setIsLoading(true);
        try {
          const id = lowonganId || location.state?.lowongan?.lowongan_id;
          const response = await api.get(`/lowongan/${id}`);
          const data = response.data;
          setFormData({
            perusahaan: data.perusahaan,
            judul_posisi: data.judul_posisi,
            deskripsi_pekerjaan: data.deskripsi_pekerjaan,
            kualifikasi: Array.isArray(data.kualifikasi) ? data.kualifikasi.join('\n') : data.kualifikasi,
            deadline: data.deadline,
            kuota: data.kuota || 1,
            is_active: data.is_active
          });
        } catch (err) {
          toast.error('Gagal memuat detail lowongan.');
          navigate('/staff/kelola-lowongan');
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetail();
    }
  }, [lowonganId, isEditMode, navigate, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(isEditMode ? 'Memperbarui lowongan...' : 'Menambah lowongan...');
    try {
      const data = {
        ...formData,
        kualifikasi: formData.kualifikasi.split('\n').filter(k => k.trim() !== '')
      };

      if (isEditMode) {
        const id = lowonganId || location.state?.lowongan?.lowongan_id;
        await api.put(`/lowongan/${id}`, data);
        toast.success('Lowongan berhasil diperbarui!', { id: loadingToast });
      } else {
        await api.post('/lowongan/', data);
        toast.success('Lowongan berhasil ditambahkan!', { id: loadingToast });
      }
      navigate('/staff/kelola-lowongan');
    } catch (err) {
      toast.error(isEditMode ? 'Gagal memperbarui lowongan.' : 'Gagal menambah lowongan.', { id: loadingToast });
    }
  };

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="pb-12">
      <main className="max-w-3xl mx-auto mt-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{isEditMode ? 'Edit Lowongan Magang' : 'Tambah Lowongan Baru'}</h2>
              <p className="text-xs text-gray-400 mt-1">{isEditMode ? 'Perbarui informasi lowongan yang sudah ada' : 'Publikasikan peluang magang baru ke mahasiswa'}</p>
            </div>
            <button 
              type="button"
              onClick={() => navigate(-1)} 
              className="px-4 py-1.5 bg-gray-50 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Kembali
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Nama Perusahaan</label>
                <input 
                  type="text" required
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:border-indigo-500 transition-all"
                  value={formData.perusahaan}
                  onChange={(e) => setFormData({ ...formData, perusahaan: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Judul Posisi</label>
                <input 
                  type="text" required
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:border-indigo-500 transition-all"
                  value={formData.judul_posisi}
                  onChange={(e) => setFormData({ ...formData, judul_posisi: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Deskripsi Pekerjaan</label>
              <textarea 
                rows="4" required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:border-indigo-500 transition-all"
                value={formData.deskripsi_pekerjaan}
                onChange={(e) => setFormData({ ...formData, deskripsi_pekerjaan: e.target.value })}
              ></textarea>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Kualifikasi (Satu per baris)</label>
              <textarea 
                rows="4" required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:border-indigo-500 transition-all"
                value={formData.kualifikasi}
                onChange={(e) => setFormData({ ...formData, kualifikasi: e.target.value })}
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Deadline Pendaftaran</label>
                <input 
                  type="date" required
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:border-indigo-500 transition-all"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Kuota (Orang)</label>
                <input 
                  type="number" required min="1"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:border-indigo-500 transition-all"
                  value={formData.kuota}
                  onChange={(e) => setFormData({ ...formData, kuota: parseInt(e.target.value) })}
                />
              </div>
            </div>

            {isEditMode && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <input 
                  type="checkbox"
                  id="is_active"
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label htmlFor="is_active" className="text-xs font-bold text-gray-700 uppercase tracking-wider">Status Lowongan Aktif</label>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-[0.98]"
          >
            {isEditMode ? 'Simpan Perubahan' : 'Publikasikan Lowongan'}
          </button>
        </form>
      </main>
    </div>
  );
}
