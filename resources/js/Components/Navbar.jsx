import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

/**
 * Komponen Navbar Bersama (Public)
 * Digunakan oleh semua halaman publik (bukan admin).
 * Secara otomatis mendeteksi route aktif dan status login dari sessionStorage.
 *
 * Props:
 *   - (tidak ada, semua state dikelola secara internal)
 */
export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Baca sesi user setiap kali halaman berubah
        const sesi = sessionStorage.getItem('user');
        if (sesi) setUser(JSON.parse(sesi));
        else setUser(null);
    }, [location.pathname]);

    // Fungsi logout
    const handleLogout = () => {
        sessionStorage.removeItem('user');
        setUser(null);
        navigate('/');
    };

    // Daftar menu navigasi
    const menuItems = [
        { label: 'Beranda',    to: '/' },
        { label: 'Cara Kerja', to: '/cara-kerja' },
        { label: 'Statistik',  to: '/statistik' },
        { label: 'Lacak',      to: '/lacak' },
       
    ];

    // Tentukan apakah suatu link aktif
    const isActive = (to) => {
        if (to === '/') return location.pathname === '/';
        return location.pathname.startsWith(to);
    };

    return (
        <nav className="bg-white text-blue-700 font-public-sans antialiased fixed top-0 left-0 w-full z-50 border-b border-slate-200 shadow-sm">
            <div className="flex justify-between items-center px-6 lg:px-12 py-3 max-w-screen-2xl mx-auto w-full">

                {/* Kiri: Logo & Menu */}
                <div className="flex items-center gap-10">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-3xl text-blue-700" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
                        <span className="text-xl font-bold tracking-tight text-blue-700">LaporWarga</span>
                    </Link>

                    {/* Menu Navigasi */}
                    <div className="hidden md:flex items-center gap-6">
                        {menuItems.map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`pb-1 transition-all duration-200 hover:bg-blue-50/50 active:opacity-80 active:scale-95
                                    ${isActive(item.to)
                                        ? 'text-blue-700 font-semibold border-b-2 border-blue-700'
                                        : 'text-slate-600 hover:text-blue-600'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Kanan: Info User atau Tombol Login/Register */}
                <div className="flex items-center gap-4">
                    {user ? (
                        // Tampilkan nama user + tombol logout jika sudah login
                        <div className="flex items-center gap-3">
                            {/* Profil: admin bisa klik untuk ke dashboard, warga hanya tampilan */}
                            {user.role === 'admin' ? (
                                <Link
                                    to="/admin/dashboard"
                                    title="Masuk ke Panel Admin"
                                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg border border-slate-700 transition-colors group"
                                >
                                    <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-white text-xs font-bold">{user.nama?.charAt(0)}</span>
                                    </div>
                                    <div className="hidden md:flex flex-col items-start">
                                        <span className="text-white text-xs font-bold leading-tight">{user.nama}</span>
                                        <span className="text-blue-400 text-[10px] font-semibold uppercase tracking-wider">Admin Panel →</span>
                                    </div>
                                </Link>
                            ) : (
                                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                                    <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-white text-xs font-bold">{user.nama?.charAt(0)}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-blue-700 hidden md:block">{user.nama}</span>
                                </div>
                            )}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors font-semibold"
                            >
                                <span className="material-symbols-outlined text-base">logout</span>
                                Keluar
                            </button>
                        </div>
                    ) : (
                        // Tampilkan tombol Login & Register untuk tamu
                        <>
                            <Link to="/login" className="hidden md:inline-block px-6 py-2 text-primary border border-primary rounded-lg font-label-bold hover:bg-primary-fixed-dim transition-colors">
                                Login
                            </Link>
                            <Link to="/register" className="px-6 py-2 bg-primary-container text-on-primary rounded-lg font-label-bold hover:bg-primary transition-colors shadow-[0px_4px_20px_rgba(0,102,204,0.15)]">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
