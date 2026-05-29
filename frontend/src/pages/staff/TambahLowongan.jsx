import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function TambahLowongan() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    perusahaan: '',
    judul_posisi: '',
    deskripsi_pekerjaan: '',
    kualifikasi: '',
    deadline: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Menambah lowongan...');
    try {
      // Ubah kualifikasi string ke array
      const data = {
        ...formData,
        kualifikasi: formData.kualifikasi.split('\n').filter(k => k.trim() !== '')
      };
      await api.post('/lowongan/', data);
      toast.success('Lowongan berhasil ditambahkan!', { id: loadingToast });
      navigate('/staff/kelola-lowongan');
    } catch (err) {
      toast.error('Gagal menambah lowongan.', { id: loadingToast });
    }
  };

  return (
    <div className="pb-12">
      <main className="max-w-3xl mx-auto mt-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <h2 className="text-xl font-bold text-gray-900">Tambah Lowongan Baru</h2>
            <button 
              type="button"
              onClick={() => navigate(-1)} 
              className="px-4 py-1.5 bg-gray-50 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Kembali
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Nama Perusahaan</label>
              <input 
                type="text" required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                value={formData.perusahaan}
                onChange={(e) => setFormData({ ...formData, perusahaan: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Judul Posisi</label>
              <input 
                type="text" required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                value={formData.judul_posisi}
                onChange={(e) => setFormData({ ...formData, judul_posisi: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Deskripsi Pekerjaan</label>
              <textarea 
                rows="4" required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                value={formData.deskripsi_pekerjaan}
                onChange={(e) => setFormData({ ...formData, deskripsi_pekerjaan: e.target.value })}
              ></textarea>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Kualifikasi (Satu per baris)</label>
              <textarea 
                rows="4" required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                value={formData.kualifikasi}
                onChange={(e) => setFormData({ ...formData, kualifikasi: e.target.value })}
              ></textarea>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Deadline Pendaftaran</label>
              <input 
                type="date" required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100"
          >
            Publikasikan Lowongan
          </button>
        </form>
      </main>
    </div>
  );
}
