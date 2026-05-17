import React, { useState } from 'react';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';

export default function LaporanAkhir() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      alert("Silakan pilih file terlebih dahulu!");
      return;
    }
    alert(`Berhasil mengunggah laporan: ${selectedFile.name}`);
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
            <h2 className="text-lg font-bold text-gray-800">Laporan Akhir Magang</h2>
            <button 
              onClick={() => navigate(-1)} 
              className="px-4 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Kembali
            </button>
          </div>

          {/* Container Kotak Upload Dashed */}
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
            <span className="text-4xl mb-3 text-gray-400">📤</span>
            <p className="text-sm font-bold text-gray-800 mb-0.5">Upload Laporan Akhir</p>
            <p className="text-xs text-gray-400 mb-4">File format: PDF (Max 10MB)</p>
            
            <label className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-blue-700 transition-colors shadow-sm">
              {selectedFile ? 'Ganti File' : 'Pilih File PDF'}
              <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
            </label>

            {selectedFile && (
              <div className="mt-4 text-center">
                <p className="text-xs font-semibold text-green-600">📄 {selectedFile.name}</p>
                <button 
                  onClick={handleUpload}
                  className="mt-2 px-4 py-1 bg-gray-800 text-white text-[11px] font-bold rounded hover:bg-gray-900 transition-colors"
                >
                  Mulai Unggah
                </button>
              </div>
            )}
          </div>

          {/* Banner Peringatan Bawah */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 flex items-start gap-2">
            <span className="text-amber-600 text-sm">⚠️</span>
            <p className="text-xs text-amber-800 font-medium leading-relaxed">
              Pastikan laporan sudah disetujui pembimbing sebelum upload. Laporan yang sudah diunggah akan langsung divalidasi oleh pihak staff akademik.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}