import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function VerifikasiPendaftaran() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applicants, setApplicants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchApplicants = async () => {
    try {
      // Backend: GET /pendaftaran/ returns all registrations if user is staff
      const response = await api.get('/pendaftaran/saya'); // In our case, staff can see all
      // NOTE: Based on backend pendaftaran_router.py, GET /saya is for mahasiswa.
      // We need to check if there is an endpoint for staff to see all.
      // Since it's not explicitly defined in the router snippet for "all", 
      // let's assume staff can access GET /pendaftaran/ (common pattern) or similar.
      // Re-reading pendaftaran_router.py: it only has /, /{id}/status, and /saya.
      // Let's try GET /pendaftaran/
      const res = await api.get('/pendaftaran/');
      setApplicants(res.data);
    } catch (err) {
      console.error('Gagal memuat pendaftaran:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleVerify = async (id, newStatus) => {
    try {
      await api.patch(`/pendaftaran/${id}/status`, {
        status_seleksi: newStatus
      });
      alert(`Pendaftaran berhasil di-${newStatus.toLowerCase()}`);
      fetchApplicants();
    } catch (err) {
      alert("Gagal mengubah status pendaftaran.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header 
        title="Verifikasi Pendaftaran" 
        userName={user?.nama} 
        userDetail={user?.role?.toUpperCase()} 
        bgColor="bg-purple-600" 
      />

      <main className="max-w-4xl mx-auto px-6 mt-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4 mb-2">
            <h2 className="text-xl font-bold text-gray-900">Antrean Verifikasi</h2>
            <button 
              onClick={() => navigate(-1)} 
              className="px-4 py-1.5 bg-gray-50 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Kembali
            </button>
          </div>

          <div className="space-y-6">
            {isLoading ? (
              <div className="text-center py-10 text-gray-400">Memuat data pelamar...</div>
            ) : applicants.length > 0 ? (
              applicants.map((app) => (
                <div key={app.pendaftaran_id} className="border border-gray-100 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start gap-6 bg-white hover:shadow-md transition-all">
                  <div className="space-y-3 flex-1">
                    <div>
                      <h3 className="font-bold text-gray-800 text-base mb-1">{app.mahasiswa_nama}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span className="font-medium bg-gray-100 px-2 py-0.5 rounded">NIM: {app.mahasiswa_nim}</span>
                        <span className="text-gray-300">|</span>
                        <span>Posisi: <span className="font-bold text-indigo-600">{app.lowongan_judul}</span></span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-2 font-medium">DAFTAR PADA: {new Date(app.tanggal_daftar).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dokumen Pelengkap</p>
                      <div className="flex gap-2">
                        <a 
                          href={app.dokumen_cv} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 text-[11px] font-bold rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
                        >
                          📄 Curriculum Vitae
                        </a>
                        <a 
                          href={app.dokumen_surat_rekomendasi} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 text-[11px] font-bold rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
                        >
                          📄 Surat Rekomendasi
                        </a>
                      </div>
                    </div>

                    {app.status_seleksi === 'PENDING' && (
                      <div className="flex gap-2 pt-2">
                        <button 
                          onClick={() => handleVerify(app.pendaftaran_id, 'ACCEPTED')}
                          className="px-6 py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 shadow-md shadow-green-100 transition-all"
                        >
                          Terima Pelamar
                        </button>
                        <button 
                          onClick={() => handleVerify(app.pendaftaran_id, 'REJECTED')}
                          className="px-6 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 shadow-md shadow-red-100 transition-all"
                        >
                          Tolak
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                      app.status_seleksi === 'ACCEPTED' 
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : app.status_seleksi === 'REJECTED'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {app.status_seleksi}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400 text-xs italic">Tidak ada pendaftaran yang perlu diverifikasi.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
