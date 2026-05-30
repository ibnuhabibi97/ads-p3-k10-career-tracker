import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { DashboardSkeleton } from '../../components/Skeleton';

export default function DetailLogbook() {
  const { laporanId } = useParams();
  const navigate = useNavigate();
  const [logbooks, setLogbooks] = useState([]);
  const [dosens, setDosens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    dosen_id: '',
    tanggal_log: new Date().toISOString().split('T')[0],
    waktu_mulai: '',
    waktu_selesai: '',
    keterangan: '',
    jenis_kegiatan: '',
    file_dokumentasi: null
  });

  const filteredDosens = dosens.filter(d => 
    d.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.nip.includes(searchTerm)
  );

  const getLocalISOString = (date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString();
  };

  const now = new Date();
  const maxDate = getLocalISOString(now).split('T')[0];
  const minDate = "2024-01-01";
  const maxDateTime = getLocalISOString(now).substring(0, 16);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [logRes, dosenRes] = await Promise.all([
        api.get(`/logbook/laporan/${laporanId}`),
        api.get('/users/dosen')
      ]);
      setLogbooks(logRes.data);
      setDosens(dosenRes.data);
    } catch (err) {
      toast.error('Gagal memuat data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [laporanId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('laporan_id', laporanId);
    
    // Append fields from formData
    Object.keys(formData).forEach(key => {
        if (key === 'file_dokumentasi') {
            if (formData[key]) data.append(key, formData[key]);
        } else if (formData[key] !== null && formData[key] !== '') {
            data.append(key, formData[key]);
        }
    });

    try {
      if (editingId) {
        // Gunakan PUT dengan multipart/form-data
        await api.put(`/logbook/${editingId}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Logbook diperbarui');
      } else {
        await api.post('/logbook/', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Logbook ditambahkan');
      }
      setEditingId(null);
      setIsFormOpen(false);
      setSearchTerm('');
      setFormData({
        dosen_id: '',
        tanggal_log: new Date().toISOString().split('T')[0],
        waktu_mulai: '',
        waktu_selesai: '',
        keterangan: '',
        jenis_kegiatan: '',
        file_dokumentasi: null
      });
      fetchData();
    } catch (err) {
      toast.error('Gagal menyimpan logbook.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus log ini?')) return;
    try {
      await api.delete(`/logbook/${id}`);
      toast.success('Logbook dihapus');
      fetchData();
    } catch (err) {
      toast.error('Gagal menghapus logbook.');
    }
  };

  const handleEdit = (log) => {
    setEditingId(log.logbook_id);
    const selectedDosen = dosens.find(d => d.user_id === log.dosen_id);
    setSearchTerm(selectedDosen ? selectedDosen.nama : '');
    setFormData({
        dosen_id: log.dosen_id,
        tanggal_log: log.tanggal_log.split('T')[0],
        waktu_mulai: log.waktu_mulai ? log.waktu_mulai.substring(0, 16) : '',
        waktu_selesai: log.waktu_selesai ? log.waktu_selesai.substring(0, 16) : '',
        keterangan: log.keterangan,
        jenis_kegiatan: log.jenis_kegiatan,
        file_dokumentasi: null
    });
    setIsFormOpen(true);
  };

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 space-y-8">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-gray-900">Manajemen Logbook</h2>
            <div className="flex gap-2">
                <button onClick={() => navigate(-1)} className="px-5 py-2.5 bg-gray-100 rounded-xl text-xs font-bold hover:bg-gray-200">Kembali</button>
                <button onClick={() => { 
                  setIsFormOpen(!isFormOpen); 
                  setEditingId(null); 
                  setSearchTerm('');
                  setFormData({
                    dosen_id: '',
                    tanggal_log: new Date().toISOString().split('T')[0],
                    waktu_mulai: '',
                    waktu_selesai: '',
                    keterangan: '',
                    jenis_kegiatan: '',
                    file_dokumentasi: null
                  });
                }} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700">
                  {isFormOpen && !editingId ? 'Batal' : '+ Tambah Log'}
                </button>
            </div>
        </div>

        {isFormOpen && (
            <form onSubmit={handleSubmit} className="bg-white p-8 border rounded-3xl shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 relative">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cari Dosen Pembimbing</label>
                    <input 
                      type="text"
                      placeholder="Ketik nama atau NIP..."
                      className="w-full p-3 border rounded-xl text-sm"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setFormData({...formData, dosen_id: ''});
                      }}
                    />
                    {searchTerm && !formData.dosen_id && (
                      <div className="absolute z-20 w-full mt-1 bg-white border rounded-xl shadow-lg max-h-40 overflow-y-auto">
                        {filteredDosens.length > 0 ? (
                          filteredDosens.map(d => (
                            <div 
                              key={d.user_id} 
                              className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0"
                              onClick={() => {
                                setFormData({...formData, dosen_id: d.user_id});
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
                    {formData.dosen_id && (
                      <div className="absolute right-3 top-9 text-green-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tanggal Kegiatan</label>
                    <input 
                      type="date" 
                      required 
                      min={minDate}
                      max={maxDate}
                      lang="id-ID"
                      className="w-full p-3 border rounded-xl text-sm" 
                      value={formData.tanggal_log} 
                      onChange={e => setFormData({...formData, tanggal_log: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Waktu Mulai</label>
                      <input 
                        type="datetime-local" 
                        max={maxDateTime}
                        lang="id-ID"
                        className="w-full p-3 border rounded-xl text-sm" 
                        value={formData.waktu_mulai} 
                        onChange={e => setFormData({...formData, waktu_mulai: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Waktu Selesai</label>
                      <input 
                        type="datetime-local" 
                        max={maxDateTime}
                        lang="id-ID"
                        className="w-full p-3 border rounded-xl text-sm" 
                        value={formData.waktu_selesai} 
                        onChange={e => setFormData({...formData, waktu_selesai: e.target.value})} 
                      />
                    </div>
                </div>
                <p className="text-[9px] text-gray-400 italic mt-1">* Tampilan format input mengikuti pengaturan bahasa browser Anda.</p>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Jenis Kegiatan</label>
                  <select 
                    required
                    className="w-full p-3 border rounded-xl text-sm" 
                    value={formData.jenis_kegiatan} 
                    onChange={e => setFormData({...formData, jenis_kegiatan: e.target.value})}
                  >
                    <option value="">Pilih Jenis Kegiatan</option>
                    <option value="Berita Acara Kegiatan">Berita Acara Kegiatan</option>
                    <option value="Berita Acara Bimbingan">Berita Acara Bimbingan</option>
                  </select>
                </div>
                <textarea placeholder="Keterangan" className="w-full p-3 border rounded-xl text-sm" value={formData.keterangan} onChange={e => setFormData({...formData, keterangan: e.target.value})} />
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">Dokumentasi (Opsional)</label>
                    <input type="file" className="w-full text-sm" onChange={e => setFormData({...formData, file_dokumentasi: e.target.files[0]})} />
                </div>
                <button type="submit" className="w-full py-4 bg-green-600 text-white font-bold rounded-xl">{editingId ? 'Simpan Perubahan' : 'Simpan Logbook'}</button>
            </form>
        )}

        <div className="space-y-4">
            {logbooks.map(log => (
                <div key={log.logbook_id} className="bg-white border p-6 rounded-3xl flex justify-between items-center shadow-sm">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-black uppercase tracking-wider">
                            {log.jenis_kegiatan}
                          </span>
                          <p className="font-bold text-gray-800 text-sm">
                            {new Date(log.tanggal_log).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">
                          {log.waktu_mulai && new Date(log.waktu_mulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })} 
                          {log.waktu_selesai && ` - ${new Date(log.waktu_selesai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })}`}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">{log.keterangan || 'Log kosong'}</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => handleEdit(log)} className="text-blue-600 font-bold text-xs">Edit</button>
                        <button onClick={() => handleDelete(log.logbook_id)} className="text-red-600 font-bold text-xs">Hapus</button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}
