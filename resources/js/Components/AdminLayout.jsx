import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

/**
 * Layout bersama untuk semua halaman Admin — Mobile Responsive.
 * Di mobile: sidebar menjadi drawer overlay dengan backdrop.
 * Di desktop: sidebar persisten di sisi kiri.
 */
export default function AdminLayout({ children, pageTitle = 'Admin', pageSubtitle = '' }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);   // mobile: default tertutup
    const [isDesktop, setIsDesktop] = useState(false);
    const [user, setUser] = useState(null);

    // Deteksi ukuran layar
    useEffect(() => {
        const check = () => {
            const desktop = window.innerWidth >= 1024;
            setIsDesktop(desktop);
            if (desktop) setSidebarOpen(true); // desktop: default terbuka
        };
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Tutup sidebar mobile saat pindah halaman
    useEffect(() => {
        if (!isDesktop) setSidebarOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const sesi = sessionStorage.getItem('user');
        if (sesi) setUser(JSON.parse(sesi));
    }, []);

    const menuItems = [
        { id: 'dashboard',  label: 'Dashboard',         icon: 'dashboard',      path: '/admin/dashboard' },
        { id: 'laporan',    label: 'Manajemen Laporan',  icon: 'assignment',     path: '/admin/laporan' },
        { id: 'pengguna',   label: 'Pengguna',           icon: 'group',          path: '/admin/pengguna' },
        { id: 'petugas',    label: 'Petugas & Dinas',   icon: 'badge',          path: '/admin/petugas' },
        { id: 'kategori',   label: 'Kategori',           icon: 'category',       path: '/admin/kategori' },
        { id: 'notifikasi', label: 'Notifikasi',         icon: 'notifications',  path: '/admin/notifikasi' },
        { id: 'pengaturan', label: 'Pengaturan',         icon: 'settings',       path: '/admin/pengaturan' },
    ];

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        navigate('/');
    };

    // Sidebar collapsed hanya berlaku di desktop
    const [collapsed, setCollapsed] = useState(false);
    const sidebarWidth = isDesktop ? (collapsed ? 'w-20' : 'w-64') : 'w-72';

    return (
        <div className="flex h-screen bg-slate-100 font-public-sans overflow-hidden">

            {/* ====== BACKDROP (mobile) ====== */}
            {!isDesktop && sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ====== SIDEBAR ====== */}
            <aside className={`
                ${sidebarWidth}
                bg-slate-900 text-white flex flex-col flex-shrink-0 z-40
                transition-all duration-300 ease-in-out
                ${isDesktop
                    ? 'relative'                                          // desktop: dalam flow normal
                    : `fixed inset-y-0 left-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`  // mobile: drawer
                }
            `}>
                {/* Logo */}
                <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700 flex-shrink-0">
                    <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
                    </div>
                    {(!collapsed || !isDesktop) && (
                        <div className="overflow-hidden">
                            <p className="font-bold text-sm leading-tight">LaporWarga</p>
                            <p className="text-slate-400 text-xs">Admin Panel</p>
                        </div>
                    )}
                    {/* Tombol tutup (mobile) */}
                    {!isDesktop && (
                        <button onClick={() => setSidebarOpen(false)}
                            className="ml-auto p-1 text-slate-400 hover:text-white transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    )}
                </div>

                {/* Menu Navigasi */}
                <nav className="flex-grow px-3 py-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => (
                        <Link
                            key={item.id}
                            to={item.path}
                            title={collapsed && isDesktop ? item.label : undefined}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200
                                ${isActive(item.path)
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <span className="material-symbols-outlined text-xl flex-shrink-0"
                                style={{ fontVariationSettings: isActive(item.path) ? "'FILL' 1" : "'FILL' 0" }}>
                                {item.icon}
                            </span>
                            {(!collapsed || !isDesktop) && <span className="whitespace-nowrap">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                {/* Profil Admin */}
                <div className="border-t border-slate-700 p-4 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">{user?.nama?.charAt(0) || 'A'}</span>
                        </div>
                        {(!collapsed || !isDesktop) && (
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold leading-tight">{user?.nama || 'Admin Utama'}</p>
                                <p className="text-slate-400 text-xs truncate">{user?.email || 'admin@lapor.go.id'}</p>
                            </div>
                        )}
                    </div>
                    {(!collapsed || !isDesktop) && (
                        <button onClick={handleLogout}
                            className="mt-3 flex items-center gap-2 text-slate-400 hover:text-red-400 text-xs transition-colors w-full">
                            <span className="material-symbols-outlined text-base">logout</span>
                            Keluar ke Halaman Publik
                        </button>
                    )}
                </div>
            </aside>

            {/* ====== MAIN CONTENT ====== */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">

                {/* Topbar */}
                <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {/* Toggle sidebar */}
                        <button
                            onClick={() => isDesktop ? setCollapsed(!collapsed) : setSidebarOpen(!sidebarOpen)}
                            className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 p-2 rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <div className="min-w-0">
                            <h1 className="text-base sm:text-lg font-bold text-slate-800 truncate">{pageTitle}</h1>
                            {pageSubtitle && <p className="text-xs text-slate-400 hidden sm:block">{pageSubtitle}</p>}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button className="relative text-slate-500 hover:text-slate-800 hover:bg-slate-100 p-2 rounded-lg transition-colors">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center cursor-pointer">
                            <span className="text-white font-bold text-sm">{user?.nama?.charAt(0) || 'A'}</span>
                        </div>
                    </div>
                </header>

                {/* Konten Scrollable */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
