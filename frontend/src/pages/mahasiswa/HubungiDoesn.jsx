import React, { useState } from 'react';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';

export default function HubungiDosen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ subjek: '', pesan: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Pesan konsultasi berhasil dikirim ke dosen pembimbing!");
    setFormData({ subjek: '', pesan: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header 
        title="Dashboard Mahasiswa" 
        userName="Muhammad Rizki" 
        userDetail="NIM. 123456789" 
        bgColor="bg-blue-600" 
      />

      <main className="max-w-6xl mx-auto px-6 mt-6">
        {/* Tombol Kembali Atas */}
        <div className="flex justify-end mb-4">
          <button 
            onClick={() => navigate(-1)} 
            className="px-4 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            Kembali
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Kolom Kiri: Profil Dosen Pembimbing */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-md shadow-blue-100">
              DA
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Dr. Ahmad Fauzi, M.Kom</h3>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Dosen Pembimbing</p>
            </div>

            {/* Info Detail List */}
            <div className="w-full space-y-3 pt-3 text-left border-t border-gray-100">
              <div className="text-xs">
                <span className="block text-gray-400 font-medium">NIP</span>
                <span className="text-gray-700 font-semibold">198501152010121001</span>
              </div>
              <div className="text-xs">
                <span className="block text-gray-400 font-medium">Email</span>
                <span className="text-gray-700 font-semibold break-all">ahmad.fauzi@university.ac.id</span>
              </div>
              <div className="text-xs">
                <span className="block text-gray-400 font-medium">Telepon</span>
                <span className="text-gray-700 font-semibold">+62 812-3456-7890</span>
              </div>
              <div className="text-xs">
                <span className="block text-gray-400 font-medium">Jurusan</span>
                <span className="text-gray-700 font-semibold">Teknik Informatika</span>
              </div>
              <div className="text-xs">
                <span className="block text-gray-400 font-medium">Ruang Kerja</span>
                <span className="text-gray-700 font-semibold">Gedung A, Lantai 3, Ruang 301</span>
              </div>
            </div>

            {/* Bidang Keahlian Badges */}
            <div className="w-full pt-3 border-t border-gray-100 text-left">
              <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">Bidang Keahlian:</span>
              <div className="flex flex-wrap gap-1.5">
                {['Machine Learning', 'Data Science', 'AI'].map((skill, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[10px] font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Form Kirim Pesan & Info Jam */}
          <div className="lg:col-span-2 space-y-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
              <div>
                <h2 className="text-base font-bold text-gray-800">Kirim Pesan</h2>
                <p className="text-xs text-gray-400 mt-0.5">Kirim pesan kepada dosen pembimbing Anda untuk konsultasi atau pertanyaan.</p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Subjek Pesan</label>
                <input 
                  type="text" required placeholder="Contoh: Konsultasi Progres Magang"
                  className="w-full p-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
                  value={formData.subjek}
                  onChange={(e) => setFormData({ ...formData, subjek: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Isi Pesan</label>
                <textarea 
                  rows="6" required placeholder="Tulis pesan Anda di sini..."
                  className="w-full p-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
                  value={formData.pesan}
                  onChange={(e) => setFormData({ ...formData, pesan: e.target.value })}
                ></textarea>
                <span className="text-[10px] text-gray-400 mt-1 block">Pastikan pesan Anda jelas dan sopan.</span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setFormData({ subjek: '', pesan: '' })}
                  className="px-5 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Reset
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-100 flex items-center gap-1.5"
                >
                  🚀 Kirim Pesan
                </button>
              </div>
            </form>

            {/* Kotak Info Jam Konsultasi */}
            <div className="bg-blue-50/40 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-lg">📅</span>
              <div className="text-xs">
                <p className="font-bold text-blue-950 mb-0.5">Jam Konsultasi</p>
                <p className="text-blue-800/80 font-medium">Senin - Jumat: 09.00 - 16.00 WIB</p>
                <p className="text-blue-600/70 mt-0.5">Pesan akan dibalas dalam 1x24 jam pada hari kerja.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}