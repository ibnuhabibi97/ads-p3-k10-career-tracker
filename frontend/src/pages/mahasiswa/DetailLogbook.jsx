import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { DashboardSkeleton } from '../../components/Skeleton';

export default function DetailLogbook() {
  const { laporanId } = useParams();
  const navigate = useNavigate();
  const [logbooks, setLogbooks] = useState([]);
  const [dosens, setDosens] = useState([]);
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

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [logRes, dosenRes] = await Promise.all([
        api.get(`/logbook/laporan/${laporanId}`),
        api.get('/users/dosen')
      ]);
      setLogbooks(logRes.data);
      setDosens(dosenRes.data);
    } catch (err) {
      toast.error('Gagal memuat data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      fetchData();
    } catch (err) {
      toast.error('Gagal menambah logbook.');
    }
  };

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 space-y-8">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-gray-900">Manajemen Logbook</h2>
            <div className="flex gap-2">
                <button onClick={() => navigate(-1)} className="px-5 py-2.5 bg-gray-100 rounded-xl text-xs font-bold hover:bg-gray-200">Kembali</button>
                <button onClick={() => setIsFormOpen(!isFormOpen)} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700">+ Tambah Log</button>
            </div>
        </div>

        {isFormOpen && (
            <form onSubmit={handleSubmit} className="bg-white p-8 border rounded-3xl shadow-sm space-y-4">
                <select className="w-full p-3 border rounded-xl text-sm" onChange={e => setFormData({...formData, dosen_id: e.target.value})}>
                    <option value="">Pilih Dosen Pembimbing</option>
                    {dosens.map(d => <option key={d.user_id} value={d.user_id}>{d.nama}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-4">
                    <input type="datetime-local" className="w-full p-3 border rounded-xl text-sm" onChange={e => setFormData({...formData, waktu_mulai: e.target.value})} />
                    <input type="datetime-local" className="w-full p-3 border rounded-xl text-sm" onChange={e => setFormData({...formData, waktu_selesai: e.target.value})} />
                </div>
                <input type="text" placeholder="Jenis Kegiatan" className="w-full p-3 border rounded-xl text-sm" onChange={e => setFormData({...formData, jenis_kegiatan: e.target.value})} />
                <textarea placeholder="Keterangan" className="w-full p-3 border rounded-xl text-sm" onChange={e => setFormData({...formData, keterangan: e.target.value})} />
                <input type="file" className="w-full text-sm" onChange={e => setFormData({...formData, file_dokumentasi: e.target.files[0]})} />
                <button type="submit" className="w-full py-4 bg-green-600 text-white font-bold rounded-xl">Simpan Logbook</button>
            </form>
        )}

        <div className="space-y-4">
            {logbooks.map(log => (
                <div key={log.logbook_id} className="bg-white border p-6 rounded-3xl flex justify-between items-center shadow-sm">
                    <div>
                        <p className="font-bold text-gray-800">{new Date(log.tanggal_log).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-500">{log.keterangan || 'Log kosong'}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}
