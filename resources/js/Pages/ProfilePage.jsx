import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import api from '../axios';

function AutocompleteSelect({ label, placeholder, value, onChange, options, disabled }) {
    const [search, setSearch] = useState(value || '');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        setSearch(value || '');
    }, [value]);

    useEffect(() => {
        const clickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', clickOutside);
        return () => document.removeEventListener('mousedown', clickOutside);
    }, []);

    // Filter options based on search query
    const filteredOptions = options.filter(opt =>
        opt && opt.toLowerCase().includes((search || '').toLowerCase())
    );

    // Check if the exact typed value exists in the options
    const exactMatchExists = options.some(opt =>
        opt && opt.toLowerCase() === (search || '').trim().toLowerCase()
    );

    const handleSelect = (val) => {
        onChange(val);
        setSearch(val);
        setIsOpen(false);
    };

    return (
        <div className="space-y-2 relative" ref={containerRef}>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">{label}</label>
            <div className="relative">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        onChange(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => !disabled && setIsOpen(true)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 font-body-md text-slate-800 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    search
                </span>
            </div>

            {isOpen && !disabled && (
                <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 font-body-md text-sm text-slate-700">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => handleSelect(opt)}
                                className="w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium"
                            >
                                {opt}
                            </button>
                        ))
                    ) : null}

                    {search && search.trim() !== '' && !exactMatchExists && (
                        <button
                            type="button"
                            onClick={() => handleSelect(search.trim())}
                            className="w-full text-left px-4 py-2 hover:bg-blue-50 text-blue-600 hover:text-blue-700 transition-colors font-bold border-t border-slate-100 flex items-center gap-1.5"
                        >
                            <span className="material-symbols-outlined text-base">add_circle</span>
                            Gunakan / Tambah "{search.trim()}"
                        </button>
                    )}

                    {filteredOptions.length === 0 && (!search || search.trim() === '') && (
                        <div className="px-4 py-2 text-slate-400 text-xs text-center">
                            Tidak ada pilihan
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function ProfilePage() {
    const navigate = useNavigate();

    // Sesi dasar user aktif
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('detail'); // detail, keamanan

    // State data profil
    const [profile, setProfile] = useState({
        nama: '',
        email: '',
        role: '',
        nik: '',
        telepon: '',
        alamat: '',
        desa: '',
        kelurahan: '',
        kecamatan: '',
        kabupaten: '',
        provinsi: '',
        avatar: null,
        tglDaftar: '12 Januari 2024',
        status: 'Terverifikasi'
    });

    // State ubah password
    const [passwordData, setPasswordData] = useState({
        passwordLama: '',
        passwordBaru: '',
        konfirmasiPassword: ''
    });

    // State notifikasi/toast
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // State wilayah
    const [provinsis, setProvinsis] = useState([]);
    const [kecamatans, setKecamatans] = useState([]);
    const [kelurahans, setKelurahans] = useState([]);


    const fetchWilayah = async () => {
        try {
            const [resP, resKc, resKl] = await Promise.all([
                api.get('/api/provinsis'),
                api.get('/api/kecamatans'),
                api.get('/api/kelurahans')
            ]);
            setProvinsis(resP.data);
            setKecamatans(resKc.data);
            setKelurahans(resKl.data);
        } catch (err) {
            console.error('Gagal memuat data wilayah:', err);
        }
    };

    useEffect(() => {
        fetchWilayah();
    }, []);

    // Efek inisialisasi halaman
    useEffect(() => {
        window.scrollTo(0, 0);

        const fetchProfile = async () => {
            try {
                const response = await api.get('/api/me');
                const activeUser = response.data.user;
                if (!activeUser) {
                    showToast('Silakan masuk terlebih dahulu untuk mengedit profil Anda.', 'error');
                    setTimeout(() => navigate('/login'), 1500);
                    return;
                }
                setUser(activeUser);

                setProfile({
                    nama: activeUser.nama_lengkap || '',
                    email: activeUser.email || '',
                    role: activeUser.role || 'warga',
                    nik: activeUser.nik || '',
                    telepon: activeUser.no_hp || '',
                    alamat: activeUser.alamat_lengkap || '',
                    desa: activeUser.desa || '',
                    kelurahan: activeUser.kelurahan || '',
                    kecamatan: activeUser.kecamatan || '',
                    kabupaten: activeUser.kabupaten || '',
                    provinsi: activeUser.provinsi || '',
                    avatar: activeUser.avatar || null,
                    tglDaftar: activeUser.tanggal_bergabung ? new Date(activeUser.tanggal_bergabung).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '18 Maret 2024',
                    status: activeUser.status || 'Terverifikasi'
                });
            } catch (err) {
                showToast('Gagal memuat profil dari server.', 'error');
                setTimeout(() => navigate('/login'), 1500);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    // Fungsi menampilkan Toast notification
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast((prev) => ({ ...prev, show: false }));
        }, 3000);
    };

    // Fungsi upload foto profil
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validasi format file
        if (!file.type.startsWith('image/')) {
            showToast('Hanya file gambar yang diperbolehkan.', 'error');
            return;
        }

        // Validasi ukuran (maks 2MB)
        if (file.size > 2 * 1024 * 1024) {
            showToast('Ukuran gambar maksimal adalah 2MB.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64Image = event.target.result;
            const updatedProfile = { ...profile, avatar: base64Image };
            setProfile(updatedProfile);

            try {
                const response = await api.put('/api/profile', {
                    nama_lengkap: profile.nama,
                    nik: profile.nik,
                    no_hp: profile.telepon,
                    alamat_lengkap: profile.alamat,
                    desa: profile.desa,
                    kelurahan: profile.kelurahan,
                    kecamatan: profile.kecamatan,
                    kabupaten: profile.kabupaten,
                    provinsi: profile.provinsi,
                    avatar: base64Image
                });

                const updatedUser = response.data.user;
                const sesi = JSON.parse(sessionStorage.getItem('user'));
                if (sesi) {
                    sesi.nama = updatedUser.nama_lengkap;
                    sesi.avatar = updatedUser.avatar;
                    sessionStorage.setItem('user', JSON.stringify(sesi));
                }

                localStorage.setItem(`profile_${updatedUser.email}`, JSON.stringify({
                    nama: updatedUser.nama_lengkap,
                    email: updatedUser.email,
                    avatar: updatedUser.avatar,
                    nik: updatedUser.nik,
                    telepon: updatedUser.no_hp,
                    alamat: updatedUser.alamat_lengkap,
                    desa: updatedUser.desa,
                    kelurahan: updatedUser.kelurahan,
                    kecamatan: updatedUser.kecamatan,
                    kabupaten: updatedUser.kabupaten,
                    provinsi: updatedUser.provinsi
                }));

                // Kirim event agar Navbar tahu foto profil diperbarui
                window.dispatchEvent(new Event('profileUpdated'));
                showToast('Foto profil berhasil diunggah!', 'success');
            } catch (err) {
                showToast('Gagal menyimpan foto profil ke server.', 'error');
            }
        };
        reader.readAsDataURL(file);
    };

    // Fungsi hapus foto profil
    const handleRemoveAvatar = async () => {
        const updatedProfile = { ...profile, avatar: null };
        setProfile(updatedProfile);

        try {
            const response = await api.put('/api/profile', {
                nama_lengkap: profile.nama,
                nik: profile.nik,
                no_hp: profile.telepon,
                alamat_lengkap: profile.alamat,
                desa: profile.desa,
                kelurahan: profile.kelurahan,
                kecamatan: profile.kecamatan,
                kabupaten: profile.kabupaten,
                provinsi: profile.provinsi,
                avatar: null
            });

            const updatedUser = response.data.user;
            const sesi = JSON.parse(sessionStorage.getItem('user'));
            if (sesi) {
                sesi.nama = updatedUser.nama_lengkap;
                sesi.avatar = updatedUser.avatar;
                sessionStorage.setItem('user', JSON.stringify(sesi));
            }

            localStorage.setItem(`profile_${updatedUser.email}`, JSON.stringify({
                nama: updatedUser.nama_lengkap,
                email: updatedUser.email,
                avatar: updatedUser.avatar,
                nik: updatedUser.nik,
                telepon: updatedUser.no_hp,
                alamat: updatedUser.alamat_lengkap,
                desa: updatedUser.desa,
                kelurahan: updatedUser.kelurahan,
                kecamatan: updatedUser.kecamatan,
                kabupaten: updatedUser.kabupaten,
                provinsi: updatedUser.provinsi
            }));

            window.dispatchEvent(new Event('profileUpdated'));
            showToast('Foto profil telah dihapus.', 'success');
        } catch (err) {
            showToast('Gagal menghapus foto profil di server.', 'error');
        }
    };

    // Fungsi simpan data profil
    const handleSaveProfile = async (e) => {
        e.preventDefault();

        // Validasi form
        if (!profile.nama.trim()) {
            showToast('Nama Lengkap tidak boleh kosong.', 'error');
            return;
        }

        // NIK harus 16 digit jika diisi
        if (profile.nik && (profile.nik.length !== 16 || isNaN(profile.nik))) {
            showToast('NIK harus berupa 16 digit angka.', 'error');
            return;
        }

        // Telepon harus numerik minimal 10 digit jika diisi
        if (profile.telepon && (profile.telepon.length < 10 || isNaN(profile.telepon))) {
            showToast('Nomor telepon tidak valid (minimal 10 digit).', 'error');
            return;
        }

        setSaving(true);

        try {
            const response = await api.put('/api/profile', {
                nama_lengkap: profile.nama.trim(),
                nik: profile.nik,
                no_hp: profile.telepon,
                alamat_lengkap: profile.alamat,
                desa: profile.desa,
                kelurahan: profile.kelurahan,
                kecamatan: profile.kecamatan,
                kabupaten: profile.kabupaten,
                provinsi: profile.provinsi,
                avatar: profile.avatar
            });

            const updatedUser = response.data.user;

            // Perbarui nama di sessionStorage agar Navbar ter-update
            const sesi = JSON.parse(sessionStorage.getItem('user'));
            if (sesi) {
                sesi.nama = updatedUser.nama_lengkap;
                sesi.avatar = updatedUser.avatar;
                sessionStorage.setItem('user', JSON.stringify(sesi));
            }

            localStorage.setItem(`profile_${updatedUser.email}`, JSON.stringify({
                nama: updatedUser.nama_lengkap,
                email: updatedUser.email,
                avatar: updatedUser.avatar,
                nik: updatedUser.nik,
                telepon: updatedUser.no_hp,
                alamat: updatedUser.alamat_lengkap,
                desa: updatedUser.desa,
                kelurahan: updatedUser.kelurahan,
                kecamatan: updatedUser.kecamatan,
                kabupaten: updatedUser.kabupaten,
                provinsi: updatedUser.provinsi
            }));

            // Refresh region list
            await fetchWilayah();

            // Kirim event untuk memberitahu Navbar
            window.dispatchEvent(new Event('profileUpdated'));

            showToast('Profil Anda berhasil diperbarui!', 'success');
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                showToast(err.response.data.message, 'error');
            } else {
                showToast('Gagal memperbarui profil.', 'error');
            }
        } finally {
            setSaving(false);
        }
    };

    // Fungsi ubah password
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        const { passwordLama, passwordBaru, konfirmasiPassword } = passwordData;

        // Validasi
        if (!passwordLama || !passwordBaru || !konfirmasiPassword) {
            showToast('Semua kolom password wajib diisi.', 'error');
            return;
        }

        if (passwordBaru.length < 8) {
            showToast('Password baru minimal harus 8 karakter.', 'error');
            return;
        }

        if (passwordBaru !== konfirmasiPassword) {
            showToast('Konfirmasi password baru tidak cocok.', 'error');
            return;
        }

        setSaving(true);

        try {
            await api.put('/api/profile/password', {
                password_lama: passwordLama,
                password_baru: passwordBaru
            });

            setPasswordData({
                passwordLama: '',
                passwordBaru: '',
                konfirmasiPassword: ''
            });
            showToast('Password berhasil diubah!', 'success');
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                showToast(err.response.data.message, 'error');
            } else {
                showToast('Kata sandi saat ini salah atau terjadi kesalahan.', 'error');
            }
        } finally {
            setSaving(false);
        }
    };



    const selectedProvObj = provinsis.find(p => p.nama_provinsi.toLowerCase() === (profile.provinsi || '').toLowerCase());
    const filteredKecamatans = selectedProvObj 
        ? kecamatans.filter(k => k.id_provinsi === selectedProvObj.id_provinsi)
        : kecamatans;

    const selectedKecObj = kecamatans.find(k => k.nama_kecamatan.toLowerCase() === (profile.kecamatan || '').toLowerCase());
    const filteredKelurahans = selectedKecObj
        ? kelurahans.filter(kl => kl.id_kecamatan === selectedKecObj.id_kecamatan)
        : kelurahans;

    if (loading) {
        return (
            <div className="bg-background min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <svg className="animate-spin h-10 w-10 text-primary-container" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-on-surface-variant font-medium">Memuat profil...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col antialiased">
            <Navbar />

            {/* Custom Toast Notification */}
            {toast.show && (
                <div className={`fixed top-24 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl transition-all duration-300 transform translate-y-0 border
                    ${toast.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                >
                    <span className="material-symbols-outlined text-2xl shrink-0">
                        {toast.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    <p className="text-sm font-semibold">{toast.message}</p>
                </div>
            )}

            {/* Top banner / Decorative header */}
            <div className="w-full h-48 bg-linear-to-r from-blue-700 via-primary-container to-blue-500 relative overflow-hidden flex items-end">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]"></div>
                <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
                <div className="absolute top-4 right-12 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>

                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 flex items-center gap-4 relative z-10">
                    <span className="material-symbols-outlined text-white/20 text-7xl absolute right-12 bottom-2 select-none pointer-events-none hidden md:block">manage_accounts</span>
                    <div>
                        <h1 className="text-white text-3xl font-extrabold font-h1 tracking-tight">Pengaturan Profil</h1>
                        <p className="text-blue-100 text-sm mt-1">Kelola data informasi akun dan sistem keamanan Anda di satu tempat</p>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left Panel: Profile Overview Card & Navigation */}
                    <div className="w-full lg:w-1/3 shrink-0 space-y-6">
                        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 shadow-[0px_10px_40px_rgba(15,23,42,0.04)] text-center relative overflow-hidden">
                            {/* Decorative elements */}
                            <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-blue-500 to-indigo-600"></div>

                            {/* Photo upload / Avatar section */}
                            <div className="relative w-32 h-32 mx-auto mt-4 group">
                                <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-md bg-blue-100 flex items-center justify-center">
                                    {profile.avatar ? (
                                        <img src={profile.avatar} alt="Foto Profil" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-blue-600 text-4xl font-extrabold">{profile.nama?.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>

                                {/* Edit photo overlay */}
                                <label className="absolute inset-0 bg-slate-900/60 rounded-full flex flex-col items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out border border-white/20">
                                    <span className="material-symbols-outlined text-2xl">photo_camera</span>
                                    <span className="text-[10px] font-semibold uppercase tracking-wider mt-1">Ubah Foto</span>
                                    <input type="file" onChange={handleAvatarChange} className="hidden" accept="image/*" />
                                </label>
                            </div>

                            {/* Remove photo button if exists */}
                            {profile.avatar && (
                                <button
                                    onClick={handleRemoveAvatar}
                                    className="mt-3 text-xs text-red-500 hover:text-red-700 transition-colors font-semibold flex items-center justify-center gap-1 mx-auto cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                    Hapus Foto
                                </button>
                            )}

                            {/* User details summary */}
                            <h2 className="text-xl font-bold text-slate-800 mt-5">{profile.nama}</h2>
                            <p className="text-sm text-slate-500 font-medium">{profile.email}</p>

                            {/* Role badge */}
                            <div className="mt-4 flex flex-wrap justify-center gap-2">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                                    ${profile.role === 'admin'
                                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[10px] font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                                        {profile.role === 'admin' ? 'admin_panel_settings' : 'verified'}
                                    </span>
                                    {profile.role === 'admin' ? 'Administrator' : 'Warga Terverifikasi'}
                                </span>
                            </div>

                            {/* Divider line */}
                            <div className="border-t border-slate-100 my-6"></div>

                            {/* Meta items */}
                            <div className="space-y-4 text-left">
                                <div className="flex items-center justify-between text-xs sm:text-sm">
                                    <span className="text-slate-400 font-medium">Status Akun</span>
                                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                        Aktif
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs sm:text-sm">
                                    <span className="text-slate-400 font-medium">Terdaftar Sejak</span>
                                    <span className="text-slate-700 font-semibold">{profile.tglDaftar}</span>
                                </div>
                                {profile.nik && (
                                    <div className="flex items-center justify-between text-xs sm:text-sm">
                                        <span className="text-slate-400 font-medium">Nomor Identitas (NIK)</span>
                                        <span className="text-slate-700 font-mono font-semibold">{profile.nik.substring(0, 6) + '**********'}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Navigation Sidebar Card */}
                        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-2">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-3 mb-2">Akun Saya</p>

                            <Link
                                to="/profile"
                                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold bg-blue-600 text-white shadow-md shadow-blue-500/10 transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg text-white" style={{ fontVariationSettings: "'FILL' 1" }}>manage_accounts</span>
                                Edit Profil
                            </Link>

                            <Link
                                to="/profile/riwayat"
                                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg text-slate-400">history</span>
                                Riwayat Laporan
                            </Link>
                        </div>
                    </div>

                    {/* Right Panel: Content Form Tabs */}
                    <div className="w-full lg:flex-1">
                        <div className="bg-white border border-outline-variant/30 rounded-3xl shadow-[0px_10px_40px_rgba(15,23,42,0.04)] overflow-hidden flex flex-col h-full">

                            {/* Tabs Navigation */}
                            <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-2">
                                <button
                                    onClick={() => setActiveTab('detail')}
                                    className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer
                                        ${activeTab === 'detail'
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: activeTab === 'detail' ? "'FILL' 1" : "'FILL' 0" }}>person</span>
                                    Informasi Pribadi
                                </button>
                                <button
                                    onClick={() => setActiveTab('keamanan')}
                                    className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer
                                        ${activeTab === 'keamanan'
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: activeTab === 'keamanan' ? "'FILL' 1" : "'FILL' 0" }}>security</span>
                                    Keamanan &amp; Sandi
                                </button>
                            </div>

                            {/* Tab Content Panel */}
                            <div className="p-6 md:p-8 grow">

                                {/* ===== TAB INFORMASI PRIBADI ===== */}
                                {activeTab === 'detail' && (
                                    <form onSubmit={handleSaveProfile} className="space-y-6">
                                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                            <div>
                                                <h3 className="font-h3 text-xl font-bold text-slate-800">Detail Informasi Pribadi</h3>
                                                <p className="text-xs text-slate-400 mt-1">Perbarui data kependudukan Anda untuk mempermudah verifikasi laporan</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Nama Lengkap */}
                                            <div className="space-y-2">
                                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider" htmlFor="p-nama">Nama Lengkap</label>
                                                <input
                                                    id="p-nama"
                                                    type="text"
                                                    value={profile.nama}
                                                    onChange={(e) => setProfile({ ...profile, nama: e.target.value })}
                                                    placeholder="Nama Lengkap sesuai KTP"
                                                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 font-body-md text-slate-800 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
                                                />
                                            </div>

                                            {/* Email (Read Only / Locked) */}
                                            <div className="space-y-2">
                                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider items-center gap-1.5">
                                                    Email
                                                    <span className="material-symbols-outlined text-slate-400 text-sm" title="Email terikat pada akun Anda dan tidak dapat diubah">lock</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="email"
                                                        value={profile.email}
                                                        readOnly
                                                        className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 font-body-md text-slate-500 cursor-not-allowed outline-none pl-11"
                                                    />
                                                    <span className="material-symbols-outlined text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 text-lg">mail</span>
                                                </div>
                                            </div>

                                            {/* NIK */}
                                            <div className="space-y-2">
                                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider" htmlFor="p-nik">Nomor Induk Kependudukan (NIK)</label>
                                                <input
                                                    id="p-nik"
                                                    type="text"
                                                    maxLength={16}
                                                    value={profile.nik}
                                                    onChange={(e) => setProfile({ ...profile, nik: e.target.value.replace(/[^0-9]/g, '') })}
                                                    placeholder="16 Digit NIK KTP Anda"
                                                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 font-body-md text-slate-800 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
                                                />
                                                <p className="text-[10px] text-slate-400 mt-1">NIK valid diperlukan untuk menghindari pelaporan palsu (spam).</p>
                                            </div>

                                            {/* Nomor Telepon */}
                                            <div className="space-y-2">
                                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider" htmlFor="p-nohp">Nomor Telepon / WhatsApp</label>
                                                <input
                                                    id="p-nohp"
                                                    type="tel"
                                                    value={profile.telepon}
                                                    onChange={(e) => setProfile({ ...profile, telepon: e.target.value.replace(/[^0-9+]/g, '') })}
                                                    placeholder="08xxxxxxxxxx"
                                                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 font-body-md text-slate-800 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
                                                />
                                            </div>
                                        </div>

                                        {/* Alamat Lengkap */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider" htmlFor="p-alamat">Alamat Lengkap (Nama Jalan, Blok, No. Rumah, RT/RW)</label>
                                            <textarea
                                                id="p-alamat"
                                                rows="2"
                                                value={profile.alamat}
                                                onChange={(e) => setProfile({ ...profile, alamat: e.target.value })}
                                                placeholder="Nama jalan, Nomor rumah, RT/RW"
                                                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 font-body-md text-slate-800 focus:ring-2 focus:ring-blue-500/10 transition-all resize-y outline-none"
                                            ></textarea>
                                        </div>

                                        {/* Grid Kelengkapan Alamat Kependudukan */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {/* Provinsi */}
                                            <AutocompleteSelect
                                                label="Provinsi"
                                                placeholder="Pilih atau cari Provinsi..."
                                                value={profile.provinsi}
                                                onChange={(val) => {
                                                    setProfile(prev => ({
                                                        ...prev,
                                                        provinsi: val,
                                                        kecamatan: '',
                                                        desa: '',
                                                        kelurahan: ''
                                                    }));
                                                }}
                                                options={provinsis.map(p => p.nama_provinsi)}
                                            />

                                            {/* Kecamatan */}
                                            <AutocompleteSelect
                                                label="Kecamatan"
                                                placeholder="Pilih atau cari Kecamatan..."
                                                value={profile.kecamatan}
                                                onChange={(val) => {
                                                    setProfile(prev => ({
                                                        ...prev,
                                                        kecamatan: val,
                                                        desa: '',
                                                        kelurahan: ''
                                                    }));
                                                }}
                                                disabled={!profile.provinsi}
                                                options={filteredKecamatans.map(k => k.nama_kecamatan)}
                                            />

                                            {/* Desa / Kelurahan */}
                                            <AutocompleteSelect
                                                label="Desa / Kelurahan"
                                                placeholder="Pilih atau cari Desa/Kelurahan..."
                                                value={profile.desa}
                                                onChange={(val) => {
                                                    setProfile(prev => ({
                                                        ...prev,
                                                        desa: val,
                                                        kelurahan: val
                                                    }));
                                                }}
                                                disabled={!profile.kecamatan}
                                                options={filteredKelurahans.map(kl => kl.nama_kelurahan)}
                                            />

                                            {/* Kabupaten */}
                                            <div className="space-y-2">
                                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider" htmlFor="p-kabupaten">Kabupaten / Kota</label>
                                                <input
                                                    id="p-kabupaten"
                                                    type="text"
                                                    value={profile.kabupaten || ''}
                                                    onChange={(e) => setProfile({ ...profile, kabupaten: e.target.value })}
                                                    placeholder="Nama Kabupaten/Kota"
                                                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 font-body-md text-slate-800 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
                                                />
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="border-t border-slate-100 pt-6 flex justify-end gap-3">
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-[0px_5px_20px_rgba(37,99,235,0.2)] flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                {saving ? (
                                                    <>
                                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                        </svg>
                                                        Menyimpan...
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="material-symbols-outlined text-lg">save</span>
                                                        Simpan Profil
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* ===== TAB KEAMANAN & SANDI ===== */}
                                {activeTab === 'keamanan' && (
                                    <form onSubmit={handlePasswordChange} className="space-y-6">
                                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                            <div>
                                                <h3 className="font-h3 text-xl font-bold text-slate-800">Ubah Kata Sandi</h3>
                                                <p className="text-xs text-slate-400 mt-1">Lindungi keamanan akun Anda dengan mengganti kata sandi secara berkala</p>
                                            </div>
                                        </div>

                                        <div className="space-y-5 max-w-xl">
                                            {/* Current Password */}
                                            <div className="space-y-2">
                                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider" htmlFor="p-oldpass">Kata Sandi Saat Ini</label>
                                                <input
                                                    id="p-oldpass"
                                                    type="password"
                                                    value={passwordData.passwordLama}
                                                    onChange={(e) => setPasswordData({ ...passwordData, passwordLama: e.target.value })}
                                                    placeholder="••••••••"
                                                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 font-body-md text-slate-800 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
                                                />
                                            </div>

                                            {/* New Password */}
                                            <div className="space-y-2">
                                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider" htmlFor="p-newpass">Kata Sandi Baru</label>
                                                <input
                                                    id="p-newpass"
                                                    type="password"
                                                    value={passwordData.passwordBaru}
                                                    onChange={(e) => setPasswordData({ ...passwordData, passwordBaru: e.target.value })}
                                                    placeholder="Minimal 6 karakter"
                                                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 font-body-md text-slate-800 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
                                                />
                                            </div>

                                            {/* Confirm New Password */}
                                            <div className="space-y-2">
                                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider" htmlFor="p-confpass">Ulangi Kata Sandi Baru</label>
                                                <input
                                                    id="p-confpass"
                                                    type="password"
                                                    value={passwordData.konfirmasiPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, konfirmasiPassword: e.target.value })}
                                                    placeholder="Ulangi Sandi Baru"
                                                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 font-body-md text-slate-800 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
                                                />
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="border-t border-slate-100 pt-6 flex justify-end gap-3">
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-[0px_5px_20px_rgba(37,99,235,0.2)] flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                {saving ? (
                                                    <>
                                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                        </svg>
                                                        Menyimpan...
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="material-symbols-outlined text-lg">vpn_key</span>
                                                        Ubah Password
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                )}

                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
