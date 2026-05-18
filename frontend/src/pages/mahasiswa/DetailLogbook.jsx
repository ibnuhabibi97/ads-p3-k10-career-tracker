import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { DashboardSkeleton } from '../../components/Skeleton';

export default function DetailLogbook() {
  const { laporanId } = useParams();
  const navigate = useNavigate();
  const [logbooks, setLogbooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    dosen_id: '',
    waktu_mulai: '',
    waktu_selesai: '',
    keterangan: '',
    jenis_kegiatan: '',
    file_dokumentasi: null
  });

  const fetchLogbooks = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/logbook/laporan/${laporanId}`);
      setLogbooks(response.data);
    } catch (err) {
      toast.error('Gagal memuat logbook.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogbooks();
  }, [laporanId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('laporan_id', laporanId);
    Object.keys(formData).forEach(key => {
        if (formData[key]) data.append(key, formData[key]);
    });

    try {
      await api.post('/logbook/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Logbook berhasil ditambahkan');
      setIsFormOpen(false);
      fetchLogbooks();
    } catch (err) {
      toast.error('Gagal menambah logbook.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus log ini?')) return;
    try {
      await api.delete(`/logbook/${id}`);
      toast.success('Logbook dihapus');
      fetchLogbooks();
    } catch (err) {
      toast.error('Gagal menghapus logbook.');
    }
  };

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-2xl font-black text-gray-900">Manajemen Logbook</h2>
           <p className="text-gray-500 text-sm">Kelola seluruh aktivitas harian untuk laporan #{laporanId}</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => navigate(-1)} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-200 transition-all">Kembali</button>
            <button onClick={() => setIsFormOpen(!isFormOpen)} className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 transition-all">+ Tambah Log</button>
        </div>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white p-6 border rounded-3xl shadow-sm mb-8 space-y-4">
            <input type="number" placeholder="Dosen ID" className="w-full p-2 border rounded-xl text-xs" onChange={e => setFormData({...formData, dosen_id: e.target.value})} />
            <input type="datetime-local" className="w-full p-2 border rounded-xl text-xs" onChange={e => setFormData({...formData, waktu_mulai: e.target.value})} />
            <input type="datetime-local" className="w-full p-2 border rounded-xl text-xs" onChange={e => setFormData({...formData, waktu_selesai: e.target.value})} />
            <input type="text" placeholder="Jenis Kegiatan" className="w-full p-2 border rounded-xl text-xs" onChange={e => setFormData({...formData, jenis_kegiatan: e.target.value})} />
            <textarea placeholder="Keterangan" className="w-full p-2 border rounded-xl text-xs" onChange={e => setFormData({...formData, keterangan: e.target.value})} />
            <input type="file" onChange={e => setFormData({...formData, file_dokumentasi: e.target.files[0]})} />
            <button type="submit" className="w-full py-3 bg-green-600 text-white font-bold rounded-xl">Simpan Logbook Baru</button>
        </form>
      )}

      <div className="space-y-4">
        {logbooks.map((log) => (
          <div key={log.logbook_id} className="bg-white border p-6 rounded-3xl flex justify-between items-center shadow-sm">
             <div>
                <p className="font-bold text-gray-800">{new Date(log.tanggal_log).toLocaleDateString()}</p>
                <p className="text-sm text-gray-600">{log.keterangan || 'Kosong'}</p>
             </div>
             <div className="flex gap-2">
                <button onClick={() => handleDelete(log.logbook_id)} className="text-red-600 font-bold text-xs">Hapus</button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
