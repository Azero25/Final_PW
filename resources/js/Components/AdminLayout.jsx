import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

/**
 * Layout bersama untuk semua halaman Admin.
 * Menyediakan sidebar, topbar, dan area konten.
 *
 * Props:
 *   - children   : Konten halaman yang akan dirender
 *   - pageTitle  : Judul halaman di topbar (string)
 *   - pageSubtitle: Subjudul opsional di topbar (string)
 */
export default function AdminLayout({ children, pageTitle = 'Admin', pageSubtitle = '' }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const sesi = sessionStorage.getItem('user');
        if (sesi) setUser(JSON.parse(sesi));
    }, []);

    // Konfigurasi menu sidebar + path route
    const menuItems = [
        { id: 'dashboard',   label: 'Dashboard',          icon: 'dashboard',          path: '/admin/dashboard' },
        { id: 'laporan',     label: 'Manajemen Laporan',  icon: 'assignment',         path: '/admin/laporan' },
        { id: 'pengguna',    label: 'Pengguna',            icon: 'group',              path: '/admin/pengguna' },
        { id: 'petugas',     label: 'Petugas & Dinas',    icon: 'badge',              path: '/admin/petugas' },
        { id: 'kategori',    label: 'Kategori',            icon: 'category',           path: '/admin/kategori' },
        { id: 'notifikasi',  label: 'Notifikasi',          icon: 'notifications',      path: '/admin/notifikasi' },
        { id: 'pengaturan',  label: 'Pengaturan',          icon: 'settings',           path: '/admin/pengaturan' },
    ];

    // Tentukan menu aktif berdasarkan path saat ini
    const isActive = (path) => location.pathname === path;

    // Fungsi logout
    const handleLogout = () => {
        sessionStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className="flex h-screen bg-slate-100 font-public-sans overflow-hidden">

            {/* ======================== SIDEBAR ======================== */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 z-40`}>
                {/* Logo */}
                <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700">
                    <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
                    </div>
                    {sidebarOpen && (
                        <div className="overflow-hidden">
                            <p className="font-bold text-sm leading-tight">LaporWarga</p>
                            <p className="text-slate-400 text-xs">Admin Panel</p>
                        </div>
                    )}
                </div>

                {/* Menu Navigasi */}
                <nav className="flex-grow px-3 py-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => (
                        <Link
                            key={item.id}
                            to={item.path}
                            title={!sidebarOpen ? item.label : undefined}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200
                                ${isActive(item.path)
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <span
                                className="material-symbols-outlined text-xl flex-shrink-0"
                                style={{ fontVariationSettings: isActive(item.path) ? "'FILL' 1" : "'FILL' 0" }}
                            >
                                {item.icon}
                            </span>
                            {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                {/* Profil Admin */}
                <div className="border-t border-slate-700 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">{user?.nama?.charAt(0) || 'A'}</span>
                        </div>
                        {sidebarOpen && (
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold leading-tight">{user?.nama || 'Admin Utama'}</p>
                                <p className="text-slate-400 text-xs truncate">{user?.email || 'admin@lapor.go.id'}</p>
                            </div>
                        )}
                    </div>
                    {sidebarOpen && (
                        <button
                            onClick={handleLogout}
                            className="mt-3 flex items-center gap-2 text-slate-400 hover:text-red-400 text-xs transition-colors w-full"
                        >
                            <span className="material-symbols-outlined text-base">logout</span>
                            Keluar ke Halaman Publik
                        </button>
                    )}
                </div>
            </aside>

            {/* ======================== MAIN CONTENT ======================== */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Topbar */}
                <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 p-2 rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800">{pageTitle}</h1>
                            {pageSubtitle && <p className="text-xs text-slate-400">{pageSubtitle}</p>}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Notifikasi */}
                        <button className="relative text-slate-500 hover:text-slate-800 hover:bg-slate-100 p-2 rounded-lg transition-colors">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        {/* Avatar */}
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center cursor-pointer">
                            <span className="text-white font-bold text-sm">{user?.nama?.charAt(0) || 'A'}</span>
                        </div>
                    </div>
                </header>

                {/* Konten Scrollable */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
