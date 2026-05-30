import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [dosenList, setDosenList] = useState([]);
  const [profileData, setProfileData] = useState({
    nama: '',
    username: '',
    email: '',
    nim: '',
    nip: '',
    fakultas: '',
    prodi: '',
    dosen_pembimbing_id: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, dosenRes] = await Promise.all([
          api.get('/users/me'),
          user?.role === 'mahasiswa' ? api.get('/users/dosen') : Promise.resolve({ data: [] })
        ]);

        const data = profileRes.data;
        setProfileData({
          nama: data.nama || '',
          username: data.username || '',
          email: data.email || '',
          nim: data.nim || '',
          nip: data.nip || '',
          fakultas: data.fakultas || '',
          prodi: data.prodi || '',
          dosen_pembimbing_id: data.dosen_pembimbing_id || ''
        });
        setDosenList(dosenRes.data);
      } catch (err) {
        toast.error('Gagal memuat data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user?.role]);

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Menyimpan perubahan...');
    setIsSaving(true);
    
    const payload = {};
    if (profileData.nama) payload.nama = profileData.nama;
    if (profileData.username) payload.username = profileData.username;
    if (profileData.email) payload.email = profileData.email;
    
    if (user?.role === 'mahasiswa') {
        if (profileData.nim) payload.nim = profileData.nim;
        if (profileData.fakultas) payload.fakultas = profileData.fakultas;
        if (profileData.prodi) payload.prodi = profileData.prodi;
        if (profileData.dosen_pembimbing_id) payload.dosen_pembimbing_id = parseInt(profileData.dosen_pembimbing_id);
    } else {
        if (profileData.nip) payload.nip = profileData.nip;
    }

    try {
      const response = await api.put('/users/me', payload);
      toast.success('Profil berhasil diperbarui!', { id: loadingToast });
      
      const currentToken = localStorage.getItem('access_token');
      if (currentToken && login) {
        const updatedUser = {
            ...user,
            nama: response.data.nama,
            username: response.data.username,
            email: response.data.email,
        };
        if (user.role === 'mahasiswa') {
            updatedUser.nim = response.data.nim;
            updatedUser.dosen_pembimbing_id = response.data.dosen_pembimbing_id;
        }
        if (user.role === 'dosen' || user.role === 'staff') updatedUser.nip = response.data.nip;
        
        login(updatedUser, currentToken, user.role);
      }
    } catch (err) {
      toast.error('Gagal memperbarui profil.', { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pb-12">
      <main className="max-w-3xl mx-auto mt-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 bg-indigo-50/30 flex items-center gap-6">
             <div className="w-24 h-24 bg-indigo-100 rounded-[2rem] flex items-center justify-center text-4xl font-black text-indigo-600 shadow-inner">
                {profileData.nama?.charAt(0) || 'U'}
             </div>
             <div>
                <h2 className="text-2xl font-black text-gray-900">{profileData.nama || 'Pengguna'}</h2>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Role: {user?.role}</p>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Nama Lengkap</label>
                    <input 
                      type="text" 
                      name="nama"
                      value={profileData.nama}
                      onChange={handleChange}
                      required
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Username</label>
                    <input 
                      type="text" 
                      name="username"
                      value={profileData.username}
                      onChange={handleChange}
                      required
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Email</label>
                  <input 
                    type="email" 
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    required
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                {user?.role === 'mahasiswa' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">NIM</label>
                        <input 
                          type="text" 
                          name="nim"
                          value={profileData.nim}
                          onChange={handleChange}
                          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Dosen Pembimbing Akademik</label>
                        <select 
                          name="dosen_pembimbing_id"
                          value={profileData.dosen_pembimbing_id}
                          onChange={handleChange}
                          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-indigo-500 transition-all"
                        >
                          <option value="">Pilih Dosen...</option>
                          {dosenList.map((d) => (
                            <option key={d.user_id} value={d.user_id}>{d.nama} ({d.nip})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Program Studi</label>
                        <input 
                          type="text" 
                          name="prodi"
                          value={profileData.prodi}
                          onChange={handleChange}
                          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Fakultas</label>
                        <input 
                          type="text" 
                          name="fakultas"
                          value={profileData.fakultas}
                          onChange={handleChange}
                          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>
                  </>
                )}

                {(user?.role === 'dosen' || user?.role === 'staff') && (
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">NIP</label>
                    <input 
                      type="text" 
                      name="nip"
                      value={profileData.nip}
                      onChange={handleChange}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                )}

                <div className="pt-6 border-t border-gray-100">
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className={`w-full py-4 bg-indigo-600 text-white font-black tracking-widest uppercase text-xs rounded-2xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSaving ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
