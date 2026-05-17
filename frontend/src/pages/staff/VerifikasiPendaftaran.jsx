import React, { useState } from 'react';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';

export default function VerifikasiPendaftaran() {
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([
    { id: 1, nama: 'Ahmad Fauzi', nim: '123456792', posisi: 'Frontend Developer', tanggal: '18 April 2026', status: 'Menunggu' },
    { id: 2, nama: 'Dewi Lestari', nim: '123456793', posisi: 'UI/UX Designer', tanggal: '17 April 2026', status: 'Menunggu' },
    { id: 3, nama: 'Eko Prasetyo', nim: '123456794', posisi: 'Data Analyst', tanggal: '16 April 2026', status: 'Disetujui' }
  ]);

  const handleVerify = (id, newStatus) => {
    setApplicants(applicants.map(app => app.id === id ? { ...app, status: newStatus } : app));
    alert(`Status pendaftaran mahasiswa berhasil diubah menjadi: ${newStatus}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header 
        title="Dashboard Staff Akademik" 
        userName="Henny Kusumawati, S.Kom" 
        userDetail="Staff Academic" 
        bgColor="bg-purple-600" 
      />

      <main className="max-w-4xl mx-auto px-6 mt-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-2">
            <h2 className="text-lg font-bold text-gray-800">Verifikasi Pendaftaran</h2>
            <button 
              onClick={() => navigate(-1)} 
              className="px-4 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Kembali
            </button>
          </div>

          <div className="space-y-5">
            {applicants.map((app) => (
              <div key={app.id} className="border border-gray-100 rounded-xl p-5 flex justify-between items-start bg-white shadow-sm">
                <div className="space-y-1.5 flex-1">
                  <div>
                    <h3 className="font-bold text-gray-800 text-base mb-0.5">{app.nama}</h3>
                    <p className="text-xs text-gray-500">NIM: {app.nim} | Posisi: <span className="font-semibold text-gray-700">{app.posisi}</span></p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Tanggal daftar: {app.tanggal}</p>
                  </div>

                  {/* Tautan Dokumen Lampiran */}
                  <div className="space-y-1 pt-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Dokumen:</p>
                    <div className="flex gap-2">
                      <button className="px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-100 text-[11px] font-semibold rounded-md hover:bg-blue-100 transition-colors">
                        📄 CV.pdf
                      </button>
                      <button className="px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-100 text-[11px] font-semibold rounded-md hover:bg-blue-100 transition-colors">
                        📄 Transkrip.pdf
                      </button>
                    </div>
                  </div>

                  {/* Tombol Kontrol Verifikasi jika Status Masih Menunggu */}
                  {app.status === 'Menunggu' && (
                    <div className="flex gap-2 pt-2.5">
                      <button 
                        onClick={() => handleVerify(app.id, 'Disetujui')}
                        className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Setujui
                      </button>
                      <button 
                        onClick={() => handleVerify(app.id, 'Ditolak')}
                        className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Tolak
                      </button>
                      <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors">
                        Lihat Detail
                      </button>
                    </div>
                  )}
                </div>

                {/* Badge Kanan Atas Status */}
                <div>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                    app.status === 'Disetujui' 
                      ? 'bg-green-50 text-green-700 border border-green-100'
                      : app.status === 'Ditolak'
                      ? 'bg-red-50 text-red-700 border border-red-100'
                      : 'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}>
                    {app.status}
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