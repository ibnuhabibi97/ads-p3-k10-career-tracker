import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import AppLayout from '../components/AppLayout';
import { DashboardSkeleton } from '../components/Skeleton';

// Lazy loading components
const Home = lazy(() => import('../pages/home/Home'));
const Login = lazy(() => import('../pages/auth/Login'));
const RegisterMahasiswa = lazy(() => import('../pages/auth/RegisterMahasiswa'));
const RegisterDosenStaff = lazy(() => import('../pages/auth/RegisterDosenStaff'));
const ChangePassword = lazy(() => import('../pages/auth/ChangePassword'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'));

// Halaman Mahasiswa
const DashboardMahasiswa = lazy(() => import('../pages/mahasiswa/DashboardMahasiswa'));
const DaftarMagang = lazy(() => import('../pages/mahasiswa/DaftarMagang'));
const Dokumen = lazy(() => import('../pages/mahasiswa/Dokumen'));
const HubungiDosen = lazy(() => import('../pages/mahasiswa/HubungiDoesn'));
const LaporanAkhir = lazy(() => import('../pages/mahasiswa/LaporanAkhir'));
const LihatLowongan = lazy(() => import('../pages/mahasiswa/LihatLowongan'));
const Logbook = lazy(() => import('../pages/mahasiswa/Logbook'));

// Halaman Dosen
const DashboardDosen = lazy(() => import('../pages/dosen/DashboardDosen'));
const BerikanNilai = lazy(() => import('../pages/dosen/BerikanNilai'));
const SuratRekomendasi = lazy(() => import('../pages/dosen/SuratRekomendasi'));
const TinjauProgres = lazy(() => import('../pages/dosen/TinjauProgres'));

// Halaman Staff
const DashboardStaff = lazy(() => import('../pages/staff/DashboardStaff'));
const KelolaLowongan = lazy(() => import('../pages/staff/KelolaLowongan'));
const TambahLowongan = lazy(() => import('../pages/staff/TambahLowongan'));
const VerifikasiPendaftaran = lazy(() => import('../pages/staff/VerifikasiPendaftaran'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Home />
      </Suspense>
    ),
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ForgotPassword />
      </Suspense>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ResetPassword />
      </Suspense>
    ),
  },
  {
    path: '/register/mahasiswa',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <RegisterMahasiswa />
      </Suspense>
    ),
  },
  {
    path: '/register/dosen-staff',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <RegisterDosenStaff />
      </Suspense>
    ),
  },
  // Main Protected Layout Routes
  {
    path: '/mahasiswa',
    element: (
      <ProtectedRoute allowedRoles={['MAHASISWA']}>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <Suspense fallback={<DashboardSkeleton />}><DashboardMahasiswa /></Suspense> },
      { path: 'daftar', element: <Suspense fallback={<DashboardSkeleton />}><DaftarMagang /></Suspense> },
      { path: 'dokumen', element: <Suspense fallback={<DashboardSkeleton />}><Dokumen /></Suspense> },
      { path: 'hubungi-dosen', element: <Suspense fallback={<DashboardSkeleton />}><HubungiDosen /></Suspense> },
      { path: 'laporan-akhir', element: <Suspense fallback={<DashboardSkeleton />}><LaporanAkhir /></Suspense> },
      { path: 'lowongan', element: <Suspense fallback={<DashboardSkeleton />}><LihatLowongan /></Suspense> },
      { path: 'logbook', element: <Suspense fallback={<DashboardSkeleton />}><Logbook /></Suspense> },
      { path: 'ubah-password', element: <Suspense fallback={<DashboardSkeleton />}><ChangePassword /></Suspense> },
    ],
  },
  {
    path: '/dosen',
    element: (
      <ProtectedRoute allowedRoles={['DOSEN']}>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <Suspense fallback={<DashboardSkeleton />}><DashboardDosen /></Suspense> },
      { path: 'nilai', element: <Suspense fallback={<DashboardSkeleton />}><BerikanNilai /></Suspense> },
      { path: 'rekomendasi', element: <Suspense fallback={<DashboardSkeleton />}><SuratRekomendasi /></Suspense> },
      { path: 'progres', element: <Suspense fallback={<DashboardSkeleton />}><TinjauProgres /></Suspense> },
      { path: 'ubah-password', element: <Suspense fallback={<DashboardSkeleton />}><ChangePassword /></Suspense> },
    ],
  },
  {
    path: '/staff',
    element: (
      <ProtectedRoute allowedRoles={['STAFF']}>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <Suspense fallback={<DashboardSkeleton />}><DashboardStaff /></Suspense> },
      { path: 'kelola-lowongan', element: <Suspense fallback={<DashboardSkeleton />}><KelolaLowongan /></Suspense> },
      { path: 'tambah-lowongan', element: <Suspense fallback={<DashboardSkeleton />}><TambahLowongan /></Suspense> },
      { path: 'verifikasi', element: <Suspense fallback={<DashboardSkeleton />}><VerifikasiPendaftaran /></Suspense> },
      { path: 'ubah-password', element: <Suspense fallback={<DashboardSkeleton />}><ChangePassword /></Suspense> },
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
