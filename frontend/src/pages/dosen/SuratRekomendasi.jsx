import React, { useState } from 'react';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';

export default function SuratRekomendasi() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([
    {
      id: 1,
      nama: 'Muhammad Rizki',
      nim: '123456789',
      perusahaan: 'PT Tech Indonesia',
      tanggal: '18 April 2026',
      status: 'Menunggu'
    },
    {
      id: 2,
      nama: 'Siti Aminah',
      nim: '123456790',
      perusahaan: 'CV Digital Creative',
      tanggal: '5 April 2026',
      status: 'Disetujui'
    }
  ]);

  const handleAction = (id, newStatus) => {
    setRequests(requests.map(req => req.id === id ? { ...req, status: newStatus } : req));
    alert(`Permintaan surat rekomendasi berhasil di-${newStatus.toLowerCase()}`);
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
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-2">
            <h2 className="text-lg font-bold text-gray-800">Permintaan Surat Rekomendasi</h2>
            <button 
              onClick={() => navigate(-1)} 
              className="px-4 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Kembali
            </button>
          </div>

          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="border border-gray-100 rounded-xl p-5 flex justify-between items-start bg-white shadow-sm">
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-800 text-base">{req.nama} - {req.nim}</h3>
                  <p className="text-xs text-gray-500">Untuk: <span className="font-medium text-gray-700">{req.perusahaan}</span></p>
                  <p className="text-[11px] text-gray-400">Diajukan: {req.tanggal}</p>
                  
                  {/* Blok Aksi Jika Status Menunggu */}
                  {req.status === 'Menunggu' && (
                    <div className="flex gap-2 pt-3">
                      <button 
                        onClick={() => handleAction(req.id, 'Disetujui')}
                        className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Setujui & Buat Surat
                      </button>
                      <button 
                        onClick={() => handleAction(req.id, 'Ditolak')}
                        className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Tolak
                      </button>
                    </div>
                  )}

                  {/* Blok Aksi Jika Sudah Disetujui */}
                  {req.status === 'Disetujui' && (
                    <div className="pt-3">
                      <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors">
                        Lihat Surat
                      </button>
                    </div>
                  )}
                </div>

                {/* Badge Status Kanan */}
                <div>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                    req.status === 'Disetujui' 
                      ? 'bg-green-50 text-green-700 border border-green-100'
                      : req.status === 'Ditolak'
                      ? 'bg-red-50 text-red-700 border border-red-100'
                      : 'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}>
                    {req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}