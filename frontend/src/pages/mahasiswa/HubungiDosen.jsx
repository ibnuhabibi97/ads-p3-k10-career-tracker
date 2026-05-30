import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function HubungiDosen() {
  const { user } = useAuth();
  const [pembimbing, setPembimbing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPembimbing = async () => {
      try {
        const response = await api.get('/users/me');
        if (response.data.dosen_pembimbing_id) {
          // Fetch detail dosen
          const dosenRes = await api.get('/users/dosen');
          const currentDosen = dosenRes.data.find(d => d.user_id === response.data.dosen_pembimbing_id);
          setPembimbing(currentDosen);
        }
      } catch (err) {
        console.error('Gagal memuat data pembimbing:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPembimbing();
  }, []);

  return (
    <div className="pb-12">
      <main className="max-w-4xl mx-auto mt-8 space-y-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
          
          <div className="relative z-10 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Dosen Pembimbing Akademik</h2>
            
            {isLoading ? (
              <div className="py-10 text-center text-gray-400">Memuat data...</div>
            ) : pembimbing ? (
              <div className="flex flex-col md:flex-row gap-10 items-center md:items-start pt-4">
                <div className="w-40 h-40 bg-indigo-100 rounded-[3rem] flex items-center justify-center text-5xl font-black text-indigo-600 shadow-inner">
                  {pembimbing.nama?.charAt(0)}
                </div>
                <div className="flex-1 space-y-6 text-center md:text-left">
                  <div>
                    <h3 className="text-3xl font-black text-gray-900 leading-tight">{pembimbing.nama}</h3>
                    <p className="text-indigo-600 font-bold tracking-widest uppercase text-sm mt-2">NIP. {pembimbing.nip}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a 
                      href={`mailto:${pembimbing.email}`}
                      className="p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-indigo-50 hover:border-indigo-100 transition-all group"
                    >
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-indigo-400">Alamat Email</p>
                      <p className="text-sm font-bold text-gray-700 mt-1">{pembimbing.email}</p>
                    </a>
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl group">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ruang Kerja</p>
                      <p className="text-sm font-bold text-gray-700 mt-1">Departemen Ilmu Komputer</p>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col md:flex-row gap-4">
                    <a 
                      href={`https://wa.me/`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-8 py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all text-center shadow-lg shadow-green-100"
                    >
                      Chat WhatsApp
                    </a>
                    <button 
                      onClick={() => toast.success('Fitur janji temu segera hadir!')}
                      className="px-8 py-4 bg-white border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all"
                    >
                      Buat Janji Temu
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                <p className="text-gray-400 font-bold italic">Anda belum memiliki dosen pembimbing yang terdaftar.</p>
                <p className="text-xs text-gray-400 mt-2">Silakan hubungi staf departemen untuk penempatan pembimbing.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
