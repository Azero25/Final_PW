import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../axios';

/**
 * Layout bersama untuk semua halaman Admin — Mobile Responsive dengan Fitur Tambah Wilayah Baru.
 */
export default function AdminLayout({ children, pageTitle = 'Admin', pageSubtitle = '' }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        return typeof window !== 'undefined' ? window.innerWidth >= 1024 : false;
    });
    const [isDesktop, setIsDesktop] = useState(() => {
        return typeof window !== 'undefined' ? window.innerWidth >= 1024 : false;
    });
    const [user, setUser] = useState(null);

    // Dropdown & Profile Modal State
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [adminProfile, setAdminProfile] = useState({
        nama_lengkap: '',
        email: '',
        nik: '',
        no_hp: '',
        alamat_lengkap: '',
        avatar: '',
        provinsi: '',
        kabupaten: '',
        kecamatan: '',
        kelurahan: '',
    });

    // Password Form State
    const [passwordForm, setPasswordForm] = useState({
        password_lama: '',
        password_baru: '',
        konfirmasi_password: ''
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [profileErrors, setProfileErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Get Wilayah Form State
    const [suggestions, setSuggestions] = useState({ provinsi: [], kabupaten: [], kecamatan: [], kelurahan: [] });
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [selectedIds, setSelectedIds] = useState({
        id_provinsi: null,
        id_kabupaten: null,
        id_kecamatan: null,
        id_kelurahan: null
    });

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
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    useEffect(() => {
        if (!isDesktop) setSidebarOpen(false);
    }, [location.pathname, isDesktop]);

    useEffect(() => {
        const sesi = sessionStorage.getItem('user');
        if (sesi) setUser(JSON.parse(sesi));
    }, []);

    const menuItems = [
        { id: 'dashboard',  label: 'Dashboard',          icon: 'dashboard',       path: '/admin/dashboard' },
        { id: 'laporan',    label: 'Manajemen Laporan',  icon: 'assignment',      path: '/admin/laporan' },
        { id: 'pengguna',   label: 'Pengguna',           icon: 'group',           path: '/admin/pengguna' },
        { id: 'petugas',    label: 'Petugas & Dinas',    icon: 'badge',           path: '/admin/petugas' },
        { id: 'kategori',   label: 'Kategori',           icon: 'category',        path: '/admin/kategori' },
        { id: 'notifikasi', label: 'Notifikasi',          icon: 'notifications',   path: '/admin/notifikasi' },
    ];

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        navigate('/');
    };

    const openProfileModal = () => {
        const email = user?.email;

        setActiveTab('profile');
        setAvatarPreview(null);

        setPasswordForm({ password_lama: '', password_baru: '', konfirmasi_password: '' });
        setPasswordErrors({});
        setProfileErrors({});
        setShowOldPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);

        const stored = localStorage.getItem(`profile_${email}`);
        const cachedProfile = stored ? JSON.parse(stored) : null;

        if (cachedProfile) {
            setAdminProfile(cachedProfile);
        } else {
            setAdminProfile({
                nama_lengkap: user?.nama_lengkap || user?.nama || '',
                email: email || '',
                nik: user?.nik || '',
                no_hp: user?.no_hp || '',
                alamat_lengkap: user?.alamat_lengkap || '',
                avatar: user?.avatar || '',
                provinsi: user?.kelurahan?.kecamatan?.kabupaten?.provinsi?.nama_provinsi || '',
                kabupaten: user?.kelurahan?.kecamatan?.kabupaten?.nama_kabupaten || '',
                kecamatan: user?.kelurahan?.kecamatan?.nama_kecamatan || '',
                kelurahan: user?.kelurahan?.nama_kelurahan || '',
            });
        }

        // Kunci ID Wilayah yang sudah terdaftar di database saat ini
        setSelectedIds({
            id_provinsi: user?.kelurahan?.kecamatan?.kabupaten?.provinsi?.id_provinsi || null,
            id_kabupaten: user?.kelurahan?.kecamatan?.kabupaten?.id_kabupaten || null,
            id_kecamatan: user?.kelurahan?.kecamatan?.id_kecamatan || null,
            id_kelurahan: user?.kelurahan?.id_kelurahan || null,
        });

        setProfileModalOpen(true);
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setProfileErrors(prev => ({ ...prev, avatar: 'Ukuran berkas maksimal 2MB' }));
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
                setAdminProfile(prev => ({ ...prev, avatar: reader.result }));
                setProfileErrors(prev => ({ ...prev, avatar: null }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveAvatar = () => {
        setAvatarPreview(null);
        setAdminProfile(prev => ({ ...prev, avatar: '' }));
    };

    const handleManualSearch = async (type, query) => {
        setAdminProfile(prev => ({ ...prev, [type]: query }));

        // Lepas ID kuncian agar box mendeteksi aktivitas pengetikan baru
        setSelectedIds(prev => ({ ...prev, [`id_${type}`]: null }));

        let parentId = null;
        if (type === 'kabupaten') parentId = selectedIds.id_provinsi;
        if (type === 'kecamatan') parentId = selectedIds.id_kabupaten;
        if (type === 'kelurahan') parentId = selectedIds.id_kecamatan;

        if (query.trim().length < 2) {
            setSuggestions(prev => ({ ...prev, [type]: [] }));
            return;
        }

        try {
            const response = await api.get(`/api/wilayah/search-cascading?type=${type}&q=${query}&parent_id=${parentId}`);
            setSuggestions(prev => ({ ...prev, [type]: response.data }));
            setActiveDropdown(type);
        } catch (error) {
            console.error(`Gagal memuat search ${type}:`, error);
        }
    };

    const handleSelectManual = (type, item) => {
        if (type === 'provinsi') {
            setAdminProfile(prev => ({ ...prev, provinsi: item.nama_provinsi, kabupaten: '', kecamatan: '', kelurahan: '' }));
            setSelectedIds({ id_provinsi: item.id_provinsi, id_kabupaten: null, id_kecamatan: null, id_kelurahan: null });
        } else if (type === 'kabupaten') {
            setAdminProfile(prev => ({ ...prev, kabupaten: item.nama_kabupaten, kecamatan: '', kelurahan: '' }));
            setSelectedIds(prev => ({ ...prev, id_kabupaten: item.id_kabupaten, id_kecamatan: null, id_kelurahan: null }));
        } else if (type === 'kecamatan') {
            setAdminProfile(prev => ({ ...prev, kecamatan: item.nama_kecamatan, kelurahan: '' }));
            setSelectedIds(prev => ({ ...prev, id_kecamatan: item.id_kecamatan, id_kelurahan: null }));
        } else if (type === 'kelurahan') {
            setAdminProfile(prev => ({ ...prev, kelurahan: item.nama_kelurahan }));
            setSelectedIds(prev => ({ ...prev, id_kelurahan: item.id_kelurahan }));
        }
        setActiveDropdown(null);
    };

    // Fungsi menambahkan wilayah baru ke database secara realtime
    const handleCreateNewWilayah = async (type, name) => {
        if (!name.trim()) return;

        setSaving(true);
        try {
            let payload = { nama: name };
            let endpoint = '/api/wilayah/';

            if (type === 'provinsi') {
                endpoint += 'provinsi';
            } else if (type === 'kabupaten') {
                endpoint += 'kabupaten';
                payload.id_provinsi = selectedIds.id_provinsi;
            } else if (type === 'kecamatan') {
                endpoint += 'kecamatan';
                payload.id_kabupaten = selectedIds.id_kabupaten;
            } else if (type === 'kelurahan') {
                endpoint += 'kelurahan';
                payload.id_kecamatan = selectedIds.id_kecamatan;
            }

            const response = await api.post(endpoint, payload);

            if (response.status === 201 || response.data.status === 'success') {
                const newItem = response.data.data;

                if (type === 'provinsi') {
                    setAdminProfile(prev => ({ ...prev, provinsi: newItem.nama_provinsi, kabupaten: '', kecamatan: '', kelurahan: '' }));
                    setSelectedIds({ id_provinsi: newItem.id_provinsi, id_kabupaten: null, id_kecamatan: null, id_kelurahan: null });
                } else if (type === 'kabupaten') {
                    setAdminProfile(prev => ({ ...prev, kabupaten: newItem.nama_kabupaten, kecamatan: '', kelurahan: '' }));
                    setSelectedIds(prev => ({ ...prev, id_kabupaten: newItem.id_kabupaten, id_kecamatan: null, id_kelurahan: null }));
                } else if (type === 'kecamatan') {
                    setAdminProfile(prev => ({ ...prev, kecamatan: newItem.nama_kecamatan, kelurahan: '' }));
                    setSelectedIds(prev => ({ ...prev, id_kecamatan: newItem.id_kecamatan, id_kelurahan: null }));
                } else if (type === 'kelurahan') {
                    setAdminProfile(prev => ({ ...prev, kelurahan: newItem.nama_kelurahan }));
                    setSelectedIds(prev => ({ ...prev, id_kelurahan: newItem.id_kelurahan }));
                }

                setActiveDropdown(null);
            }
        } catch (error) {
            console.error(`Gagal menambahkan ${type} baru:`, error);
            alert(error.response?.data?.message || `Sistem gagal mendaftarkan data ${type} baru.`);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = () => setActiveDropdown(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const handleSavePassword = async (e) => {
        e.preventDefault();
        setPasswordErrors({});

        const errors = {};
        if (!passwordForm.password_lama) errors.password_lama = 'Kata sandi saat ini wajib diisi';
        if (!passwordForm.password_baru) errors.password_baru = 'Kata sandi baru wajib diisi';
        if (passwordForm.password_baru.length < 8) errors.password_baru = 'Kata sandi baru minimal harus 8 karakter';
        if (passwordForm.password_baru !== passwordForm.konfirmasi_password) {
            errors.konfirmasi_password = 'Konfirmasi kata sandi tidak cocok';
        }

        if (Object.keys(errors).length > 0) {
            setPasswordErrors(errors);
            return;
        }

        setSaving(true);
        try {
            const response = await api.put('/api/profile/password', {
                password_lama: passwordForm.password_lama,
                password_baru: passwordForm.password_baru,
                password_baru_confirmation: passwordForm.konfirmasi_password
            });

            if (response.status === 200 || response.data.status === 'success') {
                setPasswordForm({ password_lama: '', password_baru: '', konfirmasi_password: '' });
                setProfileModalOpen(false);
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            }
        } catch (error) {
            console.error("Gagal mengubah kata sandi:", error);
            if (error.response?.status === 422) {
                const serverErrors = error.response.data.errors;
                if (serverErrors) {
                    setPasswordErrors({
                        password_lama: serverErrors.password_lama ? serverErrors.password_lama[0] : null,
                        password_baru: serverErrors.password_baru ? serverErrors.password_baru[0] : null,
                    });
                } else {
                    setPasswordErrors({ password_lama: error.response.data.message || 'Verifikasi kata sandi gagal.' });
                }
            } else {
                alert(error.response?.data?.message || "Terjadi kesalahan sistem saat mengubah kata sandi.");
            }
        } finally {
            setSaving(false);
        }
    };

    const validateProfile = () => {
        const errors = {};
        if (!adminProfile.nama_lengkap?.trim()) errors.nama_lengkap = 'Nama lengkap wajib diisi';
        if (!adminProfile.email?.trim()) errors.email = 'Email wajib diisi';
        if (!adminProfile.alamat_lengkap?.trim()) errors.alamat_lengkap = 'Alamat Lengkap wajib diisi';
        if (!adminProfile.provinsi?.trim()) errors.provinsi = 'Provinsi wajib diisi';
        if (!adminProfile.kabupaten?.trim()) errors.kabupaten = 'Kabupaten wajib diisi';
        if (!adminProfile.kecamatan?.trim()) errors.kecamatan = 'Kecamatan wajib diisi';
        if (!adminProfile.kelurahan?.trim()) errors.kelurahan = 'Desa/Kelurahan wajib diisi';

        if (!adminProfile.nik?.trim()) {
            errors.nik = 'NIK wajib diisi';
        } else if (!/^\d+$/.test(adminProfile.nik)) {
            errors.nik = 'NIK harus berupa angka';
        } else if (adminProfile.nik.length !== 16) {
            errors.nik = 'NIK harus berjumlah 16 digit';
        }

        if (!adminProfile.no_hp?.trim()) {
            errors.no_hp = 'No. HP wajib diisi';
        } else if (!/^\d+$/.test(adminProfile.no_hp)) {
            errors.no_hp = 'No. HP harus berupa angka';
        }

        setProfileErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!validateProfile()) return;

        // Pastikan ID Kelurahan sudah terkunci dari relasi valid database sebelum submit
        if (!selectedIds.id_kelurahan) {
            setProfileErrors(prev => ({
                ...prev,
                kelurahan: 'Silakan pilih atau tambah Desa/Kelurahan resmi yang tersedia dari daftar dropdown'
            }));
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...adminProfile,
                id_kelurahan: selectedIds.id_kelurahan
            };

            if (avatarPreview === null) {
                delete payload.avatar;
            }

            const response = await api.put('/api/profile/', payload);

            if (response.status === 200 || response.data.status === 'success') {
                const serverUser = response.data.user;
                sessionStorage.setItem('user', JSON.stringify(serverUser));
                setUser(serverUser);

                const profileKey = `profile_${adminProfile.email}`;
                localStorage.setItem(profileKey, JSON.stringify({
                    ...adminProfile,
                    avatar: serverUser.avatar,
                    role: serverUser.role,
                    status: serverUser.status
                }));

                setAvatarPreview(null);

                window.dispatchEvent(new Event('profileUpdated'));
                setProfileModalOpen(false);
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            }
        } catch (error) {
            console.error("Gagal memperbarui profil:", error);
            if (error.response?.status === 422) {
                setProfileErrors(error.response.data.errors || { nama_lengkap: error.response.data.message });
            } else {
                alert(error.response?.data?.message || "Terjadi kesalahan sistem saat memperbarui profil.");
            }
        } finally {
            setSaving(false);
        }
    };

    const [collapsed, setCollapsed] = useState(() => {
        return typeof window !== 'undefined' ? localStorage.getItem('admin_sidebar_collapsed') === 'true' : false;
    });
    const sidebarWidth = isDesktop ? (collapsed ? 'w-20' : 'w-64') : 'w-72';

    return (
        <div className="flex h-screen bg-slate-100 font-public-sans overflow-hidden">

            {/* ====== BACKDROP (mobile) ====== */}
            {!isDesktop && sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            )}

            {/* ====== SIDEBAR ====== */}
            <aside className={`
                ${sidebarWidth} bg-slate-900 text-white flex flex-col shrink-0 z-40 transition-all duration-300 ease-in-out
                ${isDesktop ? 'relative' : `fixed inset-y-0 left-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
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
                    {!isDesktop && (
                        <button onClick={() => setSidebarOpen(false)} className="ml-auto p-1 text-slate-400 hover:text-white transition-colors">
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
                                ${isActive(item.path) ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <span className="material-symbols-outlined text-xl shrink-0" style={{ fontVariationSettings: isActive(item.path) ? "'FILL' 1" : "'FILL' 0" }}>
                                {item.icon}
                            </span>
                            {(!collapsed || !isDesktop) && <span className="whitespace-nowrap">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                {/* Profil Admin */}
                <div className="border-t border-slate-700 p-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-linear-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                            {user?.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt="User Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-white font-bold text-sm">
                                    {(user?.nama_lengkap || user?.nama || 'A').charAt(0)}
                                </span>
                            )}
                        </div>
                        {(!collapsed || !isDesktop) && (
                            <div className="overflow-hidden grow">
                                <p className="text-sm font-semibold leading-tight">{user?.nama_lengkap || user?.nama}</p>
                                <p className="text-slate-400 text-xs truncate">{user?.email}</p>
                            </div>
                        )}
                        {(!collapsed || !isDesktop) && (
                            <button onClick={openProfileModal} className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors shrink-0" title="Edit Profil Admin">
                                <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
                        )}
                    </div>
                    {(!collapsed || !isDesktop) && (
                        <button onClick={handleLogout} className="mt-3 flex items-center gap-2 text-slate-400 hover:text-red-400 text-xs transition-colors w-full">
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
                        {/* Notification Container */}
                        <div className="relative">
                            <button onClick={() => setNotifDropdownOpen(!notifDropdownOpen)} className="relative text-slate-500 hover:text-slate-800 hover:bg-slate-100 p-2 rounded-lg transition-colors focus:outline-none">
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
                                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
                                        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <h3 className="font-bold text-slate-800 text-sm">Notifikasi</h3>
                                                {unreadCount > 0 && <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount} Baru</span>}
                                            </div>
                                            {unreadCount > 0 && (
                                                <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:underline font-semibold">Tandai dibaca</button>
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
                                                        <div key={n.id} onClick={() => markAsRead(n.id)} className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer ${!n.dibaca ? 'bg-blue-50/20' : ''}`}>
                                                            <div className="shrink-0 mt-1.5">
                                                                {!n.dibaca ? <span className={`block w-2 h-2 rounded-full ${cfg.dot}`}></span> : <span className="block w-2 h-2 rounded-full bg-transparent"></span>}
                                                            </div>
                                                            <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
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
                                        <div className="px-4 py-2 border-t border-slate-100 text-center bg-slate-50 rounded-b-2xl">
                                            <Link to="/admin/notifikasi" onClick={() => setNotifDropdownOpen(false)} className="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline inline-flex items-center gap-1">
                                                Lihat Semua Notifikasi <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                            </Link>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Dropdown Profile Trigger */}
                        <div className="relative">
                            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="w-9 h-9 bg-linear-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                                {user?.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt="User Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-white font-bold text-sm">
                                        {(user?.nama_lengkap || user?.nama || 'A').charAt(0)}
                                    </span>
                                )}
                            </button>
                            {dropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
                                        <div className="px-4 py-2 border-b border-slate-100">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">LOGGED IN AS</p>
                                            <p className="text-sm font-bold text-slate-800 truncate">{user?.nama_lengkap || user?.nama || 'Admin Utama'}</p>
                                        </div>
                                        <button onClick={() => { setDropdownOpen(false); openProfileModal(); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors font-semibold">
                                            <span className="material-symbols-outlined text-lg text-slate-400">person</span> Edit Profil
                                        </button>
                                        <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-semibold border-t border-slate-100">
                                            <span className="material-symbols-outlined text-lg text-red-500">logout</span> Logout Admin
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
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[85vh] md:h-[75vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>

                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                            <div>
                                <h2 className="font-bold text-slate-800 text-lg">Pengaturan Akun</h2>
                                <p className="text-xs text-slate-400 mt-0.5">Kelola informasi profil, foto, dan keamanan kata sandi</p>
                            </div>
                            <button onClick={() => setProfileModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
                            {/* Tab Menu */}
                            <div className="w-full md:w-48 bg-slate-50 p-3 flex md:flex-col gap-1 border-b md:border-b-0 md:border-r border-slate-100 shrink-0 overflow-x-auto md:overflow-x-visible">
                                <button type="button" onClick={() => setActiveTab('profile')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap w-full ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-200/60'}`}>
                                    <span className="material-symbols-outlined text-lg">person</span> Edit Profil
                                </button>
                                <button type="button" onClick={() => setActiveTab('password')} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap w-full ${activeTab === 'password' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-200/60'}`}>
                                    <span className="material-symbols-outlined text-lg">lock</span> Keamanan
                                </button>
                            </div>

                            {/* Konten Form */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {activeTab === 'profile' ? (
                                    /* TAB 1: EDIT PROFIL */
                                    <form onSubmit={handleSaveProfile} className="space-y-6">

                                        {/* SECTION 1: FOTO PROFIL */}
                                        <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-50/70 p-5 rounded-2xl border border-slate-100">
                                            <div className="relative group w-20 h-20 bg-linear-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-inner overflow-hidden shrink-0">
                                                {avatarPreview || adminProfile.avatar ? (
                                                    <img src={avatarPreview || adminProfile.avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-white font-bold text-3xl">{(adminProfile.nama_lengkap || 'A').charAt(0)}</span>
                                                )}
                                            </div>
                                            <div className="text-center sm:text-left space-y-1 grow">
                                                <p className="text-sm font-bold text-slate-800">Foto Profil</p>
                                                <p className="text-xs text-slate-400">Rekomendasi rasio 1:1, format JPG, JPEG, atau PNG</p>
                                                <div className="flex items-center justify-center sm:justify-start gap-2 pt-1.5">
                                                    <label className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-xs flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">upload</span> Pilih Foto
                                                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                                    </label>
                                                    {(avatarPreview || adminProfile.avatar) && (
                                                        <button type="button" onClick={handleRemoveAvatar} className="px-3 py-1.5 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition-colors flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-sm">delete</span> Hapus
                                                        </button>
                                                    )}
                                                </div>
                                                {profileErrors.avatar && <p className="text-xs text-red-500 mt-1">{profileErrors.avatar}</p>}
                                            </div>
                                        </div>

                                        {/* SECTION 2: BIODATA UTAMA */}
                                        <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Informasi Pribadi</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs text-slate-500 font-semibold block mb-1.5">Nama Lengkap</label>
                                                    <input type="text" value={adminProfile.nama_lengkap} onChange={(e) => setAdminProfile({ ...adminProfile, nama_lengkap: e.target.value })} className={`w-full px-3.5 py-2 text-sm border rounded-xl focus:outline-none focus:border-blue-400 transition-colors ${profileErrors.nama_lengkap ? 'border-red-400 bg-red-50/20' : 'border-slate-200'}`} />
                                                    {profileErrors.nama_lengkap && <p className="text-xs text-red-500 mt-1">{profileErrors.nama_lengkap}</p>}
                                                </div>
                                                <div>
                                                    <label className="text-xs text-slate-500 font-semibold block mb-1.5">Email</label>
                                                    <input type="email" value={adminProfile.email} onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })} className={`w-full px-3.5 py-2 text-sm border rounded-xl focus:outline-none focus:border-blue-400 transition-colors ${profileErrors.email ? 'border-red-400 bg-red-50/20' : 'border-slate-200'}`} />
                                                    {profileErrors.email && <p className="text-xs text-red-500 mt-1">{profileErrors.email}</p>}
                                                </div>
                                                <div>
                                                    <label className="text-xs text-slate-500 font-semibold block mb-1.5">NIK (16 Digit)</label>
                                                    <input type="text" maxLength={16} value={adminProfile.nik} onChange={(e) => setAdminProfile({ ...adminProfile, nik: e.target.value })} className={`w-full px-3.5 py-2 text-sm border rounded-xl focus:outline-none focus:border-blue-400 transition-colors ${profileErrors.nik ? 'border-red-400 bg-red-50/20' : 'border-slate-200'}`} />
                                                    {profileErrors.nik && <p className="text-xs text-red-500 mt-1">{profileErrors.nik}</p>}
                                                </div>
                                                <div>
                                                    <label className="text-xs text-slate-500 font-semibold block mb-1.5">No. Telepon / HP</label>
                                                    <input type="text" value={adminProfile.no_hp} onChange={(e) => setAdminProfile({ ...adminProfile, no_hp: e.target.value })} className={`w-full px-3.5 py-2 text-sm border rounded-xl focus:outline-none focus:border-blue-400 transition-colors ${profileErrors.no_hp ? 'border-red-400 bg-red-50/20' : 'border-slate-200'}`} />
                                                    {profileErrors.no_hp && <p className="text-xs text-red-500 mt-1">{profileErrors.no_hp}</p>}
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <label className="text-xs text-slate-500 font-semibold block mb-1.5">Alamat Lengkap</label>
                                                    <textarea rows={2} value={adminProfile.alamat_lengkap} onChange={(e) => setAdminProfile({ ...adminProfile, alamat_lengkap: e.target.value })} className={`w-full px-3.5 py-2 text-sm border rounded-xl focus:outline-none focus:border-blue-400 transition-colors resize-none ${profileErrors.alamat_lengkap ? 'border-red-400 bg-red-50/20' : 'border-slate-200'}`} placeholder="Nama jalan, RT/RW, No. Rumah" />
                                                    {profileErrors.alamat_lengkap && <p className="text-xs text-red-500 mt-1">{profileErrors.alamat_lengkap}</p>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* SECTION 3: CASCADING SEARCH DATA WILAYAH DENGAN FITUR TAMBAH BARU */}
                                        <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Kontribusi & Detail Wilayah</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                                                {/* 1. INPUT PROVINSI */}
                                                <div className="relative">
                                                    <label className="text-xs text-slate-500 font-semibold block mb-1.5">Provinsi</label>
                                                    <div className="relative flex items-center">
                                                        <input
                                                            type="text"
                                                            value={adminProfile.provinsi}
                                                            onChange={(e) => handleManualSearch('provinsi', e.target.value)}
                                                            onFocus={() => setActiveDropdown('provinsi')}
                                                            className={`w-full pl-9 pr-3.5 py-2 text-sm border rounded-xl focus:outline-none focus:border-blue-400 transition-colors ${profileErrors.provinsi ? 'border-red-400 bg-red-50/20' : 'border-slate-200'}`}
                                                            placeholder="Cari atau ketik provinsi..."
                                                        />
                                                        <span className="material-symbols-outlined text-slate-400 absolute left-3 text-lg select-none">map</span>
                                                    </div>
                                                    {activeDropdown === 'provinsi' && adminProfile.provinsi && selectedIds.id_provinsi === null && (
                                                        <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-50 divide-y divide-slate-50">
                                                            {suggestions.provinsi?.map(item => (
                                                                <button key={item.id_provinsi} type="button" onClick={() => handleSelectManual('provinsi', item)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 text-slate-700 font-medium transition-colors flex items-center gap-2">
                                                                    <span className="material-symbols-outlined text-slate-400 text-base">location_on</span> {item.nama_provinsi}
                                                                </button>
                                                            ))}
                                                            {suggestions.provinsi?.length === 0 && (
                                                                <button type="button" onClick={() => handleCreateNewWilayah('provinsi', adminProfile.provinsi)} className="w-full text-left px-4 py-3 text-xs text-blue-600 bg-blue-50/40 font-bold flex items-center gap-1.5 hover:bg-blue-100/50 transition-all">
                                                                    <span className="material-symbols-outlined text-base">add_circle</span> Tambah "{adminProfile.provinsi}" sebagai provinsi baru
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                    {profileErrors.provinsi && <p className="text-xs text-red-500 mt-1">{profileErrors.provinsi}</p>}
                                                </div>

                                                {/* 2. INPUT KABUPATEN */}
                                                <div className="relative">
                                                    <label className="text-xs text-slate-500 font-semibold block mb-1.5">Kabupaten / Kota</label>
                                                    <div className="relative flex items-center">
                                                        <input
                                                            type="text"
                                                            value={adminProfile.kabupaten}
                                                            disabled={!adminProfile.provinsi?.trim() || selectedIds.id_provinsi === null}
                                                            onChange={(e) => handleManualSearch('kabupaten', e.target.value)}
                                                            onFocus={() => setActiveDropdown('kabupaten')}
                                                            className={`w-full pl-9 pr-3.5 py-2 text-sm border rounded-xl focus:outline-none focus:border-blue-400 transition-colors disabled:bg-slate-50 disabled:text-slate-400 ${profileErrors.kabupaten ? 'border-red-400 bg-red-50/20' : 'border-slate-200'}`}
                                                            placeholder={adminProfile.provinsi ? "Cari atau ketik kabupaten..." : "Pilih provinsi dahulu"}
                                                        />
                                                        <span className="material-symbols-outlined text-slate-400 absolute left-3 text-lg select-none">apartment</span>
                                                    </div>
                                                    {activeDropdown === 'kabupaten' && adminProfile.kabupaten && selectedIds.id_kabupaten === null && (
                                                        <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-50 divide-y divide-slate-50">
                                                            {suggestions.kabupaten?.map(item => (
                                                                <button key={item.id_kabupaten} type="button" onClick={() => handleSelectManual('kabupaten', item)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 text-slate-700 font-medium transition-colors flex items-center gap-2">
                                                                    <span className="material-symbols-outlined text-slate-400 text-base">corporate_fare</span> {item.nama_kabupaten}
                                                                </button>
                                                            ))}
                                                            {suggestions.kabupaten?.length === 0 && (
                                                                <button type="button" onClick={() => handleCreateNewWilayah('kabupaten', adminProfile.kabupaten)} className="w-full text-left px-4 py-3 text-xs text-blue-600 bg-blue-50/40 font-bold flex items-center gap-1.5 hover:bg-blue-100/50 transition-all">
                                                                    <span className="material-symbols-outlined text-base">add_circle</span> Tambah "{adminProfile.kabupaten}" baru di Prov. {adminProfile.provinsi}
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                    {profileErrors.kabupaten && <p className="text-xs text-red-500 mt-1">{profileErrors.kabupaten}</p>}
                                                </div>

                                                {/* 3. INPUT KECAMATAN */}
                                                <div className="relative">
                                                    <label className="text-xs text-slate-500 font-semibold block mb-1.5">Kecamatan</label>
                                                    <div className="relative flex items-center">
                                                        <input
                                                            type="text"
                                                            value={adminProfile.kecamatan}
                                                            disabled={!adminProfile.kabupaten?.trim() || selectedIds.id_kabupaten === null}
                                                            onChange={(e) => handleManualSearch('kecamatan', e.target.value)}
                                                            onFocus={() => setActiveDropdown('kecamatan')}
                                                            className={`w-full pl-9 pr-3.5 py-2 text-sm border rounded-xl focus:outline-none focus:border-blue-400 transition-colors disabled:bg-slate-50 disabled:text-slate-400 ${profileErrors.kecamatan ? 'border-red-400 bg-red-50/20' : 'border-slate-200'}`}
                                                            placeholder={adminProfile.kabupaten ? "Cari atau ketik kecamatan..." : "Pilih kabupaten dahulu"}
                                                        />
                                                        <span className="material-symbols-outlined text-slate-400 absolute left-3 text-lg select-none">holiday_village</span>
                                                    </div>
                                                    {activeDropdown === 'kecamatan' && adminProfile.kecamatan && selectedIds.id_kecamatan === null && (
                                                        <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-50 divide-y divide-slate-50">
                                                            {suggestions.kecamatan?.map(item => (
                                                                <button key={item.id_kecamatan} type="button" onClick={() => handleSelectManual('kecamatan', item)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 text-slate-700 font-medium transition-colors flex items-center gap-2">
                                                                    <span className="material-symbols-outlined text-slate-400 text-base">gite</span> {item.nama_kecamatan}
                                                                </button>
                                                            ))}
                                                            {suggestions.kecamatan?.length === 0 && (
                                                                <button type="button" onClick={() => handleCreateNewWilayah('kecamatan', adminProfile.kecamatan)} className="w-full text-left px-4 py-3 text-xs text-blue-600 bg-blue-50/40 font-bold flex items-center gap-1.5 hover:bg-blue-100/50 transition-all">
                                                                    <span className="material-symbols-outlined text-base">add_circle</span> Tambah "{adminProfile.kecamatan}" baru di Kab. {adminProfile.kabupaten}
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                    {profileErrors.kecamatan && <p className="text-xs text-red-500 mt-1">{profileErrors.kecamatan}</p>}
                                                </div>

                                                {/* 4. INPUT DESA / KELURAHAN */}
                                                <div className="relative">
                                                    <label className="text-xs text-slate-500 font-semibold block mb-1.5">Desa / Kelurahan</label>
                                                    <div className="relative flex items-center">
                                                        <input
                                                            type="text"
                                                            value={adminProfile.kelurahan}
                                                            disabled={!adminProfile.kecamatan?.trim() || selectedIds.id_kecamatan === null}
                                                            onChange={(e) => handleManualSearch('kelurahan', e.target.value)}
                                                            onFocus={() => setActiveDropdown('kelurahan')}
                                                            className={`w-full pl-9 pr-3.5 py-2 text-sm border rounded-xl focus:outline-none focus:border-blue-400 transition-colors disabled:bg-slate-50 disabled:text-slate-400 ${profileErrors.kelurahan ? 'border-red-400 bg-red-50/20' : 'border-slate-200'}`}
                                                            placeholder={adminProfile.kecamatan ? "Cari atau ketik kelurahan..." : "Pilih kecamatan dahulu"}
                                                        />
                                                        <span className="material-symbols-outlined text-slate-400 absolute left-3 text-lg select-none">brightness_7</span>
                                                    </div>
                                                    {activeDropdown === 'kelurahan' && adminProfile.kelurahan && selectedIds.id_kelurahan === null && (
                                                        <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-50 divide-y divide-slate-50">
                                                            {suggestions.kelurahan?.map(item => (
                                                                <button key={item.id_kelurahan} type="button" onClick={() => handleSelectManual('kelurahan', item)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 text-slate-700 font-medium transition-colors flex items-center gap-2">
                                                                    <span className="material-symbols-outlined text-slate-400 text-base">wb_sunny</span> {item.nama_kelurahan}
                                                                </button>
                                                            ))}
                                                            {suggestions.kelurahan?.length === 0 && (
                                                                <button type="button" onClick={() => handleCreateNewWilayah('kelurahan', adminProfile.kelurahan)} className="w-full text-left px-4 py-3 text-xs text-blue-600 bg-blue-50/40 font-bold flex items-center gap-1.5 hover:bg-blue-100/50 transition-all">
                                                                    <span className="material-symbols-outlined text-base">add_circle</span> Tambah "{adminProfile.kelurahan}" baru di Kec. {adminProfile.kecamatan}
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                    {profileErrors.kelurahan && <p className="text-xs text-red-500 mt-1">{profileErrors.kelurahan}</p>}
                                                </div>

                                            </div>
                                        </div>

                                        {/* ACTION BUTTONS PROFIL */}
                                        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                                            <button type="button" onClick={() => setProfileModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                                                Batal
                                            </button>
                                            <button type="submit" disabled={saving} className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all">
                                                {saving ? (
                                                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <span className="material-symbols-outlined text-sm">save</span>
                                                )}
                                                Simpan Profil
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    /* TAB 2: KEAMANAN (GANTI PASSWORD) */
                                    <form onSubmit={handleSavePassword} className="space-y-4 max-w-md mx-auto pt-4">
                                        {/* Input Kata Sandi Saat Ini */}
                                        <div>
                                            <label className="text-xs text-slate-500 font-semibold block mb-1.5">Kata Sandi Saat Ini</label>
                                            <div className="relative flex items-center">
                                                <input
                                                    type={showOldPassword ? "text" : "password"}
                                                    value={passwordForm.password_lama}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, password_lama: e.target.value })}
                                                    className={`w-full pl-3.5 pr-10 py-2 text-sm border rounded-xl focus:outline-none focus:border-blue-400 transition-colors ${passwordErrors.password_lama ? 'border-red-400 bg-red-50/20' : 'border-slate-200'}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                                    className="absolute right-3 text-slate-400 hover:text-slate-600 select-none focus:outline-none"
                                                >
                                                    <span className="material-symbols-outlined text-lg leading-none">
                                                        {showOldPassword ? 'visibility_off' : 'visibility'}
                                                    </span>
                                                </button>
                                            </div>
                                            {passwordErrors.password_lama && <p className="text-xs text-red-500 mt-1">{passwordErrors.password_lama}</p>}
                                        </div>

                                        {/* Input Kata Sandi Baru */}
                                        <div>
                                            <label className="text-xs text-slate-500 font-semibold block mb-1.5">Kata Sandi Baru</label>
                                            <div className="relative flex items-center">
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    value={passwordForm.password_baru}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, password_baru: e.target.value })}
                                                    className={`w-full pl-3.5 pr-10 py-2 text-sm border rounded-xl focus:outline-none focus:border-blue-400 transition-colors ${passwordErrors.password_baru ? 'border-red-400 bg-red-50/20' : 'border-slate-200'}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 text-slate-400 hover:text-slate-600 select-none focus:outline-none"
                                                >
                                                    <span className="material-symbols-outlined text-lg leading-none">
                                                        {showNewPassword ? 'visibility_off' : 'visibility'}
                                                    </span>
                                                </button>
                                            </div>
                                            {passwordErrors.password_baru && <p className="text-xs text-red-500 mt-1">{passwordErrors.password_baru}</p>}
                                        </div>

                                        {/* Input Konfirmasi Kata Sandi Baru */}
                                        <div>
                                            <label className="text-xs text-slate-500 font-semibold block mb-1.5">Konfirmasi Kata Sandi Baru</label>
                                            <div className="relative flex items-center">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={passwordForm.konfirmasi_password}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, konfirmasi_password: e.target.value })}
                                                    className={`w-full pl-3.5 pr-10 py-2 text-sm border rounded-xl focus:outline-none focus:border-blue-400 transition-colors ${passwordErrors.konfirmasi_password ? 'border-red-400 bg-red-50/20' : 'border-slate-200'}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 text-slate-400 hover:text-slate-600 select-none focus:outline-none"
                                                >
                                                    <span className="material-symbols-outlined text-lg leading-none">
                                                        {showConfirmPassword ? 'visibility_off' : 'visibility'}
                                                    </span>
                                                </button>
                                            </div>
                                            {passwordErrors.konfirmasi_password && <p className="text-xs text-red-500 mt-1">{passwordErrors.konfirmasi_password}</p>}
                                        </div>

                                        {/* ACTION BUTTONS PASSWORD */}
                                        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                                            <button type="button" onClick={() => setProfileModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Batal</button>
                                            <button type="submit" disabled={saving} className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5">
                                                Perbarui Sandi
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ====== SUCCESS TOAST ====== */}
            {showToast && (
                <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl bg-emerald-50 border border-emerald-200 text-emerald-800 animate-in fade-in slide-in-from-top-3 duration-300">
                    <span className="material-symbols-outlined text-2xl shrink-0 text-emerald-600">check_circle</span>
                    <p className="text-sm font-semibold">Pengaturan Akun berhasil diperbarui!</p>
                </div>
            )}
        </div>
    );
}
