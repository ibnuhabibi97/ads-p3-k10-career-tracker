import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function KelolaLowongan() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lowonganList, setLowonganList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLowongan = async () => {
    try {
      const response = await api.get('/lowongan/');
      setLowonganList(response.data);
    } catch (err) {
      console.error('Gagal memuat lowongan:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLowongan();
  }, []);

  const handleEdit = (job) => {
    navigate('/staff/tambah-lowongan', { state: { editData: job } });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data lowongan ini?")) {
      try {
        await api.delete(`/lowongan/${id}`);
        setLowonganList(lowonganList.filter(item => item.lowongan_id !== id));
        alert("Lowongan berhasil dihapus.");
      } catch (err) {
        alert("Gagal menghapus lowongan.");
      }
    }
  };

  const toggleStatus = async (job) => {
    try {
      await api.put(`/lowongan/${job.lowongan_id}`, {
        ...job,
        is_active: !job.is_active
      });
      fetchLowongan();
    } catch (err) {
      alert("Gagal mengubah status lowongan.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header 
        title="Kelola Lowongan" 
        userName={user?.nama} 
        userDetail={user?.role?.toUpperCase()} 
        bgColor="bg-purple-600" 
      />

      <main className="max-w-4xl mx-auto px-6 mt-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4 mb-2">
            <h2 className="text-xl font-bold text-gray-900">Daftar Lowongan</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => navigate('/staff/tambah-lowongan')} 
                className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-md shadow-purple-100"
              >
                + Tambah Baru
              </button>
              <button 
                onClick={() => navigate(-1)} 
                className="px-4 py-2 bg-gray-50 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Kembali
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-10 text-gray-400">Memuat data...</div>
            ) : lowonganList.length > 0 ? (
              lowonganList.map((job) => (
                <div key={job.lowongan_id} className="border border-gray-100 rounded-2xl p-6 flex justify-between items-center shadow-sm hover:shadow-md bg-white transition-all group">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-gray-800 text-base">{job.judul_posisi}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase ${
                        job.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {job.is_active ? 'Aktif' : 'Non-Aktif'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">{job.perusahaan}</p>
                    <div className="flex items-center gap-4 pt-1 text-[10px] text-gray-500 font-medium">
                      <span className="flex items-center gap-1">👥 Kuota: {job.kuota}</span>
                      <span className="flex items-center gap-1">📍 {job.lokasi}</span>
                      <span className="flex items-center gap-1">📅 Batas: {new Date(job.deadline).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleStatus(job)}
                      className={`p-2 rounded-xl transition-colors ${job.is_active ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`}
                      title={job.is_active ? "Non-aktifkan" : "Aktifkan"}
                    >
                      {job.is_active ? '⏸️' : '▶️'}
                    </button>
                    <button 
                      onClick={() => handleEdit(job)}
                      className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                      title="Edit Lowongan"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(job.lowongan_id)}
                      className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                      title="Hapus Lowongan"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400 text-xs italic">Belum ada data lowongan.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
