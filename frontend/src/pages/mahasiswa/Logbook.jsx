import React, { useState } from 'react';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';

export default function Logbook() {
  const navigate = useNavigate();
  const [tanggal, setTanggal] = useState('');
  const [aktivitas, setAktivitas] = useState('');
  const [logs, setLogs] = useState([
    { id: 1, tanggal: '15 April 2026', isi: 'Mempelajari React hooks dan membuat komponen form untuk fitur registrasi.', waktu: '2 hari yang lalu' },
    { id: 2, tanggal: '14 April 2026', isi: 'Meeting dengan tim untuk planning sprint berikutnya.', waktu: '3 hari yang lalu' }
  ]);

  const handleSaveEntry = (e) => {
    e.preventDefault();
    if (!tanggal || !aktivitas) return;

    const newLog = {
      id: Date.now(),
      tanggal: new Date(tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      isi: aktivitas,
      waktu: 'Baru saja'
    };

    setLogs([newLog, ...logs]);
    setTanggal('');
    setAktivitas('');
    alert("Entry logbook berhasil disimpan!");
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
            <h2 className="text-lg font-bold text-gray-800">Logbook Magang</h2>
            <button 
              onClick={() => navigate(-1)} 
              className="px-4 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Kembali
            </button>
          </div>

          {/* Form Tambah Entry Baru */}
          <form onSubmit={handleSaveEntry} className="space-y-4 bg-gray-50/40 border border-gray-100 p-5 rounded-xl">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Tambah Entry Logbook</h3>
            
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Tanggal</label>
              <input 
                type="date" required
                className="w-full md:w-1/3 p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Aktivitas</label>
              <textarea 
                rows="3" required placeholder="Deskripsikan aktivitas hari ini..."
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                value={aktivitas}
                onChange={(e) => setAktivitas(e.target.value)}
              ></textarea>
            </div>

            <button 
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Simpan Entry
            </button>
          </form>

          {/* Riwayat Logbook */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-700">Riwayat Logbook</h3>
            <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 overflow-hidden shadow-inner bg-white">
              {logs.map((log) => (
                <div key={log.id} className="p-4 flex justify-between items-start gap-4 text-sm hover:bg-gray-50/50 transition-colors">
                  <div className="space-y-1">
                    <span className="font-bold text-gray-800 block text-xs">{log.tanggal}</span>
                    <p className="text-gray-600 text-xs leading-relaxed">{log.isi}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap font-medium">{log.waktu}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}