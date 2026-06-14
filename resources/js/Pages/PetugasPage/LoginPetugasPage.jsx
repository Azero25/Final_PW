import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../axios';

/**
 * Halaman Login Petugas
 * Login terpisah dari user biasa. Petugas login dengan username + password.
 */

export default function LoginPetugasPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        // Validasi: field kosong
        if (!username.trim() || !password.trim()) {
            setError('Username/NIP atau password tidak boleh kosong.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post('/api/petugas/login', {
                username: username.trim(),
                password: password
            });

            if (response.data && response.data.status === 'success') {
                // Simpan sesi petugas di sessionStorage
                sessionStorage.setItem('petugas', JSON.stringify(response.data.petugas));
                navigate('/petugas/dashboard');
            } else {
                setError('Terjadi kesalahan saat login.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Username/NIP atau password salah. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-950 min-h-screen flex flex-col items-center justify-center p-6 relative z-0 overflow-hidden font-[Inter,sans-serif]">
            {/* Animated background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/8 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]"></div>
            </div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 -z-10 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }}
            ></div>

            {/* Tombol kembali */}
            <Link
                to="/"
                className="absolute top-8 left-8 flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-semibold text-sm group"
            >
                <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
                Kembali ke Beranda
            </Link>

            {/* Badge Petugas */}
            <div className="flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
                <span className="material-symbols-outlined text-blue-400 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>badge</span>
                <span className="text-blue-300 text-xs font-bold tracking-wider uppercase">Portal Petugas Dinas</span>
            </div>

            {/* Card utama */}
            <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(20,184,166,0.05)]">
                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                        <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield_person</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white font-[Public_Sans,sans-serif]">Login Petugas</h1>
                    <p className="text-slate-400 mt-2 text-center text-sm">Masuk ke panel petugas untuk mengelola tugas pengaduan dinas Anda</p>
                </div>

                {/* Pesan Error */}
                {error && (
                    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm backdrop-blur-sm">
                        <span className="material-symbols-outlined text-base flex-shrink-0">error</span>
                        {error}
                    </div>
                )}

                {/* Form Login */}
                <form onSubmit={handleLogin} className="space-y-5">
                    {/* Input Username */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Username atau Email</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">person</span>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="petugas@gmail.com"
                                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Input Password */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">lock</span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-slate-700 bg-slate-800/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Tombol Login */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold text-base hover:from-blue-400 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Memverifikasi...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-lg">login</span>
                                Masuk ke Dashboard
                            </>
                        )}
                    </button>
                </form>



                {/* Link ke login user */}
                <p className="mt-5 text-center text-xs text-slate-500">
                    Bukan petugas?{' '}
                    <Link to="/login" className="text-blue-400 font-semibold hover:underline">
                        Login sebagai User
                    </Link>
                </p>
            </div>

            {/* Footer branding */}
            <p className="mt-8 text-xs text-slate-600">
                LaporWarga &copy; {new Date().getFullYear()} — Portal Petugas Dinas
            </p>
        </div>
    );
}
