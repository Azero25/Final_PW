import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

/**
 * Komponen Navbar Bersama (Public) — Mobile Responsive
 * Hamburger menu untuk layar kecil, nav horizontal untuk layar besar.
 */
export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const menuRef = useRef(null);

    // Fungsi memuat data user terbaru dari sessionStorage & localStorage
    const loadUser = () => {
        const sesi = sessionStorage.getItem('user');
        if (sesi) {
            const parsedUser = JSON.parse(sesi);
            // Muat profile tambahan dari localStorage jika ada (seperti nama baru dan avatar)
            const localData = localStorage.getItem(`profile_${parsedUser.email}`);
            if (localData) {
                const profile = JSON.parse(localData);
                setUser({
                    ...parsedUser,
                    nama: profile.nama || parsedUser.nama,
                    avatar: profile.avatar || parsedUser.avatar || null
                });
            } else {
                setUser(parsedUser);
            }
        } else {
            setUser(null);
        }
    };

    // Muat user saat pindah halaman
    useEffect(() => {
        loadUser();
        setMenuOpen(false);
        setDropdownOpen(false);
    }, [location.pathname]);

    // Listener event agar Navbar langsung update saat profil diubah
    useEffect(() => {
        window.addEventListener('profileUpdated', loadUser);
        return () => window.removeEventListener('profileUpdated', loadUser);
    }, []);

    // Tutup menu & dropdown saat klik di luar
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        setUser(null);
        navigate('/');
    };

    const menuItems = [
        { label: 'Beranda',    to: '/',           icon: 'home' },
        { label: 'Cara Kerja', to: '/cara-kerja', icon: 'help_outline' },
        { label: 'Statistik',  to: '/statistik',  icon: 'bar_chart' },
        { label: 'Lacak',      to: '/lacak',      icon: 'manage_search' },
    ];

    const isActive = (to) => {
        if (to === '/') return location.pathname === '/';
        return location.pathname.startsWith(to);
    };

    return (
        <nav className="bg-white font-public-sans antialiased fixed top-0 left-0 w-full z-50 border-b border-slate-200 shadow-sm" ref={menuRef}>
            <div className="flex justify-between items-center px-4 sm:px-6 lg:px-12 py-3 max-w-screen-2xl mx-auto w-full">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                    <span className="material-symbols-outlined text-3xl text-blue-700" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
                    <span className="text-lg sm:text-xl font-bold tracking-tight text-blue-700">LaporWarga</span>
                </Link>

                {/* Desktop: menu tengah */}
                <div className="hidden md:flex items-center gap-6">
                    {menuItems.map((item) => (
                        <Link key={item.to} to={item.to}
                            className={`pb-1 text-sm transition-all duration-200
                                ${isActive(item.to)
                                    ? 'text-blue-700 font-semibold border-b-2 border-blue-700'
                                    : 'text-slate-600 hover:text-blue-600'}`}>
                            {item.label}
                        </Link>
                    ))}
                </div>

                {/* Kanan: auth + hamburger */}
                <div className="flex items-center gap-2">

                    {/* Auth section (desktop) */}
                    {user ? (
                        <div className="hidden md:flex items-center gap-4 relative">
                            {/* Tombol Buat Laporan — hanya untuk warga */}
                            {user.role !== 'admin' && (
                                <Link
                                    to="/buat-pengaduan"
                                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                                    Buat Laporan
                                </Link>
                            )}
                            {/* User Avatar + Dropdown Trigger */}
                            <button 
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/20"
                            >
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden border border-blue-500/10">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-white text-sm font-bold">{user.nama?.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="flex flex-col items-start max-w-[120px]">
                                    <span className="text-slate-800 text-sm font-bold leading-tight truncate w-full text-left">{user.nama}</span>
                                    <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">{user.role === 'admin' ? 'Admin' : 'Warga'}</span>
                                </div>
                                <span className="material-symbols-outlined text-slate-400 text-sm transition-transform duration-200" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }}>expand_more</span>
                            </button>

                            {/* Dropdown Menu */}
                            {dropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-slate-100 shadow-[0px_10px_35px_rgba(15,23,42,0.08)] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-4 py-1.5 border-b border-slate-50">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Aktivitas</p>
                                    </div>
                                    <Link 
                                        to="/profile" 
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium"
                                    >
                                        <span className="material-symbols-outlined text-lg text-slate-400">manage_accounts</span>
                                        Edit Profil
                                    </Link>
                                    <Link 
                                        to="/profile/riwayat" 
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium"
                                    >
                                        <span className="material-symbols-outlined text-lg text-slate-400">history</span>
                                        Riwayat Laporan
                                    </Link>
                                    {user.role === 'admin' && (
                                        <Link 
                                            to="/admin/dashboard" 
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium"
                                        >
                                            <span className="material-symbols-outlined text-lg text-slate-400">dashboard</span>
                                            Admin Dashboard
                                        </Link>
                                    )}
                                    <div className="border-t border-slate-100 my-1"></div>
                                    <button 
                                        onClick={() => { setDropdownOpen(false); handleLogout(); }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-medium cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-lg text-red-500">logout</span>
                                        Keluar
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center gap-2">
                            <Link to="/login" className="px-4 py-2 text-sm text-blue-700 border border-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                                Login
                            </Link>
                            <Link to="/register" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                                Register
                            </Link>
                        </div>
                    )}

                    {/* Hamburger Button (mobile) */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                        aria-label="Toggle menu"
                    >
                        <span className="material-symbols-outlined text-2xl">
                            {menuOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-4 pb-4 pt-1 bg-white border-t border-slate-100 space-y-1">

                    {/* Menu navigasi */}
                    {menuItems.map((item) => (
                        <Link key={item.to} to={item.to}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                                ${isActive(item.to)
                                    ? 'bg-blue-50 text-blue-700 font-semibold'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'}`}>
                            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}

                    {/* Divider */}
                    <div className="border-t border-slate-100 my-2"></div>

                    {/* Auth mobile */}
                    {user ? (
                        <div className="space-y-1">
                            {/* Info user */}
                            <Link to="/profile" className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent hover:border-slate-100 ${user.role === 'admin' ? 'bg-slate-800 text-white hover:bg-slate-750' : 'bg-blue-50 hover:bg-blue-100/50'}`}>
                                <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden border border-blue-600/10">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-white text-sm font-bold">{user.nama?.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-bold truncate ${user.role === 'admin' ? 'text-white' : 'text-blue-700'}`}>{user.nama}</p>
                                    <p className={`text-xs truncate ${user.role === 'admin' ? 'text-blue-400' : 'text-blue-500'}`}>{user.email}</p>
                                </div>
                                <span className="material-symbols-outlined text-xs opacity-60">arrow_forward_ios</span>
                            </Link>
                            {/* Buat Laporan link — hanya untuk warga */}
                            {user.role !== 'admin' && (
                                <Link to="/buat-pengaduan"
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                                    Buat Laporan
                                </Link>
                            )}
                            {/* Edit Profil link */}
                            <Link to="/profile"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-slate-50 hover:bg-slate-100 transition-colors text-slate-700">
                                <span className="material-symbols-outlined text-base">manage_accounts</span>
                                Edit Profil Saya
                            </Link>
                            {/* Riwayat Laporan link */}
                            <Link to="/profile/riwayat"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-slate-50 hover:bg-slate-100 transition-colors text-slate-700">
                                <span className="material-symbols-outlined text-base">history</span>
                                Riwayat Laporan Saya
                            </Link>
                            {/* Admin panel link */}
                            {user.role === 'admin' && (
                                <Link to="/admin/dashboard"
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
                                    Admin Panel
                                </Link>
                            )}
                            {/* Logout */}
                            <button onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer">
                                <span className="material-symbols-outlined text-base">logout</span>
                                Keluar
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                            <Link to="/login" className="text-center px-4 py-3 text-sm text-blue-700 border border-blue-200 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                                Login
                            </Link>
                            <Link to="/register" className="text-center px-4 py-3 text-sm bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
