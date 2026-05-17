import React, { useState } from 'react';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';

export default function BerikanNilai() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    mahasiswa: '',
    nilaiLaporan: '',
    nilaiLogbook: '',
    nilaiPresentasi: '',
    nilaiAkhirHuruf: '',
    catatan: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Data nilai berhasil disimpan!");
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header 
        title="Dashboard Dosen Pembimbing" 
        userName="Dr. Ahmad Suryadi, M.Kom" 
        userDetail="NIDN. 0012345678" 
        bgColor="bg-green-600" 
      />

      <main className="max-w-4xl mx-auto px-6 mt-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h2 className="text-lg font-bold text-gray-800">Input Nilai Magang</h2>
            <button 
              type="button"
              onClick={() => navigate(-1)} 
              className="px-4 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Kembali
            </button>
          </div>

          {/* Pilihan Mahasiswa */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">Mahasiswa</label>
            <select 
              required
              className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500"
              value={formData.mahasiswa}
              onChange={(e) => setFormData({ ...formData, mahasiswa: e.target.value })}
            >
              <option value="">Pilih mahasiswa bimbingan...</option>
              <option value="123456789">Muhammad Rizki (123456789)</option>
              <option value="123456790">Siti Aminah (123456790)</option>
            </select>
          </div>

          {/* Baris Input Nilai Angka */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Nilai Laporan (0-100)</label>
              <input 
                type="number" min="0" max="100" required placeholder="0"
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500"
                value={formData.nilaiLaporan}
                onChange={(e) => setFormData({ ...formData, nilaiLaporan: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Nilai Logbook (0-100)</label>
              <input 
                type="number" min="0" max="100" required placeholder="0"
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500"
                value={formData.nilaiLogbook}
                onChange={(e) => setFormData({ ...formData, nilaiLogbook: e.target.value })}
              />
            </div>
          </div>

          {/* Baris Input Presentasi & Huruf */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Nilai Presentasi (0-100)</label>
              <input 
                type="number" min="0" max="100" required placeholder="0"
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500"
                value={formData.nilaiPresentasi}
                onChange={(e) => setFormData({ ...formData, nilaiPresentasi: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Nilai Akhir Huruf</label>
              <input 
                type="text" required placeholder="Contoh: A / AB / B"
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500"
                value={formData.nilaiAkhirHuruf}
                onChange={(e) => setFormData({ ...formData, nilaiAkhirHuruf: e.target.value })}
              />
            </div>
          </div>

          {/* Catatan / Feedback */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">Catatan/Feedback</label>
            <textarea 
              rows="4" placeholder="Berikan feedback untuk mahasiswa..."
              className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500"
              value={formData.catatan}
              onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
            ></textarea>
          </div>

          {/* Tombol Simpan */}
          <div className="pt-2">
            <button 
              type="submit" 
              className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-md shadow-green-100"
            >
              Simpan Nilai
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}