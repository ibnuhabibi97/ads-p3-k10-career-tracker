import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menyisipkan Token JWT otomatis
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk menangani error secara global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const detail = error.response.data?.detail;
      const config = error.config;

      // Token kedaluwarsa atau tidak valid (kecuali pada request login)
      if (status === 401 && !config.url.includes('/auth/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Sesi Anda berakhir. Silakan login kembali.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else if (status === 403) {
        toast.error(detail || 'Akses ditolak. Anda tidak memiliki izin untuk fitur ini.');
      } else if (status === 500) {
        toast.error('Terjadi kesalahan pada server. Coba beberapa saat lagi.');
      } else if (detail && status !== 401) {
        // Jangan tampilkan toast otomatis untuk 401 (akan ditangani oleh pemanggil fungsi login)
        let message = 'Terjadi kesalahan.';
        if (typeof detail === 'string') {
          message = detail;
        } else if (Array.isArray(detail)) {
          message = detail[0]?.msg || JSON.stringify(detail);
        } else if (typeof detail === 'object') {
          message = detail.message || JSON.stringify(detail);
        }
        toast.error(message);
      }
    } else {
      toast.error('Koneksi internet terputus atau server tidak merespon.');
    }
    return Promise.reject(error);
  }
);

export default api;
