import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { TableSkeleton } from '../../components/Skeleton';

export default function HubungiDosen() {
  const { user } = useAuth();
  const [pembimbing, setPembimbing] = useState(null);
  const [dosens, setDosens] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDosenId, setSelectedDosenId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [userRes, dosenRes, recRes] = await Promise.all([
        api.get('/users/me'),
        api.get('/users/dosen'),
        api.get('/surat-rekomendasi/mahasiswa/saya')
      ]);

      setDosens(dosenRes.data);
      setRecommendations(recRes.data);

      if (userRes.data.dosen_pembimbing_id) {
        const currentDosen = dosenRes.data.find(d => d.user_id === userRes.data.dosen_pembimbing_id);
        setPembimbing(currentDosen);
        setSelectedDosenId(userRes.data.dosen_pembimbing_id);
        setSearchTerm(currentDosen?.nama || '');
      }
    } catch (err) {
      console.error('Gagal memuat data:', err);
      toast.error('Gagal memuat data pengajuan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredDosens = dosens.filter(d => 
    d.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.nip.includes(searchTerm)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDosenId || !selectedFile) {
      toast.error('Dosen dan draft surat wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Mengirim pengajuan...');

    const formData = new FormData();
    formData.append('dosen_id', selectedDosenId);
    formData.append('file', selectedFile);

    try {
      await api.post('/surat-rekomendasi/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Pengajuan surat rekomendasi berhasil dikirim!', { id: loadingToast });
      setSelectedFile(null);
      fetchData();
    } catch (err) {
      toast.error('Gagal mengirim pengajuan.', { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-10">
      {/* Header Section */}
      <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-blue-900/5 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Surat Rekomendasi 📄</h2>
          <p className="text-sm text-gray-500 font-medium">Ajukan permintaan surat rekomendasi magang kepada dosen pembimbing.</p>
        </div>
        <div className="bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100">
           <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest text-center">Total Pengajuan</p>
           <p className="text-2xl font-black text-blue-600 text-center">{recommendations.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Form Section */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <h3 className="font-black text-gray-900 text-lg">Buat Pengajuan Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1 relative">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dosen Tujuan</label>
                <input 
                  type="text"
                  placeholder="Cari nama dosen..."
                  className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedDosenId('');
                  }}
                />
                {searchTerm && !selectedDosenId && (
                  <div className="absolute z-20 w-full mt-1 bg-white border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {filteredDosens.length > 0 ? (
                      filteredDosens.map(d => (
                        <div 
                          key={d.user_id} 
                          className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0"
                          onClick={() => {
                            setSelectedDosenId(d.user_id);
                            setSearchTerm(d.nama);
                          }}
                        >
                          <p className="text-sm font-bold text-gray-800">{d.nama}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">NIP. {d.nip}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-xs text-gray-400 italic">Dosen tidak ditemukan</div>
                    )}
                  </div>
                )}
                {selectedDosenId && (
                  <div className="absolute right-3 top-10 text-green-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Upload Draft Surat (PDF)</label>
                <div className="relative group">
                   <div className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all ${
                     selectedFile ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50 group-hover:border-blue-400'
                   }`}>
                      <input 
                        type="file" 
                        accept=".pdf" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                      />
                      <span className="text-2xl mb-2">{selectedFile ? '📄' : '📤'}</span>
                      <p className="text-[10px] font-bold text-gray-500 uppercase text-center truncate w-full px-2">
                        {selectedFile ? selectedFile.name : 'Pilih draft surat'}
                      </p>
                   </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                Kirim Pengajuan
              </button>
            </form>
          </div>

          {/* Info Box */}
          <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex gap-4">
             <span className="text-2xl">💡</span>
             <div className="space-y-1">
               <p className="text-xs font-black text-amber-900 uppercase tracking-wider">Prosedur</p>
               <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                 Siapkan draft surat bimbingan dalam format PDF. Setelah dikirim, Dosen Pembimbing akan meninjau dan mengunggah surat yang telah ditandatangani jika disetujui.
               </p>
             </div>
          </div>
        </div>

        {/* History Section */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-black text-gray-900 text-lg px-4">Riwayat Pengajuan</h3>
          {isLoading ? (
            <TableSkeleton />
          ) : recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div key={rec.surat_id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-md transition-all group">
                   <div className="flex items-center gap-5 flex-1">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl font-black group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {rec.dosen?.nama?.charAt(0)}
                      </div>
                      <div className="space-y-1">
                         <h4 className="font-bold text-gray-800">{rec.dosen?.nama}</h4>
                         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Diajukan pada {new Date(rec.tanggal_pengajuan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                   </div>

                   <div className="flex items-center gap-6">
                      <div className="text-right">
                         <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                           rec.status_surat === 'APPROVED' ? 'bg-green-50 text-green-600 border-green-100' :
                           rec.status_surat === 'DECLINED' ? 'bg-red-50 text-red-600 border-red-100' :
                           'bg-amber-50 text-amber-600 border-amber-100'
                         }`}>
                           {rec.status_surat}
                         </span>
                      </div>
                      
                      <div className="flex gap-2">
                         <a 
                           href={rec.dokumen_surat} 
                           target="_blank" 
                           rel="noreferrer"
                           className="p-3 bg-gray-50 text-gray-400 hover:text-blue-600 rounded-xl transition-all"
                           title="Lihat Draft"
                         >
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                         </a>
                         {rec.status_surat === 'APPROVED' && (
                           <a 
                             href={rec.dokumen_surat} 
                             target="_blank" 
                             rel="noreferrer"
                             className="p-3 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl transition-all animate-bounce"
                             title="Download Surat Tanda Tangan"
                           >
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                           </a>
                         )}
                      </div>
                   </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200 mx-4">
              <div className="text-5xl mb-4 grayscale opacity-20">📂</div>
              <p className="text-gray-400 font-bold italic">Belum ada riwayat pengajuan surat rekomendasi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
