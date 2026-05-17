import React, { useState } from 'react';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';

export default function DaftarMagang() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    lowongan: '',
    cv: '',
    transkrip: '',
    motivasi: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Pendaftaran magang Anda berhasil dikirim!");
    navigate('/mahasiswa/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header 
        title="Dashboard Mahasiswa" 
        userName="Muhammad Rizki" 
        userDetail="NIM. 123456789" 
        bgColor="bg-blue-600" 
      />

      <main className="max-w-4xl mx-auto px-6 mt-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h2 className="text-lg font-bold text-gray-800">Pendaftaran Magang</h2>
            <button 
              onClick={() => navigate(-1)} 
              className="px-4 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Kembali
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Pilihan Lowongan */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Pilih Lowongan</label>
              <select 
                required
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                value={formData.lowongan}
                onChange={(e) => setFormData({ ...formData, lowongan: e.target.value })}
              >
                <option value="">Pilih lowongan perusahaan...</option>
                <option value="1">Frontend Developer - PT Tech Indonesia</option>
                <option value="2">UI/UX Designer - CV Digital Creative</option>
              </select>
            </div>

            {/* Input CV */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">CV</label>
              <input 
                type="text" required placeholder="Masukkan nama file atau link dokumen CV Anda"
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                value={formData.cv}
                onChange={(e) => setFormData({ ...formData, cv: e.target.value })}
              />
            </div>

            {/* Input Transkrip */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Transkrip Nilai</label>
              <input 
                type="text" required placeholder="Masukkan nama file atau link transkrip nilai Anda"
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                value={formData.transkrip}
                onChange={(e) => setFormData({ ...formData, transkrip: e.target.value })}
              />
            </div>

            {/* Surat Motivasi */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Surat Motivasi</label>
              <textarea 
                rows="5" placeholder="Tulis alasan Anda ingin magang di posisi ini..."
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                value={formData.motivasi}
                onChange={(e) => setFormData({ ...formData, motivasi: e.target.value })}
              ></textarea>
            </div>

            {/* Tombol Kirim */}
            <div className="pt-2">
              <button 
                type="submit" 
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-100"
              >
                Kirim Lamaran
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}