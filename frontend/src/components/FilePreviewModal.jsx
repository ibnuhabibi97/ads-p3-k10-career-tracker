import React from 'react';

export default function FilePreviewModal({ isOpen, onClose, fileUrl, title }) {
  if (!isOpen || !fileUrl) return null;

  const isPDF = fileUrl.toLowerCase().endsWith('.pdf') || fileUrl.includes('.pdf?');
  const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(fileUrl.split('?')[0]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0">
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">{title || 'Preview Berkas'}</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Peninjauan Dokumen Mahasiswa</p>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href={fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              Buka di Tab Baru
            </a>
            <button 
              onClick={onClose}
              className="p-2.5 bg-gray-100 text-gray-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 bg-gray-50 overflow-auto p-4 flex items-center justify-center">
          {isPDF ? (
            <iframe
              src={`${fileUrl}#toolbar=0`}
              title="PDF Preview"
              className="w-full h-full rounded-2xl border border-gray-200 bg-white"
            />
          ) : isImage ? (
            <img 
              src={fileUrl} 
              alt="Preview" 
              className="max-w-full max-h-full object-contain rounded-xl shadow-lg border border-white"
            />
          ) : (
            <div className="text-center space-y-4">
               <div className="text-6xl grayscale opacity-20">📁</div>
               <p className="text-gray-400 font-bold italic">Format file tidak mendukung preview langsung.</p>
               <a href={fileUrl} className="text-blue-600 font-bold underline" download>Klik di sini untuk mengunduh</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
