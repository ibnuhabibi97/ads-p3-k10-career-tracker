import React, { useState } from 'react';
import Header from '../../components/Header';

export default function LihatLowongan() {
  const [searchTerm, setSearchTerm] = useState('');

  const lowonganData = [
    { id: 1, posisi: 'Frontend Developer', perusahaan: 'PT Tech Indonesia', lokasi: 'Jakarta', tipe: 'Full-time', durasi: '6 bulan' },
    { id: 2, posisi: 'UI/UX Designer', perusahaan: 'CV Digital Creative', lokasi: 'Bandung', tipe: 'Remote', durasi: '3 bulan' },
    { id: 3, posisi: 'Data Analyst', perusahaan: 'PT Data Solutions', lokasi: 'Surabaya', tipe: 'Hybrid', durasi: '4 bulan' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Lihat Lowongan" userName="Muhammad Rizki" userDetail="NIM. 123456789" bgColor="bg-blue-600" />
      
      <main className="max-w-4xl mx-auto px-6 mt-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Lowongan Magang</h2>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <i className="fa-solid fa-magnifying-glass text-sm"></i>
            </span>
            <input
              type="text"
              placeholder="Cari posisi atau perusahaan..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          {lowonganData.map((job) => (
            <div key={job.id} className="bg-white p-5 rounded-2xl border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 text-xl font-bold">
                  {job.perusahaan.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{job.posisi}</h3>
                  <p className="text-sm text-gray-500">{job.perusahaan}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-400 flex items-center gap-1">📍 {job.lokasi}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">⏱️ {job.durasi}</span>
                  </div>
                </div>
              </div>
              <button className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors">
                Detail
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}