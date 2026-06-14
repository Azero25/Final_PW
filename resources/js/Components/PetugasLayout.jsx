import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../axios';

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

    // Notifikasi petugas real-time dari database
    const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);

    // Profil modal states
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [activeProfileTab, setActiveProfileTab] = useState('detail'); // 'detail' | 'password'
    const [profileData, setProfileData] = useState({
        nama: '',
        nip: '',
        telp: '',
        avatar: ''
    });
    const [passwordData, setPasswordData] = useState({
        passwordLama: '',
        passwordBaru: '',
        konfirmasiPassword: ''
    });
    const [profileErrors, setProfileErrors] = useState({});
    const [savingProfile, setSavingProfile] = useState(false);
    const [showProfileToast, setShowProfileToast] = useState(false);
    const [profileToastMsg, setProfileToastMsg] = useState('Profil berhasil diperbarui!');
    const [showPassLama, setShowPassLama] = useState(false);
    const [showPassBaru, setShowPassBaru] = useState(false);
    const [showPassKonf, setShowPassKonf] = useState(false);

    const openProfileModal = () => {
        setProfileData({
            nama: petugas?.nama || '',
            nip: petugas?.nip || '',
            telp: petugas?.telepon || '',
            avatar: petugas?.avatar || ''
        });
        setPasswordData({
            passwordLama: '',
            passwordBaru: '',
            konfirmasiPassword: ''
        });
        setShowPassLama(false);
        setShowPassBaru(false);
        setShowPassKonf(false);
        setActiveProfileTab('detail');
        setProfileErrors({});
        setProfileModalOpen(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setProfileErrors(prev => ({ ...prev, avatar: 'Ukuran file maksimal 5MB' }));
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setProfileData(prev => ({ ...prev, avatar: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setProfileErrors({});

        if (!profileData.nama.trim()) {
            setProfileErrors(prev => ({ ...prev, nama: 'Nama wajib diisi' }));
            return;
        }
        if (!profileData.nip.trim()) {
            setProfileErrors(prev => ({ ...prev, nip: 'NIP wajib diisi' }));
            return;
        }

        setSavingProfile(true);

        try {
            const response = await api.put(`/api/petugas/profile/${petugas.original_id}`, {
                nama: profileData.nama,
                nip: profileData.nip,
                telp: profileData.telp,
                avatar: profileData.avatar
            });

            if (response.data && response.data.status === 'success') {
                sessionStorage.setItem('petugas', JSON.stringify(response.data.petugas));
                setPetugas(response.data.petugas);
                setProfileToastMsg('Profil berhasil diperbarui!');
                setProfileModalOpen(false);
                setShowProfileToast(true);
                setTimeout(() => setShowProfileToast(false), 3000);
            }
        } catch (err) {
            setProfileErrors(err.response?.data?.errors || { general: err.response?.data?.message || 'Gagal memperbarui profil' });
        } finally {
            setSavingProfile(false);
        }
    };

    const handleSavePassword = async (e) => {
        e.preventDefault();
        setProfileErrors({});

        if (!passwordData.passwordLama || !passwordData.passwordBaru || !passwordData.konfirmasiPassword) {
            setProfileErrors({ general: 'Semua kolom password wajib diisi.' });
            return;
        }
        if (passwordData.passwordBaru.length < 8) {
            setProfileErrors({ passwordBaru: 'Password baru minimal harus 8 karakter.' });
            return;
        }
        if (passwordData.passwordBaru !== passwordData.konfirmasiPassword) {
            setProfileErrors({ konfirmasiPassword: 'Konfirmasi password baru tidak cocok.' });
            return;
        }

        setSavingProfile(true);

        try {
            const response = await api.put(`/api/petugas/profile/${petugas.original_id}/password`, {
                password_lama: passwordData.passwordLama,
                password_baru: passwordData.passwordBaru
            });

            if (response.data && response.data.status === 'success') {
                setPasswordData({
                    passwordLama: '',
                    passwordBaru: '',
                    konfirmasiPassword: ''
                });
                setProfileToastMsg('Kata sandi berhasil diubah!');
                setProfileModalOpen(false);
                setShowProfileToast(true);
                setTimeout(() => setShowProfileToast(false), 3000);
            }
        } catch (err) {
            setProfileErrors(err.response?.data?.errors || { general: err.response?.data?.message || 'Gagal mengubah kata sandi' });
        } finally {
            setSavingProfile(false);
        }
    };

    const fetchNotifications = async () => {
        const sesi = sessionStorage.getItem('petugas');
        if (!sesi) return;
        const parsed = JSON.parse(sesi);
        const originalId = parsed.original_id;

        try {
            const response = await api.get(`/api/notifications?role=petugas&id=${originalId}`);
            setNotifications(response.data);
            localStorage.setItem('petugas_notifications', JSON.stringify(response.data));
        } catch (error) {
            console.error("Gagal mengambil data notifikasi:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();

        const interval = setInterval(fetchNotifications, 5000);

        const syncNotifs = () => {
            const stored = localStorage.getItem('petugas_notifications');
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
            localStorage.setItem('petugas_notifications', JSON.stringify(updated));
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
            localStorage.setItem('petugas_notifications', JSON.stringify(updated));
            window.dispatchEvent(new Event('notificationsUpdated'));
        } catch (error) {
            console.error("Gagal menandai dibaca:", error);
        }
    };

    const unreadCount = notifications.filter(n => !n.dibaca).length;

    const TIPE_CONFIG = {
        laporan:    { icon: 'assignment',    bg: 'bg-blue-100',    color: 'text-blue-600',   dot: 'bg-blue-500'   },
        update:     { icon: 'update',        bg: 'bg-green-100',   color: 'text-green-600',  dot: 'bg-green-500'  },
        pengguna:   { icon: 'person',        bg: 'bg-purple-100',  color: 'text-purple-600', dot: 'bg-purple-500' },
        darurat:    { icon: 'emergency',     bg: 'bg-red-100',     color: 'text-red-600',    dot: 'bg-red-500'    },
        peringatan: { icon: 'warning',       bg: 'bg-yellow-100',  color: 'text-yellow-600', dot: 'bg-yellow-500' },
        petugas:    { icon: 'badge',         bg: 'bg-orange-100',  color: 'text-orange-600', dot: 'bg-orange-500' },
        sistem:     { icon: 'settings',      bg: 'bg-slate-100',   color: 'text-slate-600',  dot: 'bg-slate-400'  },
        tugas:      { icon: 'assignment_add', bg: 'bg-blue-100',   color: 'text-blue-600',   dot: 'bg-blue-500'   },
        deadline:   { icon: 'schedule',       bg: 'bg-orange-100', color: 'text-orange-600',  dot: 'bg-orange-500' },
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
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {petugas?.avatar ? (
                                <img src={petugas.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white font-bold text-sm">{petugas?.nama?.charAt(0) || 'P'}</span>
                            )}
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
                                                })
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Avatar dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center cursor-pointer focus:outline-none hover:ring-2 hover:ring-blue-500/30 transition-all overflow-hidden"
                            >
                                {petugas?.avatar ? (
                                    <img src={petugas.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-white font-bold text-sm">{petugas?.nama?.charAt(0) || 'P'}</span>
                                )}
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
                                            onClick={() => { setDropdownOpen(false); handleLogout(); }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-semibold border-t border-slate-100"
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
                {/* ====== EDIT PROFILE PETUGAS MODAL ====== */}
                {profileModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setProfileModalOpen(false)}>
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/40">
                                <div>
                                    <h2 className="font-bold text-slate-800 text-lg">Edit Profil Petugas</h2>
                                    <p className="text-xs text-slate-400 mt-0.5">Perbarui informasi detail dan keamanan akun Anda</p>
                                </div>
                                <button onClick={() => setProfileModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            {/* Tabs Navigation */}
                            <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => { setActiveProfileTab('detail'); setProfileErrors({}); }}
                                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeProfileTab === 'detail' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                                >
                                    Informasi Profil
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setActiveProfileTab('password'); setProfileErrors({}); }}
                                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeProfileTab === 'password' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                                >
                                    Ubah Password
                                </button>
                            </div>

                            {/* Form Body */}
                            <form onSubmit={activeProfileTab === 'detail' ? handleSaveProfile : handleSavePassword}>
                                <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
                                    {activeProfileTab === 'detail' ? (
                                        <>
                                            {/* Upload Foto */}
                                            <div className="flex flex-col items-center gap-3 pb-3 border-b border-slate-100">
                                                <div className="relative group w-20 h-20 rounded-full overflow-hidden border-2 border-blue-500 shadow-md">
                                                    {profileData.avatar ? (
                                                        <img src={profileData.avatar} alt="Preview Avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl">
                                                            {profileData.nama?.charAt(0) || 'P'}
                                                        </div>
                                                    )}
                                                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-xs font-semibold">
                                                        Ubah
                                                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                                    </label>
                                                </div>
                                                <span className="text-xs text-slate-400">Rekomendasi rasio 1:1, Maksimal 5MB</span>
                                                {profileErrors.avatar && <p className="text-xs text-red-500 font-medium">{profileErrors.avatar}</p>}
                                            </div>

                                            {/* Nama Lengkap */}
                                            <div className="space-y-1">
                                                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Nama Lengkap</label>
                                                <input
                                                    type="text"
                                                    value={profileData.nama}
                                                    onChange={(e) => setProfileData(prev => ({ ...prev, nama: e.target.value }))}
                                                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 transition-all font-medium text-slate-800"
                                                />
                                                {profileErrors.nama && <p className="text-xs text-red-500 font-medium">{profileErrors.nama}</p>}
                                            </div>

                                            {/* NIP */}
                                            <div className="space-y-1">
                                                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider block">NIP (Nomor Induk Pegawai)</label>
                                                <input
                                                    type="text"
                                                    value={profileData.nip}
                                                    onChange={(e) => setProfileData(prev => ({ ...prev, nip: e.target.value }))}
                                                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 transition-all font-medium text-slate-800"
                                                />
                                                {profileErrors.nip && <p className="text-xs text-red-500 font-medium">{profileErrors.nip}</p>}
                                            </div>

                                            {/* No. Telepon */}
                                            <div className="space-y-1">
                                                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Nomor Telepon / HP</label>
                                                <input
                                                    type="text"
                                                    value={profileData.telp}
                                                    onChange={(e) => setProfileData(prev => ({ ...prev, telp: e.target.value }))}
                                                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 transition-all font-medium text-slate-800"
                                                />
                                                {profileErrors.telp && <p className="text-xs text-red-500 font-medium">{profileErrors.telp}</p>}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* Password Lama */}
                                            <div className="space-y-1">
                                                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Kata Sandi Saat Ini</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassLama ? "text" : "password"}
                                                        value={passwordData.passwordLama}
                                                        onChange={(e) => setPasswordData(prev => ({ ...prev, passwordLama: e.target.value }))}
                                                        placeholder="••••••••"
                                                        className="w-full pl-4 pr-10 py-3 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 transition-all font-medium text-slate-800"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassLama(!showPassLama)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                                                    >
                                                        <span className="material-symbols-outlined text-lg select-none">
                                                            {showPassLama ? 'visibility_off' : 'visibility'}
                                                        </span>
                                                    </button>
                                                </div>
                                                {profileErrors.password_lama && <p className="text-xs text-red-500 font-medium">{profileErrors.password_lama}</p>}
                                            </div>

                                            {/* Password Baru */}
                                            <div className="space-y-1">
                                                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Kata Sandi Baru</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassBaru ? "text" : "password"}
                                                        value={passwordData.passwordBaru}
                                                        onChange={(e) => setPasswordData(prev => ({ ...prev, passwordBaru: e.target.value }))}
                                                        placeholder="Minimal 8 karakter"
                                                        className="w-full pl-4 pr-10 py-3 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 transition-all font-medium text-slate-800"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassBaru(!showPassBaru)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                                                    >
                                                        <span className="material-symbols-outlined text-lg select-none">
                                                            {showPassBaru ? 'visibility_off' : 'visibility'}
                                                        </span>
                                                    </button>
                                                </div>
                                                {profileErrors.passwordBaru && <p className="text-xs text-red-500 font-medium">{profileErrors.passwordBaru}</p>}
                                                {profileErrors.password_baru && <p className="text-xs text-red-500 font-medium">{profileErrors.password_baru}</p>}
                                            </div>

                                            {/* Konfirmasi Password Baru */}
                                            <div className="space-y-1">
                                                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Ulangi Kata Sandi Baru</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassKonf ? "text" : "password"}
                                                        value={passwordData.konfirmasiPassword}
                                                        onChange={(e) => setPasswordData(prev => ({ ...prev, konfirmasiPassword: e.target.value }))}
                                                        placeholder="Ulangi Sandi Baru"
                                                        className="w-full pl-4 pr-10 py-3 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 transition-all font-medium text-slate-800"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassKonf(!showPassKonf)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                                                    >
                                                        <span className="material-symbols-outlined text-lg select-none">
                                                            {showPassKonf ? 'visibility_off' : 'visibility'}
                                                        </span>
                                                    </button>
                                                </div>
                                                {profileErrors.konfirmasiPassword && <p className="text-xs text-red-500 font-medium">{profileErrors.konfirmasiPassword}</p>}
                                            </div>
                                        </>
                                    )}

                                    {profileErrors.general && (
                                        <p className="text-xs text-red-500 text-center font-bold">{profileErrors.general}</p>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/40">
                                    <button
                                        type="button"
                                        onClick={() => setProfileModalOpen(false)}
                                        className="px-5 py-2.5 text-sm text-slate-500 border border-slate-200 hover:border-slate-300 rounded-xl hover:bg-white transition-colors font-bold bg-transparent"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={savingProfile}
                                        className="px-5 py-2.5 text-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-400 hover:to-indigo-500 transition-all font-bold flex items-center gap-2 disabled:opacity-50 shadow-md shadow-blue-500/15"
                                    >
                                        {savingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ====== SUCCESS PROFILE TOAST ====== */}
                {showProfileToast && (
                    <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl bg-emerald-50 border border-emerald-200 text-emerald-800 animate-in fade-in slide-in-from-top-3 duration-300">
                        <span className="material-symbols-outlined text-2xl flex-shrink-0 text-emerald-600">check_circle</span>
                        <p className="text-sm font-semibold">{profileToastMsg}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
