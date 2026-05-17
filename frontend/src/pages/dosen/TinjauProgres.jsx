import React from 'react';
import Header from '../../components/Header';

export default function TinjauProgres() {
  const logbookEntries = [
    { tanggal: '18 April 2024', isi: 'Mempelajari React Hooks dan membuat komponen form untuk fitur registrasi.', status: 'Sudah diperiksa' },
    { tanggal: '16 April 2024', isi: 'Diskusi dengan tim UI untuk sinkronisasi sprint berikutnya.', status: 'Belum diperiksa' },
    { tanggal: '13 April 2024', isi: 'Implementasi slicing UI dan login menggunakan autentikasi JWT.', status: 'Sudah diperiksa' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Tinjau Progres" userName="Dr. Ahmad Suryadi, M.Kom" userDetail="NIDN. 0012345678" bgColor="bg-green-600" />

      <main className="max-w-5xl mx-auto px-6 mt-8 space-y-6">
        {/* Pilih Mahasiswa Dropdown */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <label className="text-sm font-bold text-gray-700 block mb-2">Pilih Mahasiswa</label>
          <select className="w-full md:w-1/3 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none">
            <option>Muhammad Rizki (123456789)</option>
            <option>Siti Aminah (123456790)</option>
          </select>
        </div>

        {/* Logbook Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="font-bold text-gray-800">Logbook: Muhammad Rizki</h2>
            <span className="text-xs text-green-600 font-semibold uppercase">Progres: 65%</span>
          </div>
          <div className="divide-y divide-gray-100">
            {logbookEntries.map((entry, idx) => (
              <div key={idx} className="p-5 flex justify-between items-start gap-6">
                <div className="flex-1">
                  <span className="text-xs font-bold text-gray-400 block mb-1">{entry.tanggal}</span>
                  <p className="text-sm text-gray-700 leading-relaxed">{entry.isi}</p>
                </div>
                <button className="text-xs text-blue-600 font-bold hover:underline shrink-0">Beri Komentar</button>
              </div>
            ))}
          </div>
        </div>

        {/* Laporan Akhir Section */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-4">Laporan Akhir</h2>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <div className="flex items-center gap-3">
              <span className="text-2xl text-red-500">📄</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">Laporan_Magang_Muhammad_Rizki.pdf</p>
                <p className="text-xs text-gray-400">Diunggah pada 20 April 2024</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50">Unduh</button>
          </div>
        </div>
      </main>
    </div>
  );
}