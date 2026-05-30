import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function KelolaLowongan() {
  const navigate = useNavigate();
  const [lowongans, setLowongans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLowongans = async () => {
    try {
      const response = await api.get('/lowongan/');
      setLowongans(response.data);
    } catch (err) {
      toast.error('Gagal memuat lowongan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLowongans();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus lowongan ini?')) {
      try {
        await api.delete(`/lowongan/${id}`);
        toast.success('Lowongan berhasil dihapus');
        fetchLowongans();
      } catch (err) {
        toast.error('Gagal menghapus lowongan.');
      }
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.put(`/lowongan/${id}`, { is_active: !currentStatus });
      toast.success('Status lowongan berhasil diubah');
      fetchLowongans();
    } catch (err) {
      toast.error('Gagal mengubah status lowongan.');
    }
  };

  return (
    <div className="pb-12">
      <main className="max-w-6xl mx-auto mt-8 space-y-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Kelola Lowongan Magang</h2>
              <p className="text-sm text-gray-400">Aktifkan atau hapus lowongan yang ada di sistem</p>
            </div>
            <button 
              onClick={() => navigate('/staff/tambah-lowongan')}
              className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
            >
              + Tambah Lowongan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              <div className="col-span-2 text-center py-10 text-gray-400">Memuat data...</div>
            ) : lowongans.length > 0 ? (
              lowongans.map((l) => (
                <div key={l.lowongan_id} className="border border-gray-100 rounded-2xl p-6 space-y-4 hover:shadow-md transition-all bg-gray-50/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{l.judul_posisi}</h3>
                      <p className="text-sm text-indigo-600 font-semibold">{l.perusahaan}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                        new Date(l.deadline) < new Date().setHours(0,0,0,0) 
                          ? 'bg-orange-100 text-orange-700' 
                          : l.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {new Date(l.deadline) < new Date().setHours(0,0,0,0) ? 'EXPIRED' : l.is_active ? 'AKTIF' : 'NONAKTIF'}
                      </span>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Deadline: {new Date(l.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 line-clamp-2">{l.deskripsi_pekerjaan}</p>
                  
                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => navigate(`/staff/edit-lowongan/${l.lowongan_id}`)}
                      className="flex-1 py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      Edit Detail
                    </button>
                    <button 
                      onClick={() => toggleStatus(l.lowongan_id, l.is_active)}
                      className="flex-1 py-2 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {l.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    <button 
                      onClick={() => handleDelete(l.lowongan_id)}
                      className="py-2 px-4 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-12 text-gray-400 italic">Belum ada lowongan.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
