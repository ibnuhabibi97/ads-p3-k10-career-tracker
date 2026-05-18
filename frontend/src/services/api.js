import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
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

      // Token kedaluwarsa atau tidak valid
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Sesi Anda berakhir. Silakan login kembali.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else if (status === 403) {
        toast.error('Anda tidak memiliki akses ke fitur ini.');
      } else if (status === 500) {
        toast.error('Terjadi kesalahan pada server. Coba beberapa saat lagi.');
      } else if (detail) {
        // Tampilkan pesan error spesifik dari backend (jika bukan 401)
        if (status !== 401) toast.error(detail);
      }
    } else {
      toast.error('Koneksi internet terputus atau server tidak merespon.');
    }
    return Promise.reject(error);
  }
);

export default api;
