import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Komponen pembungkus untuk memproteksi route berdasarkan role.
 * @param {string} role - 'admin' atau 'petugas'
 */
const ProtectedRoute = ({ role }) => {
    // Cek auth untuk admin (diasumsikan login user biasa, dan rolenya admin)
    if (role === 'admin') {
        const sesiUser = sessionStorage.getItem('user');
        if (!sesiUser) {
            return <Navigate to="/login" replace />;
        }
        
        try {
            const user = JSON.parse(sesiUser);
            if (user.role !== 'admin') {
                // Jika bukan admin, tendang ke home
                return <Navigate to="/" replace />;
            }
            return <Outlet />;
        } catch (e) {
            return <Navigate to="/login" replace />;
        }
    }

    // Cek auth untuk petugas (sesi petugas terpisah dari user biasa)
    if (role === 'petugas') {
        const sesiPetugas = sessionStorage.getItem('petugas');
        if (!sesiPetugas) {
            return <Navigate to="/login-petugas" replace />;
        }
        return <Outlet />;
    }

    // Default jika tidak ada rule (fallback aman)
    return <Navigate to="/" replace />;
};

export default ProtectedRoute;
