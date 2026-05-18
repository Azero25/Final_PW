import axios from 'axios';

// Membuat instance Axios custom dengan konfigurasi bawaan Laravel
const api = axios.create({
    baseURL: '/api', // Base URL untuk API route Laravel
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true, // Dibutuhkan jika menggunakan session/cookie-based auth (seperti Laravel Sanctum)
});

// Interceptor untuk menyisipkan CSRF Token (untuk request POST, PUT, DELETE)
api.interceptors.request.use(
    (config) => {
        // Mengambil CSRF token dari tag <meta name="csrf-token"> yang disiapkan di welcome.blade.php
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (token) {
            config.headers['X-CSRF-TOKEN'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor untuk menangani error response secara global
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Contoh penanganan error 401 (Unauthorized)
        if (error.response && error.response.status === 401) {
            // Hapus session dan arahkan ke login jika token/session kedaluwarsa
            sessionStorage.removeItem('user');
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
