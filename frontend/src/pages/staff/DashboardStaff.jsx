import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { DashboardSkeleton } from '../../components/Skeleton';

export default function DashboardStaff() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplicants: 0,
    pendingVerif: 0,
    activeJobs: 0
  });
  const [lowonganList, setLowonganList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch lowongan and pendaftaran in parallel
        const [lowonganRes, pendaftaranRes] = await Promise.all([
          api.get('/lowongan/'),
          api.get('/pendaftaran/')
        ]);

        const jobs = lowonganRes.data;
        const apps = pendaftaranRes.data;

        setLowonganList(jobs.slice(0, 5)); 

        setStats({
          totalJobs: jobs.length,
          totalApplicants: apps.length,
          pendingVerif: apps.filter(a => !['ACCEPTED', 'REJECTED', 'Accepted', 'Rejected'].includes(a.status_seleksi)).length,
          activeJobs: jobs.filter(j => j.is_active && new Date(j.deadline) >= new Date().setHours(0,0,0,0)).length,
        });
      } catch (err) {
        console.error('Gagal memuat data dashboard staff:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user?.user_id]);

  const mainMenus = [
    { title: 'Kelola Lowongan', desc: 'CRUD data lowongan', icon: '⚙️', path: '/staff/kelola-lowongan' },
    { title: 'Tambah Lowongan', desc: 'Buat lowongan baru', icon: '➕', path: '/staff/tambah-lowongan' },
    { title: 'Verifikasi Pelamar', desc: 'Review lamaran', icon: '🔍', path: '/staff/verifikasi' },
  ];

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-[2.5rem] p-10 text-white shadow-xl shadow-indigo-900/10">
        <h1 className="text-3xl font-black mb-2 tracking-tight">Portal Administrasi Staff 🏛️</h1>
        <p className="text-indigo-100 font-medium opacity-90 text-sm">Selamat bertugas, {user?.nama}. Kelola pendaftaran dan lowongan magang dengan efisien.</p>
      </div>

      {/* Row Stat Kecil */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Lowongan', count: stats.totalJobs, icon: '💼', color: 'indigo' },
          { label: 'Total Pelamar', count: stats.totalApplicants, icon: '👥', color: 'blue' },
          { label: 'Perlu Verifikasi', count: stats.pendingVerif, icon: '📋', color: 'amber' },
          { label: 'Lowongan Aktif', count: stats.activeJobs, icon: '⚡', color: 'emerald' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border border-gray-100 rounded-3xl p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-1">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none block mb-1">{stat.label}</span>
              <span className="text-3xl font-black text-gray-800">{stat.count}</span>
            </div>
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Row Menu Utama */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {mainMenus.map((menu, idx) => (
          <div
            key={idx}
            onClick={() => navigate(menu.path)}
            className="bg-white p-5 border border-gray-100 rounded-3xl flex flex-col items-center text-center gap-3 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group"
          >
            <div className="text-2xl p-4 bg-gray-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
              {menu.icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider">{menu.title}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Tabel Lowongan Terbaru */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-black text-gray-800 tracking-tight">Daftar Lowongan Terkini</h2>
          <button onClick={() => navigate('/staff/kelola-lowongan')} className="px-4 py-2 bg-gray-50 text-indigo-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-50 transition-colors">Lihat Semua</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-50">
                <th className="py-5 px-8">Unit Perusahaan</th>
                <th className="py-5 px-8">Posisi Magang</th>
                <th className="py-5 px-8 text-center">Kuota</th>
                <th className="py-5 px-8 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {lowonganList.length > 0 ? (
                lowonganList.map((job, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="py-5 px-8 font-bold text-gray-800">{job.perusahaan}</td>
                    <td className="py-5 px-8 text-gray-500 font-medium group-hover:text-indigo-600 transition-colors">{job.judul_posisi}</td>
                    <td className="py-5 px-8 text-center font-black text-gray-400">{job.kuota}</td>
                    <td className="py-5 px-8 text-center">
                      <span className={`inline-block px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        new Date(job.deadline) < new Date().setHours(0,0,0,0)
                          ? 'bg-orange-100 text-orange-700'
                          : job.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {new Date(job.deadline) < new Date().setHours(0,0,0,0) ? 'Expired' : job.is_active ? 'Active' : 'Archived'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-gray-400 italic font-medium">Belum ada data lowongan yang terdaftar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
