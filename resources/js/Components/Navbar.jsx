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
    const menuRef = useRef(null);

    useEffect(() => {
        const sesi = sessionStorage.getItem('user');
        if (sesi) setUser(JSON.parse(sesi));
        else setUser(null);
        setMenuOpen(false); // tutup menu saat pindah halaman
    }, [location.pathname]);

    // Tutup menu saat klik di luar
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
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
                        <div className="hidden md:flex items-center gap-2">
                            {user.role === 'admin' ? (
                                <Link to="/admin/dashboard"
                                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg border border-slate-700 transition-colors">
                                    <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-white text-xs font-bold">{user.nama?.charAt(0)}</span>
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="text-white text-xs font-bold leading-tight">{user.nama}</span>
                                        <span className="text-blue-400 text-[10px] font-semibold uppercase tracking-wider">Admin Panel →</span>
                                    </div>
                                </Link>
                            ) : (
                                <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                                    <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-white text-xs font-bold">{user.nama?.charAt(0)}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-blue-700">{user.nama}</span>
                                </div>
                            )}
                            <button onClick={handleLogout}
                                className="flex items-center gap-1 px-3 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors font-semibold">
                                <span className="material-symbols-outlined text-base">logout</span>
                                <span className="hidden lg:inline">Keluar</span>
                            </button>
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
                            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${user.role === 'admin' ? 'bg-slate-800' : 'bg-blue-50'}`}>
                                <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-sm font-bold">{user.nama?.charAt(0)}</span>
                                </div>
                                <div>
                                    <p className={`text-sm font-bold ${user.role === 'admin' ? 'text-white' : 'text-blue-700'}`}>{user.nama}</p>
                                    <p className={`text-xs ${user.role === 'admin' ? 'text-blue-400' : 'text-blue-500'}`}>{user.email}</p>
                                </div>
                            </div>
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
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
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
