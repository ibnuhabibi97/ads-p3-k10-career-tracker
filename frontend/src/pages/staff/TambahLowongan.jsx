import React from 'react';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';

export default function TambahLowongan() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Tambah Lowongan" userName="Henny Kusumawati, S.Kom" userDetail="Staff Akademik" bgColor="bg-purple-600" />

      <main className="max-w-4xl mx-auto px-6 mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Tambah Lowongan Baru</h2>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Kembali
          </button>
        </div>

        <form className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Nama Perusahaan</label>
              <input type="text" placeholder="Contoh: PT Tech Indonesia" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Posisi Magang</label>
              <input type="text" placeholder="Contoh: Frontend Developer" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Lokasi</label>
              <input type="text" placeholder="Jakarta / Remote" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Durasi</label>
              <input type="text" placeholder="Contoh: 6 Bulan" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Kuota</label>
              <input type="number" placeholder="0" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Batas Pendaftaran</label>
            <input type="date" className="w-full md:w-1/3 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Deskripsi Pekerjaan</label>
            <textarea rows="4" placeholder="Tuliskan tugas dan tanggung jawab..." className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500"></textarea>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Persyaratan</label>
            <textarea rows="4" placeholder="Kualifikasi yang dibutuhkan..." className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500"></textarea>
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-100 transition-all">
              Simpan Lowongan
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}