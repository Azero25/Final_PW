import axios from 'axios';

const api = axios.create({
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

// Anda bisa menambahkan interceptors di sini jika diperlukan,
// seperti untuk error handling global.
api.interceptors.response.use(
    response => response,
    error => {
        // Logika global jika terjadi error, misal session expired dsb.
        return Promise.reject(error);
    }
);

export default api;
