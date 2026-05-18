import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function TambahLowongan() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const editData = location.state?.editData;

  const [formData, setFormData] = useState({
    perusahaan: '',
    judul_posisi: '',
    lokasi: '',
    durasi: '',
    kuota: 0,
    deadline: '',
    deskripsi: '',
    persyaratan: '',
    tipe_magang: 'Full-time',
    is_active: true
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      // Format deadline date to YYYY-MM-DD for input type="date"
      const formattedDate = editData.deadline ? new Date(editData.deadline).toISOString().split('T')[0] : '';
      setFormData({
        ...editData,
        deadline: formattedDate
      });
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editData) {
        await api.put(`/lowongan/${editData.lowongan_id}`, formData);
        alert("Lowongan berhasil diperbarui!");
      } else {
        await api.post('/lowongan/', formData);
        alert("Lowongan baru berhasil ditambahkan!");
      }
      navigate('/staff/kelola-lowongan');
    } catch (err) {
      alert(err.response?.data?.detail || "Gagal menyimpan lowongan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header 
        title={editData ? "Edit Lowongan" : "Tambah Lowongan"} 
        userName={user?.nama} 
        userDetail={user?.role?.toUpperCase()} 
        bgColor="bg-purple-600" 
      />

      <main className="max-w-4xl mx-auto px-6 mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">{editData ? "Perbarui Data Lowongan" : "Buat Lowongan Magang Baru"}</h2>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-50 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-100 border border-gray-200 transition-colors"
          >
            Batal & Kembali
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Nama Perusahaan</label>
              <input 
                type="text" 
                required
                placeholder="Contoh: PT Tech Indonesia" 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                value={formData.perusahaan}
                onChange={(e) => setFormData({ ...formData, perusahaan: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Posisi Magang</label>
              <input 
                type="text" 
                required
                placeholder="Contoh: Frontend Developer" 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                value={formData.judul_posisi}
                onChange={(e) => setFormData({ ...formData, judul_posisi: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Lokasi</label>
              <input 
                type="text" 
                required
                placeholder="Jakarta / Remote" 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                value={formData.lokasi}
                onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Durasi</label>
              <input 
                type="text" 
                required
                placeholder="Contoh: 6 Bulan" 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                value={formData.durasi}
                onChange={(e) => setFormData({ ...formData, durasi: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Kuota</label>
              <input 
                type="number" 
                required
                placeholder="0" 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                value={formData.kuota}
                onChange={(e) => setFormData({ ...formData, kuota: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Batas Pendaftaran</label>
              <input 
                type="date" 
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Tipe Magang</label>
              <select 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                value={formData.tipe_magang}
                onChange={(e) => setFormData({ ...formData, tipe_magang: e.target.value })}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Deskripsi Pekerjaan</label>
            <textarea 
              rows="4" 
              required
              placeholder="Tuliskan tugas dan tanggung jawab..." 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
            ></textarea>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Persyaratan</label>
            <textarea 
              rows="4" 
              required
              placeholder="Kualifikasi yang dibutuhkan..." 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
              value={formData.persyaratan}
              onChange={(e) => setFormData({ ...formData, persyaratan: e.target.value })}
            ></textarea>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-4 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 shadow-lg shadow-purple-100 transition-all flex items-center justify-center gap-2 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading && (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {editData ? "Perbarui Lowongan" : "Publikasikan Lowongan"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
