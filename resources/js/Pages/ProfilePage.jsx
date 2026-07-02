import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import api from '../axios';


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

    // State wilayah cascading
    const [suggestions, setSuggestions] = useState({ provinsi: [], kabupaten: [], kecamatan: [], kelurahan: [] });
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [selectedIds, setSelectedIds] = useState({
        id_provinsi: null,
        id_kabupaten: null,
        id_kecamatan: null,
        id_kelurahan: null
    });

    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = () => setActiveDropdown(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
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
 
                const kel = activeUser.kelurahan;
                const kec = kel?.kecamatan;
                const kab = kec?.kabupaten;
                const prov = kab?.provinsi;

                setProfile({
                    nama: activeUser.nama_lengkap || '',
                    email: activeUser.email || '',
                    role: activeUser.role || 'warga',
                    nik: activeUser.nik || '',
                    telepon: activeUser.no_hp || '',
                    alamat: activeUser.alamat_lengkap || '',
                    kelurahan: kel?.nama_kelurahan || '',
                    kecamatan: kec?.nama_kecamatan || '',
                    kabupaten: kab?.nama_kabupaten || '',
                    provinsi: prov?.nama_provinsi || '',
                    avatar: activeUser.avatar || null,
                    tglDaftar: activeUser.tanggal_bergabung ? new Date(activeUser.tanggal_bergabung).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '18 Maret 2024',
                    status: activeUser.status || 'Terverifikasi'
                });

                setSelectedIds({
                    id_provinsi: prov?.id_provinsi || null,
                    id_kabupaten: kab?.id_kabupaten || null,
                    id_kecamatan: kec?.id_kecamatan || null,
                    id_kelurahan: kel?.id_kelurahan || null
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
                    kelurahan: updatedUser.kelurahan?.nama_kelurahan || '',
                    kecamatan: updatedUser.kelurahan?.kecamatan?.nama_kecamatan || '',
                    kabupaten: updatedUser.kelurahan?.kecamatan?.kabupaten?.nama_kabupaten || '',
                    provinsi: updatedUser.kelurahan?.kecamatan?.kabupaten?.provinsi?.nama_provinsi || ''
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
                kelurahan: updatedUser.kelurahan?.nama_kelurahan || '',
                kecamatan: updatedUser.kelurahan?.kecamatan?.nama_kecamatan || '',
                kabupaten: updatedUser.kelurahan?.kecamatan?.kabupaten?.nama_kabupaten || '',
                provinsi: updatedUser.kelurahan?.kecamatan?.kabupaten?.provinsi?.nama_provinsi || ''
            }));

            window.dispatchEvent(new Event('profileUpdated'));
            showToast('Foto profil telah dihapus.', 'success');
        } catch (err) {
            showToast('Gagal menghapus foto profil di server.', 'error');
        }
    };

    const handleManualSearch = async (type, query) => {
        setProfile(prev => ({ ...prev, [type]: query }));

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
            setProfile(prev => ({ ...prev, provinsi: item.nama_provinsi, kabupaten: '', kecamatan: '', kelurahan: '' }));
            setSelectedIds({ id_provinsi: item.id_provinsi, id_kabupaten: null, id_kecamatan: null, id_kelurahan: null });
        } else if (type === 'kabupaten') {
            setProfile(prev => ({ ...prev, kabupaten: item.nama_kabupaten, kecamatan: '', kelurahan: '' }));
            setSelectedIds(prev => ({ ...prev, id_kabupaten: item.id_kabupaten, id_kecamatan: null, id_kelurahan: null }));
        } else if (type === 'kecamatan') {
            setProfile(prev => ({ ...prev, kecamatan: item.nama_kecamatan, kelurahan: '' }));
            setSelectedIds(prev => ({ ...prev, id_kecamatan: item.id_kecamatan, id_kelurahan: null }));
        } else if (type === 'kelurahan') {
            setProfile(prev => ({ ...prev, kelurahan: item.nama_kelurahan }));
            setSelectedIds(prev => ({ ...prev, id_kelurahan: item.id_kelurahan }));
        }
        setActiveDropdown(null);
    };

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
                    setProfile(prev => ({ ...prev, provinsi: newItem.nama_provinsi, kabupaten: '', kecamatan: '', kelurahan: '' }));
                    setSelectedIds({ id_provinsi: newItem.id_provinsi, id_kabupaten: null, id_kecamatan: null, id_kelurahan: null });
                } else if (type === 'kabupaten') {
                    setProfile(prev => ({ ...prev, kabupaten: newItem.nama_kabupaten, kecamatan: '', kelurahan: '' }));
                    setSelectedIds(prev => ({ ...prev, id_kabupaten: newItem.id_kabupaten, id_kecamatan: null, id_kelurahan: null }));
                } else if (type === 'kecamatan') {
                    setProfile(prev => ({ ...prev, kecamatan: newItem.nama_kecamatan, kelurahan: '' }));
                    setSelectedIds(prev => ({ ...prev, id_kecamatan: newItem.id_kecamatan, id_kelurahan: null }));
                } else if (type === 'kelurahan') {
                    setProfile(prev => ({ ...prev, kelurahan: newItem.nama_kelurahan }));
                    setSelectedIds(prev => ({ ...prev, id_kelurahan: newItem.id_kelurahan }));
                }

                setActiveDropdown(null);
                showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} baru berhasil ditambahkan!`, 'success');
            }
        } catch (error) {
            console.error(`Gagal menambahkan ${type} baru:`, error);
            showToast(error.response?.data?.message || `Sistem gagal mendaftarkan data ${type} baru.`, 'error');
        } finally {
            setSaving(false);
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

        // Pastikan ID Kelurahan sudah terkunci dari relasi valid database sebelum submit
        if (!selectedIds.id_kelurahan) {
            showToast('Silakan pilih atau tambah Desa/Kelurahan resmi yang tersedia dari daftar dropdown', 'error');
            return;
        }

        setSaving(true);

        try {
            const response = await api.put('/api/profile', {
                nama_lengkap: profile.nama.trim(),
                nik: profile.nik,
                no_hp: profile.telepon,
                alamat_lengkap: profile.alamat,
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
                kelurahan: updatedUser.kelurahan?.nama_kelurahan || '',
                kecamatan: updatedUser.kelurahan?.kecamatan?.nama_kecamatan || '',
                kabupaten: updatedUser.kelurahan?.kecamatan?.kabupaten?.nama_kabupaten || '',
                provinsi: updatedUser.kelurahan?.kecamatan?.kabupaten?.provinsi?.nama_provinsi || ''
            }));

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

                                        {/* Grid Kelengkapan Alamat Kependudukan – Cascading Regional */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                            {/* ── Provinsi ── */}
                                            <div className="space-y-2 relative">
                                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                                                    Provinsi
                                                </label>
                                                <div className="relative" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="text"
                                                        id="p-provinsi"
                                                        value={profile.provinsi || ''}
                                                        onChange={(e) => handleManualSearch('provinsi', e.target.value)}
                                                        onFocus={() => setActiveDropdown('provinsi')}
                                                        placeholder="Cari atau ketik nama provinsi..."
                                                        autoComplete="off"
                                                        className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none pr-10
                                                            ${selectedIds.id_provinsi ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 focus:border-blue-500'}`}
                                                    />
                                                    {selectedIds.id_provinsi && (
                                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 text-lg">check_circle</span>
                                                    )}
                                                </div>
                                                {activeDropdown === 'provinsi' && (suggestions.provinsi?.length > 0 || profile.provinsi?.trim().length >= 2) && (
                                                    <div
                                                        className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-52 overflow-y-auto"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {suggestions.provinsi?.map((item, idx) => (
                                                            <button
                                                                key={item.id_provinsi ?? idx}
                                                                type="button"
                                                                onClick={() => handleSelectManual('provinsi', item)}
                                                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                                            >
                                                                {item.nama_provinsi}
                                                            </button>
                                                        ))}
                                                        {profile.provinsi?.trim().length >= 2 && !selectedIds.id_provinsi && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCreateNewWilayah('provinsi', profile.provinsi)}
                                                                className="w-full text-left px-4 py-2.5 text-sm text-blue-600 font-semibold hover:bg-blue-50 border-t border-slate-100 flex items-center gap-2"
                                                            >
                                                                <span className="material-symbols-outlined text-base">add_circle</span>
                                                                Tambah &ldquo;{profile.provinsi}&rdquo; sebagai provinsi baru
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* ── Kabupaten / Kota ── */}
                                            <div className="space-y-2 relative">
                                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                                                    Kabupaten / Kota
                                                </label>
                                                <div className="relative" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="text"
                                                        id="p-kabupaten"
                                                        value={profile.kabupaten || ''}
                                                        onChange={(e) => handleManualSearch('kabupaten', e.target.value)}
                                                        onFocus={() => { if (selectedIds.id_provinsi) setActiveDropdown('kabupaten'); }}
                                                        disabled={!selectedIds.id_provinsi}
                                                        placeholder={selectedIds.id_provinsi ? 'Cari atau ketik nama kabupaten...' : 'Pilih provinsi terlebih dahulu'}
                                                        autoComplete="off"
                                                        className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none pr-10
                                                            ${!selectedIds.id_provinsi ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}
                                                            ${selectedIds.id_kabupaten ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 focus:border-blue-500'}`}
                                                    />
                                                    {selectedIds.id_kabupaten && (
                                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 text-lg">check_circle</span>
                                                    )}
                                                </div>
                                                {activeDropdown === 'kabupaten' && (suggestions.kabupaten?.length > 0 || profile.kabupaten?.trim().length >= 2) && (
                                                    <div
                                                        className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-52 overflow-y-auto"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {suggestions.kabupaten?.map((item, idx) => (
                                                            <button
                                                                key={item.id_kabupaten ?? idx}
                                                                type="button"
                                                                onClick={() => handleSelectManual('kabupaten', item)}
                                                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                                            >
                                                                {item.nama_kabupaten}
                                                            </button>
                                                        ))}
                                                        {profile.kabupaten?.trim().length >= 2 && !selectedIds.id_kabupaten && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCreateNewWilayah('kabupaten', profile.kabupaten)}
                                                                className="w-full text-left px-4 py-2.5 text-sm text-blue-600 font-semibold hover:bg-blue-50 border-t border-slate-100 flex items-center gap-2"
                                                            >
                                                                <span className="material-symbols-outlined text-base">add_circle</span>
                                                                Tambah &ldquo;{profile.kabupaten}&rdquo; sebagai kabupaten baru
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* ── Kecamatan ── */}
                                            <div className="space-y-2 relative">
                                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                                                    Kecamatan
                                                </label>
                                                <div className="relative" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="text"
                                                        id="p-kecamatan"
                                                        value={profile.kecamatan || ''}
                                                        onChange={(e) => handleManualSearch('kecamatan', e.target.value)}
                                                        onFocus={() => { if (selectedIds.id_kabupaten) setActiveDropdown('kecamatan'); }}
                                                        disabled={!selectedIds.id_kabupaten}
                                                        placeholder={selectedIds.id_kabupaten ? 'Cari atau ketik nama kecamatan...' : 'Pilih kabupaten terlebih dahulu'}
                                                        autoComplete="off"
                                                        className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none pr-10
                                                            ${!selectedIds.id_kabupaten ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}
                                                            ${selectedIds.id_kecamatan ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 focus:border-blue-500'}`}
                                                    />
                                                    {selectedIds.id_kecamatan && (
                                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 text-lg">check_circle</span>
                                                    )}
                                                </div>
                                                {activeDropdown === 'kecamatan' && (suggestions.kecamatan?.length > 0 || profile.kecamatan?.trim().length >= 2) && (
                                                    <div
                                                        className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-52 overflow-y-auto"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {suggestions.kecamatan?.map((item, idx) => (
                                                            <button
                                                                key={item.id_kecamatan ?? idx}
                                                                type="button"
                                                                onClick={() => handleSelectManual('kecamatan', item)}
                                                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                                            >
                                                                {item.nama_kecamatan}
                                                            </button>
                                                        ))}
                                                        {profile.kecamatan?.trim().length >= 2 && !selectedIds.id_kecamatan && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCreateNewWilayah('kecamatan', profile.kecamatan)}
                                                                className="w-full text-left px-4 py-2.5 text-sm text-blue-600 font-semibold hover:bg-blue-50 border-t border-slate-100 flex items-center gap-2"
                                                            >
                                                                <span className="material-symbols-outlined text-base">add_circle</span>
                                                                Tambah &ldquo;{profile.kecamatan}&rdquo; sebagai kecamatan baru
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* ── Kelurahan / Desa ── */}
                                            <div className="space-y-2 relative">
                                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                                                    Desa / Kelurahan
                                                </label>
                                                <div className="relative" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="text"
                                                        id="p-kelurahan"
                                                        value={profile.kelurahan || ''}
                                                        onChange={(e) => handleManualSearch('kelurahan', e.target.value)}
                                                        onFocus={() => { if (selectedIds.id_kecamatan) setActiveDropdown('kelurahan'); }}
                                                        disabled={!selectedIds.id_kecamatan}
                                                        placeholder={selectedIds.id_kecamatan ? 'Cari atau ketik nama desa/kelurahan...' : 'Pilih kecamatan terlebih dahulu'}
                                                        autoComplete="off"
                                                        className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/10 transition-all outline-none pr-10
                                                            ${!selectedIds.id_kecamatan ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}
                                                            ${selectedIds.id_kelurahan ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 focus:border-blue-500'}`}
                                                    />
                                                    {selectedIds.id_kelurahan && (
                                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 text-lg">check_circle</span>
                                                    )}
                                                </div>
                                                {activeDropdown === 'kelurahan' && (suggestions.kelurahan?.length > 0 || profile.kelurahan?.trim().length >= 2) && (
                                                    <div
                                                        className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-52 overflow-y-auto"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {suggestions.kelurahan?.map((item, idx) => (
                                                            <button
                                                                key={item.id_kelurahan ?? idx}
                                                                type="button"
                                                                onClick={() => handleSelectManual('kelurahan', item)}
                                                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                                            >
                                                                {item.nama_kelurahan}
                                                            </button>
                                                        ))}
                                                        {profile.kelurahan?.trim().length >= 2 && !selectedIds.id_kelurahan && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCreateNewWilayah('kelurahan', profile.kelurahan)}
                                                                className="w-full text-left px-4 py-2.5 text-sm text-blue-600 font-semibold hover:bg-blue-50 border-t border-slate-100 flex items-center gap-2"
                                                            >
                                                                <span className="material-symbols-outlined text-base">add_circle</span>
                                                                Tambah &ldquo;{profile.kelurahan}&rdquo; sebagai desa/kelurahan baru
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
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
