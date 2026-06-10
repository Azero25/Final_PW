import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

/**
 * Layout wrapper khusus Petugas — Mobile Responsive.
 * Tema: Blue/Indigo gradient (disamakan dengan AdminLayout yang biru).
 * Di mobile: sidebar menjadi drawer overlay dengan backdrop.
 * Di desktop: sidebar persisten di sisi kiri.
 */
export default function PetugasLayout({ children, pageTitle = 'Petugas', pageSubtitle = '' }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        return typeof window !== 'undefined' ? window.innerWidth >= 1024 : false;
    });
    const [isDesktop, setIsDesktop] = useState(() => {
        return typeof window !== 'undefined' ? window.innerWidth >= 1024 : false;
    });
    const [petugas, setPetugas] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Notifikasi dummy petugas
    const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
    const defaultNotifs = [
        { id: 'NP-001', judul: 'Tugas baru ditugaskan', isi: 'Laporan LPW-2024-001284: Jalan Rusak di Jl. Solo telah ditugaskan kepada dinas Anda.', tipe: 'tugas', waktu: '5 menit lalu', dibaca: false },
        { id: 'NP-002', judul: 'Batas waktu mendekati', isi: 'LPW-2024-001277: Banjir di Gang Mawar harus diselesaikan dalam 2 hari.', tipe: 'deadline', waktu: '1 jam lalu', dibaca: false },
        { id: 'NP-003', judul: 'Tugas diperbarui admin', isi: 'Prioritas LPW-2024-001280 diubah menjadi Tinggi oleh Admin.', tipe: 'update', waktu: '3 jam lalu', dibaca: true },
    ];

    const [notifications, setNotifications] = useState(defaultNotifs);
    const unreadCount = notifications.filter(n => !n.dibaca).length;

    const TIPE_CONFIG = {
        tugas:    { icon: 'assignment_add', bg: 'bg-blue-100',   color: 'text-blue-600',   dot: 'bg-blue-500'   },
        deadline: { icon: 'schedule',       bg: 'bg-orange-100', color: 'text-orange-600',  dot: 'bg-orange-500' },
        update:   { icon: 'update',         bg: 'bg-blue-100',   color: 'text-blue-600',    dot: 'bg-blue-500'   },
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, dibaca: true })));
    };

    // Deteksi ukuran layar
    useEffect(() => {
        const check = () => {
            const desktop = window.innerWidth >= 1024;
            setIsDesktop(desktop);
            setSidebarOpen(desktop);
        };
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Tutup sidebar mobile saat pindah halaman
    useEffect(() => {
        if (!isDesktop) setSidebarOpen(false);
    }, [location.pathname, isDesktop]);

    // Ambil data petugas dari sessionStorage
    useEffect(() => {
        const sesi = sessionStorage.getItem('petugas');
        if (sesi) {
            setPetugas(JSON.parse(sesi));
        } else {
            navigate('/login-petugas');
        }
    }, [navigate]);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard',      icon: 'dashboard',  path: '/petugas/dashboard' },
        { id: 'laporan',   label: 'Daftar Laporan', icon: 'assignment', path: '/petugas/laporan' },
    ];

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        sessionStorage.removeItem('petugas');
        navigate('/');
    };

    // Sidebar collapsed hanya di desktop
    const [collapsed, setCollapsed] = useState(() => {
        return typeof window !== 'undefined' ? localStorage.getItem('petugas_sidebar_collapsed') === 'true' : false;
    });
    const sidebarWidth = isDesktop ? (collapsed ? 'w-20' : 'w-64') : 'w-72';

    return (
        <div className="flex h-screen bg-slate-100 font-[Inter,sans-serif] overflow-hidden">

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
                    ? 'relative'
                    : `fixed inset-y-0 left-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
                }
            `}>
                {/* Logo */}
                <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700 flex-shrink-0">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
                    </div>
                    {(!collapsed || !isDesktop) && (
                        <div className="overflow-hidden">
                            <p className="font-bold text-sm leading-tight">LaporWarga</p>
                            <p className="text-blue-400 text-xs">Panel Petugas</p>
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

                {/* Profil Petugas */}
                <div className="border-t border-slate-700 p-4 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">{petugas?.nama?.charAt(0) || 'P'}</span>
                        </div>
                        {(!collapsed || !isDesktop) && (
                            <div className="overflow-hidden flex-grow">
                                <p className="text-sm font-semibold leading-tight truncate">{petugas?.nama || 'Petugas'}</p>
                                <p className="text-blue-400 text-xs truncate">{petugas?.dinas || 'Dinas'}</p>
                            </div>
                        )}
                    </div>
                    {(!collapsed || !isDesktop) && (
                        <button onClick={handleLogout}
                            className="mt-3 flex items-center gap-2 text-slate-400 hover:text-red-400 text-xs transition-colors w-full">
                            <span className="material-symbols-outlined text-base">logout</span>
                            Keluar
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
                            onClick={() => {
                                if (isDesktop) {
                                    setCollapsed(prev => {
                                        const next = !prev;
                                        localStorage.setItem('petugas_sidebar_collapsed', String(next));
                                        return next;
                                    });
                                } else {
                                    setSidebarOpen(!sidebarOpen);
                                }
                            }}
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
                        {/* Notifikasi */}
                        <div className="relative">
                            <button
                                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                                className="relative text-slate-500 hover:text-slate-800 hover:bg-slate-100 p-2 rounded-lg transition-colors focus:outline-none"
                            >
                                <span className="material-symbols-outlined">notifications</span>
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {notifDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setNotifDropdownOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
                                        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <h3 className="font-bold text-slate-800 text-sm">Notifikasi</h3>
                                                {unreadCount > 0 && (
                                                    <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                                        {unreadCount} Baru
                                                    </span>
                                                )}
                                            </div>
                                            {unreadCount > 0 && (
                                                <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:underline font-semibold">
                                                    Tandai dibaca
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-50">
                                            {notifications.map(n => {
                                                const cfg = TIPE_CONFIG[n.tipe] || TIPE_CONFIG.tugas;
                                                return (
                                                    <div
                                                        key={n.id}
                                                        onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, dibaca: true } : x))}
                                                        className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer ${!n.dibaca ? 'bg-blue-50/30' : ''}`}
                                                    >
                                                        <div className="flex-shrink-0 mt-1.5">
                                                            {!n.dibaca ? (
                                                                <span className={`block w-2 h-2 rounded-full ${cfg.dot}`}></span>
                                                            ) : (
                                                                <span className="block w-2 h-2 rounded-full bg-transparent"></span>
                                                            )}
                                                        </div>
                                                        <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                                                            <span className={`material-symbols-outlined text-base ${cfg.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                                                {cfg.icon}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-xs font-semibold ${!n.dibaca ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>{n.judul}</p>
                                                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{n.isi}</p>
                                                            <span className="text-[10px] text-slate-400 block mt-1">{n.waktu}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Avatar dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center cursor-pointer focus:outline-none hover:ring-2 hover:ring-blue-500/30 transition-all"
                            >
                                <span className="text-white font-bold text-sm">{petugas?.nama?.charAt(0) || 'P'}</span>
                            </button>

                            {dropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
                                        <div className="px-4 py-3 border-b border-slate-100">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">PETUGAS</p>
                                            <p className="text-sm font-bold text-slate-800 truncate">{petugas?.nama || 'Petugas'}</p>
                                            <p className="text-xs text-blue-600 truncate">{petugas?.dinas}</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">{petugas?.jabatan}</p>
                                        </div>
                                        <button
                                            onClick={() => { setDropdownOpen(false); handleLogout(); }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-semibold"
                                        >
                                            <span className="material-symbols-outlined text-lg text-red-500">logout</span>
                                            Logout Petugas
                                        </button>
                                    </div>
                                </>
                            )}
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
