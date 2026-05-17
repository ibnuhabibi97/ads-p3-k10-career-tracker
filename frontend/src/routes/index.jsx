import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Home from '../pages/home/Home';
import Login from '../pages/auth/Login';

// Import Halaman Mahasiswa
import DashboardMahasiswa from '../pages/mahasiswa/DashboardMahasiswa';
import DaftarMagang from '../pages/mahasiswa/DaftarMagang';
import Dokumen from '../pages/mahasiswa/Dokumen';
import HubungiDosen from '../pages/mahasiswa/HubungiDoesn'; // typo di folder disesuaikan
import LaporanAkhir from '../pages/mahasiswa/LaporanAkhir';
import LihatLowongan from '../pages/mahasiswa/LihatLowongan';
import Logbook from '../pages/mahasiswa/Logbook';

// Import Halaman Dosen
import DashboardDosen from '../pages/dosen/DashboardDosen';
import BerikanNilai from '../pages/dosen/BerikanNilai';
import SuratRekomendasi from '../pages/dosen/SuratRekomendasi';
import TinjauProgres from '../pages/dosen/TinjauProgres';

// Import Halaman Staff
import DashboardStaff from '../pages/staff/DashboardStaff';
import KelolaLowongan from '../pages/staff/KelolaLowongan';
import TambahLowongan from '../pages/staff/TambahLowongan';
import VerifikasiPendaftaran from '../pages/staff/VerifikasiPendaftaran';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  // Main Routes untuk Mahasiswa
  {
    path: '/mahasiswa',
    children: [
      { path: 'dashboard', element: <DashboardMahasiswa /> },
      { path: 'daftar', element: <DaftarMagang /> },
      { path: 'dokumen', element: <Dokumen /> },
      { path: 'hubungi-dosen', element: <HubungiDosen /> },
      { path: 'laporan-akhir', element: <LaporanAkhir /> },
      { path: 'lowongan', element: <LihatLowongan /> },
      { path: 'logbook', element: <Logbook /> },
    ],
  },
  // Main Routes untuk Dosen
  {
    path: '/dosen',
    children: [
      { path: 'dashboard', element: <DashboardDosen /> },
      { path: 'nilai', element: <BerikanNilai /> },
      { path: 'rekomendasi', element: <SuratRekomendasi /> },
      { path: 'progres', element: <TinjauProgres /> },
    ],
  },
  // Main Routes untuk Staff
  {
    path: '/staff',
    children: [
      { path: 'dashboard', element: <DashboardStaff /> },
      { path: 'kelola-lowongan', element: <KelolaLowongan /> },
      { path: 'tambah-lowongan', element: <TambahLowongan /> },
      { path: 'verifikasi', element: <VerifikasiPendaftaran /> },
    ],
  },
  // Fallback jika route tidak ditemukan
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}