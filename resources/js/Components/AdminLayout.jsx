import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../axios';

/**
 * Layout bersama untuk semua halaman Admin — Mobile Responsive.
 * Di mobile: sidebar menjadi drawer overlay dengan backdrop.
 * Di desktop: sidebar persisten di sisi kiri.
 */
export default function AdminLayout({ children, pageTitle = 'Admin', pageSubtitle = '' }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        return typeof window !== 'undefined' ? window.innerWidth >= 1024 : false;
    });   // mobile: default tertutup, desktop: terbuka
    const [isDesktop, setIsDesktop] = useState(() => {
        return typeof window !== 'undefined' ? window.innerWidth >= 1024 : false;
    });
    const [user, setUser] = useState(null);

    // Dropdown & Profile Modal State
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [adminProfile, setAdminProfile] = useState({
        nama: '',
        email: '',
        telepon: '',
        alamat: '',
        desa: '',
        kelurahan: '',
        kecamatan: '',
        kabupaten: '',
        provinsi: '',
        nik: ''
    });
    const [profileErrors, setProfileErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);

    // Notifications State & Sync
    const [notifications, setNotifications] = useState([]);
    const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/api/notifications?role=admin');
            setNotifications(response.data);
            localStorage.setItem('admin_notifications', JSON.stringify(response.data));
        } catch (error) {
            console.error("Gagal mengambil data notifikasi:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();

        const interval = setInterval(fetchNotifications, 5000);

        const syncNotifs = () => {
            const stored = localStorage.getItem('admin_notifications');
            if (stored) setNotifications(JSON.parse(stored));
        };
        window.addEventListener('notificationsUpdated', syncNotifs);
        window.addEventListener('storage', syncNotifs);

        return () => {
            clearInterval(interval);
            window.removeEventListener('notificationsUpdated', syncNotifs);
            window.removeEventListener('storage', syncNotifs);
        };
    }, []);

    const markAllAsRead = async () => {
        try {
            await api.put('/api/notifications/read-all');
            const updated = notifications.map(n => ({ ...n, dibaca: true }));
            setNotifications(updated);
            localStorage.setItem('admin_notifications', JSON.stringify(updated));
            window.dispatchEvent(new Event('notificationsUpdated'));
        } catch (error) {
            console.error("Gagal menandai semua dibaca:", error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/api/notifications/${id}/read`);
            const updated = notifications.map(n => n.id === id ? { ...n, dibaca: true } : n);
            setNotifications(updated);
            localStorage.setItem('admin_notifications', JSON.stringify(updated));
            window.dispatchEvent(new Event('notificationsUpdated'));
        } catch (error) {
            console.error("Gagal menandai dibaca:", error);
        }
    };

    const unreadCount = notifications.filter(n => !n.dibaca).length;

    const TIPE_CONFIG = {
        laporan:    { icon: 'assignment',    bg: 'bg-blue-100',    color: 'text-blue-600',   label: 'Laporan Baru',   dot: 'bg-blue-500'   },
        update:     { icon: 'update',        bg: 'bg-green-100',   color: 'text-green-600',  label: 'Update Status',  dot: 'bg-green-500'  },
        pengguna:   { icon: 'person',        bg: 'bg-purple-100',  color: 'text-purple-600', label: 'Pengguna',       dot: 'bg-purple-500' },
        darurat:    { icon: 'emergency',     bg: 'bg-red-100',     color: 'text-red-600',    label: 'Darurat',        dot: 'bg-red-500'    },
        peringatan: { icon: 'warning',       bg: 'bg-yellow-100',  color: 'text-yellow-600', label: 'Peringatan',     dot: 'bg-yellow-500' },
        petugas:    { icon: 'badge',         bg: 'bg-orange-100',  color: 'text-orange-600', label: 'Petugas',        dot: 'bg-orange-500' },
        sistem:     { icon: 'settings',      bg: 'bg-slate-100',   color: 'text-slate-600',  label: 'Sistem',         dot: 'bg-slate-400'  },
    };

    // Deteksi ukuran layar
    useEffect(() => {
        const check = () => {
            const desktop = window.innerWidth >= 1024;
            setIsDesktop(desktop);
            if (desktop) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };
        // Run check once on mount to handle dynamic edge cases safely
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Tutup sidebar mobile saat pindah halaman
    useEffect(() => {
        if (!isDesktop) setSidebarOpen(false);
    }, [location.pathname, isDesktop]);

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
    ];

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        navigate('/');
    };

    const openProfileModal = () => {
        const email = user?.email || 'admin@lapor.go.id';
        const stored = localStorage.getItem(`profile_${email}`);
        if (stored) {
            setAdminProfile(JSON.parse(stored));
        } else {
            setAdminProfile({
                nama: user?.nama || 'Admin Utama',
                email: email,
                telepon: '089876543210',
                alamat: 'Kantor Balaikota Yogyakarta, Jl. Kenari No. 56',
                desa: 'Muja Muju',
                kelurahan: 'Muja Muju',
                kecamatan: 'Umbulharjo',
                kabupaten: 'Kota Yogyakarta',
                provinsi: 'DI Yogyakarta',
                nik: '3471010101010001'
            });
        }
        setProfileErrors({});
        setProfileModalOpen(true);
    };

    const validateProfile = () => {
        const errors = {};
        if (!adminProfile.nama?.trim()) errors.nama = 'Nama wajib diisi';
        if (!adminProfile.email?.trim()) errors.email = 'Email wajib diisi';
        if (!adminProfile.telepon?.trim()) errors.telepon = 'No. Telepon wajib diisi';
        if (!adminProfile.alamat?.trim()) errors.alamat = 'Alamat Lengkap wajib diisi';
        if (!adminProfile.desa?.trim()) errors.desa = 'Desa/Kelurahan wajib diisi';
        if (!adminProfile.kecamatan?.trim()) errors.kecamatan = 'Kecamatan wajib diisi';
        if (!adminProfile.kabupaten?.trim()) errors.kabupaten = 'Kabupaten wajib diisi';
        if (!adminProfile.provinsi?.trim()) errors.provinsi = 'Provinsi wajib diisi';

        if (!adminProfile.nik?.trim()) {
            errors.nik = 'NIK wajib diisi';
        } else if (!/^\d+$/.test(adminProfile.nik)) {
            errors.nik = 'NIK harus berupa angka';
        } else if (adminProfile.nik.length !== 16) {
            errors.nik = 'NIK harus berjumlah 16 digit';
        }

        setProfileErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();
        if (!validateProfile()) return;

        setSaving(true);
        setTimeout(() => {
            const updatedUser = {
                ...user,
                nama: adminProfile.nama,
                email: adminProfile.email
            };
            sessionStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);

            const profileKey = `profile_${adminProfile.email}`;
            localStorage.setItem(profileKey, JSON.stringify({
                ...adminProfile,
                role: 'admin',
                tglDaftar: '01 Desember 2023',
                status: 'Terverifikasi'
            }));

            // Dispatch an event so other pages get notified of changes
            window.dispatchEvent(new Event('profileUpdated'));

            setSaving(false);
            setProfileModalOpen(false);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }, 1000);
    };

    // Sidebar collapsed hanya berlaku di desktop
    const [collapsed, setCollapsed] = useState(() => {
        return typeof window !== 'undefined' ? localStorage.getItem('admin_sidebar_collapsed') === 'true' : false;
    });
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
                bg-slate-900 text-white flex flex-col shrink-0 z-40
                transition-all duration-300 ease-in-out
                ${isDesktop
                    ? 'relative'                                          // desktop: dalam flow normal
                    : `fixed inset-y-0 left-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`  // mobile: drawer
                }
            `}>
                {/* Logo */}
                <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700 shrink-0">
                    <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center shrink-0">
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
                <nav className="grow px-3 py-4 space-y-1 overflow-y-auto">
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
                            <span className="material-symbols-outlined text-xl shrink-0"
                                style={{ fontVariationSettings: isActive(item.path) ? "'FILL' 1" : "'FILL' 0" }}>
                                {item.icon}
                            </span>
                            {(!collapsed || !isDesktop) && <span className="whitespace-nowrap">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                {/* Profil Admin */}
                <div className="border-t border-slate-700 p-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-linear-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-white font-bold text-sm">{user?.nama?.charAt(0) || 'A'}</span>
                        </div>
                        {(!collapsed || !isDesktop) && (
                            <div className="overflow-hidden grow">
                                <p className="text-sm font-semibold leading-tight">{user?.nama || 'Admin Utama'}</p>
                                <p className="text-slate-400 text-xs truncate">{user?.email || 'admin@lapor.go.id'}</p>
                            </div>
                        )}
                        {(!collapsed || !isDesktop) && (
                            <button
                                onClick={openProfileModal}
                                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors shrink-0"
                                title="Edit Profil Admin"
                            >
                                <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
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
                <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        {/* Toggle sidebar */}
                        <button
                            onClick={() => {
                                if (isDesktop) {
                                    setCollapsed(prev => {
                                        const next = !prev;
                                        localStorage.setItem('admin_sidebar_collapsed', String(next));
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
                        <div className="relative">
                            <button
                                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                                className="relative text-slate-500 hover:text-slate-800 hover:bg-slate-100 p-2 rounded-lg transition-colors focus:outline-none"
                            >
                                <span className="material-symbols-outlined">notifications</span>
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {notifDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setNotifDropdownOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                                        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <h3 className="font-bold text-slate-800 text-sm">Notifikasi</h3>
                                                {unreadCount > 0 && (
                                                    <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                                        {unreadCount} Baru
                                                    </span>
                                                )}
                                            </div>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={markAllAsRead}
                                                    className="text-xs text-blue-600 hover:underline font-semibold"
                                                >
                                                    Tandai dibaca
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                                            {notifications.length === 0 ? (
                                                <div className="py-8 text-center text-slate-400">
                                                    <span className="material-symbols-outlined text-3xl block mb-1">notifications_off</span>
                                                    <p className="text-xs">Tidak ada notifikasi</p>
                                                </div>
                                            ) : (
                                                notifications.map(n => {
                                                    const cfg = TIPE_CONFIG[n.tipe] || TIPE_CONFIG.sistem;
                                                    return (
                                                        <div
                                                            key={n.id}
                                                            onClick={() => markAsRead(n.id)}
                                                            className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer ${!n.dibaca ? 'bg-blue-50/20' : ''}`}
                                                        >
                                                            {/* Dot */}
                                                            <div className="shrink-0 mt-1.5">
                                                                {!n.dibaca ? (
                                                                    <span className={`block w-2 h-2 rounded-full ${cfg.dot}`}></span>
                                                                ) : (
                                                                    <span className="block w-2 h-2 rounded-full bg-transparent"></span>
                                                                )}
                                                            </div>
                                                            {/* Icon */}
                                                            <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
                                                                <span className={`material-symbols-outlined text-base ${cfg.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                                                    {cfg.icon}
                                                                </span>
                                                            </div>
                                                            {/* Content */}
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-xs font-semibold ${!n.dibaca ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>{n.judul}</p>
                                                                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{n.isi}</p>
                                                                <span className="text-[10px] text-slate-400 block mt-1">{n.waktu}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                        <div className="px-4 py-2 border-t border-slate-100 text-center bg-slate-50 rounded-b-2xl">
                                            <Link
                                                to="/admin/notifikasi"
                                                onClick={() => setNotifDropdownOpen(false)}
                                                className="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline inline-flex items-center gap-1"
                                            >
                                                Lihat Semua Notifikasi
                                                <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                            </Link>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="w-8 h-8 sm:w-9 sm:h-9 bg-linear-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center cursor-pointer focus:outline-none hover:ring-2 hover:ring-blue-500/30 transition-all"
                            >
                                <span className="text-white font-bold text-sm">{user?.nama?.charAt(0) || 'A'}</span>
                            </button>

                            {dropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                                        <div className="px-4 py-2 border-b border-slate-100">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">LOGGED IN AS</p>
                                            <p className="text-sm font-bold text-slate-800 truncate">{user?.nama || 'Admin Utama'}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                openProfileModal();
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors font-semibold"
                                        >
                                            <span className="material-symbols-outlined text-lg text-slate-400">person</span>
                                            Edit Profil
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-semibold border-t border-slate-100"
                                        >
                                            <span className="material-symbols-outlined text-lg text-red-500">logout</span>
                                            Logout Admin
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

            {/* ====== EDIT PROFILE ADMIN MODAL ====== */}
            {profileModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setProfileModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                            <div>
                                <h2 className="font-bold text-slate-800 text-lg">Edit Profil Administrator</h2>
                                <p className="text-xs text-slate-400 mt-0.5">Perbarui data profil dan demografi admin</p>
                            </div>
                            <button onClick={() => setProfileModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleSaveProfile}>
                            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Nama */}
                                    <div>
                                        <label className="text-xs text-slate-500 font-semibold block mb-1.5">Nama Lengkap</label>
                                        <input
                                            type="text"
                                            value={adminProfile.nama}
                                            onChange={(e) => setAdminProfile({ ...adminProfile, nama: e.target.value })}
                                            className={`w-full px-3.5 py-2 text-sm border rounded-xl focus:outline-none focus:border-blue-400 transition-colors ${profileErrors.nama ? 'border-red-400 bg-red-50/20' : 'border-slate-200'}`}
                                        />
                                        {profileErrors.nama && <p className="text-xs text-red-500 mt-1">{profileErrors.nama}</p>}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="text-xs text-slate-500 font-semibold block mb-1.5">Email</label>
                                        <input
                                            type="email"
                                            value={adminProfile.email}
                                            onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
                                            className={`w-full px-3.5 py-2 text-sm border rounded-xl focus:outline-none focus:border-blue-400 transition-colors ${profileErrors.email ? 'border-red-400 bg-red-50/20' : 'border-slate-200'}`}
                                        />
                                        {profileErrors.email && <p className="text-xs text-red-500 mt-1">{profileErrors.email}</p>}
                                    </div>

                                    {/* NIK */}
                                    <div>
                                        <label className="text-xs text-slate-500 font-semibold block mb-1.5">NIK (16 Digit)</label>
                                        <input
                                            type="text"
                                            maxLength={16}
                                            value={adminProfile.nik}
                                            onChange={(e) => setAdminProfile({ ...adminProfile, nik: e.target.value })}
                                            className={`w-full px-3.5 py-2 text-sm border rounded-xl focus:outline-none focus:border-blue-400 transition-colors ${profileErrors.nik ? 'border-red-400 bg-red-50/20' : 'border-slate-200'}`}
                                        />
                                        {profileErrors.nik && <p className="text-xs text-red-500 mt-1">{profileErrors.nik}</p>}
                                    </div>

                                    {/* Telepon */}
                                    <div>
                                        <label className="text-xs text-slate-500 font-semibold block mb-1.5">No. Telepon</label>
                                        <input
                                            type="text"
                                            value={adminProfile.telepon}
                                            onChange={(e) => setAdminProfile({ ...adminProfile, telepon: e.target.value })}
                                            className={`w-full px-3.5 py-2 text-sm border rounded-xl focus:outline-none focus:border-blue-400 transition-colors ${profileErrors.telepon ? 'border-red-400 bg-red-50/20' : 'border-slate-200'}`}
                                        />
                                        {profileErrors.telepon && <p className="text-xs text-red-500 mt-1">{profileErrors.telepon}</p>}
                                    </div>

                                    {/* Alamat Lengkap */}
                                    <div className="md:col-span-2">
                                        <label className="text-xs text-slate-500 font-semibold block mb-1.5">Alamat Lengkap</label>
                                        <textarea
                                            rows={2}
                                            value={adminProfile.alamat}
                                            onChange={(e) => setAdminProfile({ ...adminProfile, alamat: e.target.value })}
                                            className={`w-full px-3.5 py-2 text-sm border rounded-xl focus:outline-none focus:border-blue-400 transition-colors resize-none ${profileErrors.alamat ? 'border-red-400 bg-red-50/20' : 'border-slate-200'}`}
                                        />
                                        {profileErrors.alamat && <p className="text-xs text-red-500 mt-1">{profileErrors.alamat}</p>}
                                    </div>

                                    {/* Desa / Kelurahan */}
                                    <div>
                                        <label className="text-xs text-slate-500 font-semibold block mb-1.5">Desa / Kelurahan</label>
                                        <input
                                            type="text"
                                            value={adminProfile.desa}
                                            onChange={(e) => {
                                                setAdminProfile({
                                                    ...adminProfile,
                                                    desa: e.target.value,
                                                    kelurahan: e.target.value
                                                });
                                            }}
                                            className={`w-full px-3.5 py-2 text-sm border rounded-xl focus:outline-none focus:border-blue-400 transition-colors ${profileErrors.desa ? 'border-red-400 bg-red-50/20' : 'border-slate-200'}`}
                                        />
                                        {profileErrors.desa && <p className="text-xs text-red-500 mt-1">{profileErrors.desa}</p>}
                                    </div>

                                    {/* Kecamatan */}
                                    <div>
                                        <label className="text-xs text-slate-500 font-semibold block mb-1.5">Kecamatan</label>
                                        <input
                                            type="text"
                                            value={adminProfile.kecamatan}
                                            onChange={(e) => setAdminProfile({ ...adminProfile, kecamatan: e.target.value })}
                                            className={`w-full px-3.5 py-2 text-sm border rounded-xl focus:outline-none focus:border-blue-400 transition-colors ${profileErrors.kecamatan ? 'border-red-400 bg-red-50/20' : 'border-slate-200'}`}
                                        />
                                        {profileErrors.kecamatan && <p className="text-xs text-red-500 mt-1">{profileErrors.kecamatan}</p>}
                                    </div>

                                    {/* Kabupaten */}
                                    <div>
                                        <label className="text-xs text-slate-500 font-semibold block mb-1.5">Kabupaten</label>
                                        <input
                                            type="text"
                                            value={adminProfile.kabupaten}
                                            onChange={(e) => setAdminProfile({ ...adminProfile, kabupaten: e.target.value })}
                                            className={`w-full px-3.5 py-2 text-sm border rounded-xl focus:outline-none focus:border-blue-400 transition-colors ${profileErrors.kabupaten ? 'border-red-400 bg-red-50/20' : 'border-slate-200'}`}
                                        />
                                        {profileErrors.kabupaten && <p className="text-xs text-red-500 mt-1">{profileErrors.kabupaten}</p>}
                                    </div>

                                    {/* Provinsi */}
                                    <div>
                                        <label className="text-xs text-slate-500 font-semibold block mb-1.5">Provinsi</label>
                                        <input
                                            type="text"
                                            value={adminProfile.provinsi}
                                            onChange={(e) => setAdminProfile({ ...adminProfile, provinsi: e.target.value })}
                                            className={`w-full px-3.5 py-2 text-sm border rounded-xl focus:outline-none focus:border-blue-400 transition-colors ${profileErrors.provinsi ? 'border-red-400 bg-red-50/20' : 'border-slate-200'}`}
                                        />
                                        {profileErrors.provinsi && <p className="text-xs text-red-500 mt-1">{profileErrors.provinsi}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                                <button type="button" onClick={() => setProfileModalOpen(false)} className="px-5 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors font-semibold">
                                    Batal
                                </button>
                                <button type="submit" disabled={saving} className="px-5 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50">
                                    {saving && (
                                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                    )}
                                    {saving ? 'Menyimpan...' : 'Simpan Profil'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ====== SUCCESS TOAST ====== */}
            {showToast && (
                <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl bg-emerald-50 border border-emerald-200 text-emerald-800 animate-in fade-in slide-in-from-top-3 duration-300">
                    <span className="material-symbols-outlined text-2xl shrink-0 text-emerald-600">check_circle</span>
                    <p className="text-sm font-semibold">Profil Admin berhasil diperbarui!</p>
                </div>
            )}
        </div>
    );
}
