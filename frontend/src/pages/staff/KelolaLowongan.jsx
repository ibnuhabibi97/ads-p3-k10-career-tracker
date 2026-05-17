import React, { useState } from 'react';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';

export default function KelolaLowongan() {
  const navigate = useNavigate();
  const [lowonganList, setLowonganList] = useState([
    { id: 1, perusahaan: 'PT Tech Indonesia', posisi: 'Frontend Developer', kuota: 5, pelamar: 12, status: 'Aktif' },
    { id: 2, perusahaan: 'CV Digital Creative', posisi: 'UI/UX Designer', kuota: 3, pelamar: 8, status: 'Aktif' },
    { id: 3, perusahaan: 'PT Data Solutions', posisi: 'Data Analyst', kuota: 4, pelamar: 15, status: 'Penuh' },
  ]);

  const handleEdit = (id) => {
    // Alihkan ke form tambah/edit dengan membawa id parameter lowongan
    alert(`Mengedit lowongan ID: ${id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data lowongan ini?")) {
      setLowonganList(lowonganList.filter(item => item.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header 
        title="Dashboard Staff Akademik" 
        userName="Henny Kusumawati, S.Kom" 
        userDetail="Staff Akademik" 
        bgColor="bg-purple-600" 
      />

      <main className="max-w-4xl mx-auto px-6 mt-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-2">
            <h2 className="text-lg font-bold text-gray-800">Kelola Lowongan</h2>
            <button 
              onClick={() => navigate(-1)} 
              className="px-4 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Kembali
            </button>
          </div>

          {/* List Item Kontrol Lowongan */}
          <div className="space-y-4">
            {lowonganList.map((job) => (
              <div key={job.id} className="border border-gray-100 rounded-xl p-5 flex justify-between items-center shadow-sm hover:shadow-md bg-white transition-all">
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-800 text-base">{job.posisi}</h3>
                  <p className="text-xs text-gray-400 font-medium">{job.perusahaan}</p>
                  <div className="flex items-center gap-4 pt-1.5 text-xs text-gray-500 font-medium">
                    <span>Kuota: {job.kuota}</span>
                    <span>Pelamar: {job.pelamar}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      job.status === 'Aktif' 
                        ? 'bg-green-50 text-green-700 border border-green-100' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                </div>

                {/* Tombol Aksi Kanan (Sesuai mockup) */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleEdit(job.id)}
                    className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Edit Lowongan"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => handleDelete(job.id)}
                    className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    title="Hapus Lowongan"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}