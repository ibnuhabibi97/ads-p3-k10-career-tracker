import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function TinjauProgres() {
  const { user } = useAuth();
  const [mahasiswaList, setMahasiswaList] = useState([]);
  const [selectedLaporan, setSelectedLaporan] = useState(null);
  const [logbooks, setLogbooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingLogbook, setIsFetchingLogbook] = useState(false);

  useEffect(() => {
    const fetchMahasiswa = async () => {
      try {
        const response = await api.get(`/laporan/dosen/${user.user_id}`);
        setMahasiswaList(response.data);
        if (response.data.length > 0) {
          handleSelectMahasiswa(response.data[0]);
        }
      } catch (err) {
        console.error('Gagal memuat daftar mahasiswa:', err);
        toast.error('Gagal memuat daftar mahasiswa.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMahasiswa();
  }, [user.user_id]);

  const handleSelectMahasiswa = async (laporan) => {
    setSelectedLaporan(laporan);
    setIsFetchingLogbook(true);
    try {
      const response = await api.get(`/logbook/laporan/${laporan.laporan_id}`);
      setLogbooks(response.data);
    } catch (err) {
      console.error('Gagal memuat logbook:', err);
      toast.error('Gagal memuat logbook mahasiswa.');
    } finally {
      setIsFetchingLogbook(false);
    }
  };

  return (
    <div className="pb-12">
      <div className="max-w-5xl mx-auto mt-8 space-y-6">
        {/* Pilih Mahasiswa Dropdown */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <label className="text-sm font-bold text-gray-700 block mb-2">Pilih Mahasiswa Bimbingan</label>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <svg className="animate-spin h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memuat data mahasiswa...
            </div>
          ) : (
            <select 
              className="w-full md:w-1/2 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 transition-all"
              onChange={(e) => {
                const laporan = mahasiswaList.find(m => m.laporan_id === parseInt(e.target.value));
                handleSelectMahasiswa(laporan);
              }}
              value={selectedLaporan?.laporan_id || ''}
            >
              {mahasiswaList.map((m) => (
                <option key={m.laporan_id} value={m.laporan_id}>
                  {m.mahasiswa_nama} ({m.mahasiswa_nim})
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedLaporan && (
          <>
            {/* Logbook Section */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="font-bold text-gray-800 uppercase text-xs tracking-wider">Logbook: {selectedLaporan.mahasiswa_nama}</h2>
                <span className="text-xs text-indigo-600 font-bold">{logbooks.length} Kegiatan Terdaftar</span>
              </div>
              
              {isFetchingLogbook ? (
                <div className="p-10 text-center flex flex-col items-center gap-2">
                  <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-sm text-gray-400">Mengambil entri logbook...</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {logbooks.length > 0 ? (
                    logbooks.map((entry) => (
                      <div key={entry.logbook_id} className="p-5 flex justify-between items-start gap-6 hover:bg-gray-50/30 transition-colors">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase">
                              {new Date(entry.waktu_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-[9px] font-bold uppercase">{entry.jenis_kegiatan}</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{entry.keterangan}</p>
                          {entry.media && <p className="text-[10px] text-gray-400 italic">Media: {entry.media}</p>}
                          {entry.dokumentasi && (
                            <a 
                              href={entry.dokumentasi} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-block mt-2 text-[10px] text-blue-600 font-bold hover:underline"
                            >
                              Lihat Dokumentasi
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center text-gray-400 italic text-sm">Belum ada entry logbook.</div>
                  )}
                </div>
              )}
            </div>

            {/* Laporan Akhir Section */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="font-bold text-gray-800 mb-4 uppercase text-xs tracking-wider">Laporan Akhir</h2>
              {selectedLaporan.dokumen_laporan ? (
                <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">📄</span>
                    <div>
                      <p className="text-sm font-bold text-gray-800">Dokumen Laporan Mahasiswa</p>
                      <p className="text-xs text-gray-400">Status: {selectedLaporan.status}</p>
                    </div>
                  </div>
                  <a 
                    href={selectedLaporan.dokumen_laporan}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100"
                  >
                    Unduh / Lihat
                  </a>
                </div>
              ) : (
                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-400 text-xs italic">Mahasiswa belum mengunggah laporan akhir.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
