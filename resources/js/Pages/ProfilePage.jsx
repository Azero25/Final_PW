import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

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

    // Efek inisialisasi halaman
    useEffect(() => {
        window.scrollTo(0, 0);
        
        const sesi = sessionStorage.getItem('user');
        if (!sesi) {
            // Jika belum login, arahkan ke login
            showToast('Silakan masuk terlebih dahulu untuk mengedit profil Anda.', 'error');
            setTimeout(() => navigate('/login'), 1500);
            return;
        }

        const activeUser = JSON.parse(sesi);
        setUser(activeUser);

        // Cari data profil di localStorage
        const storedProfileKey = `profile_${activeUser.email}`;
        const storedProfile = localStorage.getItem(storedProfileKey);

        if (storedProfile) {
            setProfile(JSON.parse(storedProfile));
        } else {
            // Inisialisasi default berdasarkan dummy user
            let defaultProfile = {
                nama: activeUser.nama || '',
                email: activeUser.email || '',
                role: activeUser.role || 'warga',
                nik: '',
                telepon: '',
                alamat: '',
                desa: '',
                kelurahan: '',
                kecamatan: '',
                kabupaten: '',
                provinsi: '',
                avatar: null,
                tglDaftar: activeUser.role === 'admin' ? '01 Desember 2023' : '18 Maret 2024',
                status: 'Terverifikasi'
            };

            // Berikan data dummy lebih lengkap untuk akun bawaan
            if (activeUser.email === 'warga@email.com') {
                defaultProfile.nik = '3471020304950001';
                defaultProfile.telepon = '081234567890';
                defaultProfile.alamat = 'Jl. Malioboro No. 12';
                defaultProfile.desa = 'Sosromenduran';
                defaultProfile.kelurahan = 'Sosromenduran';
                defaultProfile.kecamatan = 'Gedongtengen';
                defaultProfile.kabupaten = 'Kota Yogyakarta';
                defaultProfile.provinsi = 'DI Yogyakarta';
            } else if (activeUser.email === 'admin@lapor.go.id') {
                defaultProfile.nik = '3471010101010001';
                defaultProfile.telepon = '089876543210';
                defaultProfile.alamat = 'Kantor Balaikota Yogyakarta, Jl. Kenari No. 56';
                defaultProfile.desa = 'Muja Muju';
                defaultProfile.kelurahan = 'Muja Muju';
                defaultProfile.kecamatan = 'Umbulharjo';
                defaultProfile.kabupaten = 'Kota Yogyakarta';
                defaultProfile.provinsi = 'DI Yogyakarta';
                defaultProfile.status = 'Admin Utama';
            }

            setProfile(defaultProfile);
            localStorage.setItem(storedProfileKey, JSON.stringify(defaultProfile));
        }
        
        setLoading(false);
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
        reader.onload = (event) => {
            const base64Image = event.target.result;
            const updatedProfile = { ...profile, avatar: base64Image };
            setProfile(updatedProfile);
            
            // Simpan di local storage
            if (user) {
                localStorage.setItem(`profile_${user.email}`, JSON.stringify(updatedProfile));
                
                // Kirim event agar Navbar tahu foto profil diperbarui
                window.dispatchEvent(new Event('profileUpdated'));
                showToast('Foto profil berhasil diunggah!', 'success');
            }
        };
        reader.readAsDataURL(file);
    };

    // Fungsi hapus foto profil
    const handleRemoveAvatar = () => {
        const updatedProfile = { ...profile, avatar: null };
        setProfile(updatedProfile);
        
        if (user) {
            localStorage.setItem(`profile_${user.email}`, JSON.stringify(updatedProfile));
            window.dispatchEvent(new Event('profileUpdated'));
            showToast('Foto profil telah dihapus.', 'success');
        }
    };

    // Fungsi simpan data profil
    const handleSaveProfile = (e) => {
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

        setTimeout(() => {
            const storedProfileKey = `profile_${user.email}`;
            localStorage.setItem(storedProfileKey, JSON.stringify(profile));

            // Perbarui nama di sessionStorage agar Navbar ter-update
            const sesi = JSON.parse(sessionStorage.getItem('user'));
            if (sesi) {
                sesi.nama = profile.nama;
                sessionStorage.setItem('user', JSON.stringify(sesi));
            }

            // Kirim event untuk memberitahu Navbar
            window.dispatchEvent(new Event('profileUpdated'));
            
            setSaving(false);
            showToast('Profil Anda berhasil diperbarui!', 'success');
        }, 1200);
    };

    // Fungsi ubah password
    const handlePasswordChange = (e) => {
        e.preventDefault();
        const { passwordLama, passwordBaru, konfirmasiPassword } = passwordData;

        // Validasi
        if (!passwordLama || !passwordBaru || !konfirmasiPassword) {
            showToast('Semua kolom password wajib diisi.', 'error');
            return;
        }

        if (passwordBaru.length < 6) {
            showToast('Password baru minimal harus 6 karakter.', 'error');
            return;
        }

        if (passwordBaru !== konfirmasiPassword) {
            showToast('Konfirmasi password baru tidak cocok.', 'error');
            return;
        }

        setSaving(true);

        setTimeout(() => {
            // Simulasi verifikasi password lama berdasarkan default password demo
            let defaultPassword = 'warga123';
            if (user.email === 'admin@lapor.go.id') {
                defaultPassword = 'admin123';
            }

            // Bisa juga cek dari localStorage jika user pernah mengubahnya
            const customPassKey = `pwd_${user.email}`;
            const storedPassword = localStorage.getItem(customPassKey);
            const activePassword = storedPassword || defaultPassword;

            if (passwordLama !== activePassword) {
                setSaving(false);
                showToast('Password saat ini salah. Silakan coba lagi.', 'error');
                return;
            }

            // Simpan password baru di localStorage
            localStorage.setItem(customPassKey, passwordBaru);
            
            setSaving(false);
            setPasswordData({
                passwordLama: '',
                passwordBaru: '',
                konfirmasiPassword: ''
            });
            showToast('Password berhasil diubah!', 'success');
        }, 1200);
    };

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
                    <span className="material-symbols-outlined text-2xl flex-shrink-0">
                        {toast.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    <p className="text-sm font-semibold">{toast.message}</p>
                </div>
            )}

            {/* Top banner / Decorative header */}
            <div className="w-full h-48 bg-gradient-to-r from-blue-700 via-primary-container to-blue-500 relative overflow-hidden flex items-end">
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
            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Left Panel: Profile Overview Card */}
                    <div className="w-full lg:w-1/3 flex-shrink-0">
                        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 shadow-[0px_10px_40px_rgba(15,23,42,0.04)] text-center relative overflow-hidden">
                            {/* Decorative elements */}
                            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

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
                            <div className="p-6 md:p-8 flex-grow">
                                
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
                                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
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
                                                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 font-body-md text-slate-800 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none font-mono"
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
                                            {/* Desa / Kelurahan */}
                                            <div className="space-y-2">
                                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider" htmlFor="p-desa">Desa / Kelurahan</label>
                                                <input 
                                                    id="p-desa"
                                                    type="text" 
                                                    value={profile.desa || ''} 
                                                    onChange={(e) => setProfile({ ...profile, desa: e.target.value, kelurahan: e.target.value })}
                                                    placeholder="Nama Desa atau Kelurahan"
                                                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 font-body-md text-slate-800 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
                                                />
                                            </div>

                                            {/* Kecamatan */}
                                            <div className="space-y-2">
                                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider" htmlFor="p-kecamatan">Kecamatan</label>
                                                <input 
                                                    id="p-kecamatan"
                                                    type="text" 
                                                    value={profile.kecamatan || ''} 
                                                    onChange={(e) => setProfile({ ...profile, kecamatan: e.target.value })}
                                                    placeholder="Nama Kecamatan"
                                                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3 font-body-md text-slate-800 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
                                                />
                                            </div>

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

                                            {/* Provinsi */}
                                            <div className="space-y-2">
                                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider" htmlFor="p-provinsi">Provinsi</label>
                                                <input 
                                                    id="p-provinsi"
                                                    type="text" 
                                                    value={profile.provinsi || ''} 
                                                    onChange={(e) => setProfile({ ...profile, provinsi: e.target.value })}
                                                    placeholder="Nama Provinsi"
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
