import React, { useState } from 'react';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';

export default function Dokumen() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([
    { id: 1, name: 'CV_Muhammad_Rizki.pdf' },
    { id: 2, name: 'Transkrip_Semester_5.pdf' }
  ]);

  const handleDelete = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus dokumen ini?")) {
      setDocuments(documents.filter(doc => doc.id !== id));
    }
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
            <h2 className="text-lg font-bold text-gray-800">Dokumen Saya</h2>
            <button 
              onClick={() => navigate(-1)} 
              className="px-4 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Kembali
            </button>
          </div>

          {/* Area Upload CV */}
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
            <span className="text-3xl mb-2 text-gray-400">📤</span>
            <p className="text-xs font-medium text-gray-500 mb-3">Upload CV</p>
            <label className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
              Pilih File
              <input type="file" className="hidden" accept=".pdf" />
            </label>
          </div>

          {/* Area Upload Transkrip */}
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
            <span className="text-3xl mb-2 text-gray-400">📤</span>
            <p className="text-xs font-medium text-gray-500 mb-3">Upload Transkrip Nilai</p>
            <label className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
              Pilih File
              <input type="file" className="hidden" accept=".pdf" />
            </label>
          </div>

          {/* List Dokumen Tersimpan */}
          <div className="pt-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Dokumen Tersimpan</h3>
            <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 overflow-hidden shadow-inner bg-gray-50/20">
              {documents.map((doc) => (
                <div key={doc.id} className="flex justify-between items-center px-4 py-3.5 text-sm">
                  <span className="text-gray-700 font-medium">{doc.name}</span>
                  <button 
                    onClick={() => handleDelete(doc.id)}
                    className="text-xs text-red-600 font-bold hover:underline"
                  >
                    Hapus
                  </button>
                </div>
              ))}
              {documents.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-4">Belum ada dokumen yang diunggah.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}