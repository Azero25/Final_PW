import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Halaman Login
 * Menampilkan antarmuka bagi pengguna untuk masuk ke dalam sistem.
 * Data dummy login:
 *   Admin  : admin@lapor.go.id  / admin123
 *   Warga  : warga@email.com    / warga123
 */

// Data dummy akun yang bisa login
const DUMMY_ACCOUNTS = [
    { email: 'admin@lapor.go.id', password: 'admin123', role: 'admin', nama: 'Admin Utama' },
    { email: 'warga@email.com',   password: 'warga123', role: 'warga', nama: 'Budi Santoso' },
];

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Fungsi menangani login
    const handleLogin = (e) => {
        e.preventDefault();
        setError('');

        // Validasi: field kosong
        if (!email.trim() || !password.trim()) {
            setError('Email dan password tidak boleh kosong.');
            return;
        }

        // Validasi: format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Format email tidak valid. Contoh: nama@domain.com');
            return;
        }

        // Validasi: panjang password minimal 6 karakter
        if (password.length < 6) {
            setError('Password minimal harus 6 karakter.');
            return;
        }

        setIsLoading(true);

        // Simulasi delay autentikasi
        setTimeout(() => {
            const akun = DUMMY_ACCOUNTS.find(
                (a) => a.email === email.trim() && a.password === password
            );

            if (akun) {
                // Simpan sesi sederhana di sessionStorage
                sessionStorage.setItem('user', JSON.stringify({ email: akun.email, nama: akun.nama, role: akun.role }));

                // Arahkan berdasarkan role
                if (akun.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/');
                }
            } else {
                setError('Email atau password salah. Silakan coba lagi.');
                setIsLoading(false);
            }
        }, 1000);
    };

   

    return (
        <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col items-center justify-center p-6 relative z-0">
            {/* Latar belakang dengan efek blur */}
            <div className="absolute inset-0 bg-primary-container/5 blur-3xl -z-10"></div>

            {/* Tombol kembali ke halaman utama */}
            <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-primary hover:text-primary-container transition-colors font-label-bold">
                <span className="material-symbols-outlined">arrow_back</span>
                Kembali ke Beranda
            </Link>

            {/* Kotak utama form login */}
            <div className="w-full max-w-md bg-surface-container-lowest p-8 rounded-3xl shadow-[0px_20px_50px_rgba(30,41,59,0.1)] border border-outline-variant/30">

                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <span className="material-symbols-outlined text-5xl text-primary-container mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
                    <h1 className="font-h2 text-3xl text-on-background">Selamat Datang</h1>
                    <p className="text-on-surface-variant mt-2 text-center">Masuk ke akun Anda untuk membuat dan melacak pengaduan</p>
                </div>


                {/* Pesan Error */}
                {error && (
                    <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm">
                        <span className="material-symbols-outlined text-base flex-shrink-0">error</span>
                        {error}
                    </div>
                )}

                {/* Form Login */}
                <form onSubmit={handleLogin} className="space-y-5">
                    {/* Input Email */}
                    <div>
                        <label className="block font-label-bold text-on-surface mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="contoh@email.com"
                            className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        />
                    </div>

                    {/* Input Password */}
                    <div>
                        <label className="block font-label-bold text-on-surface mb-2">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 pr-12 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Tombol Masuk */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-primary-container text-on-primary rounded-xl font-label-bold text-lg hover:bg-primary transition-all shadow-[0px_10px_30px_rgba(0,102,204,0.2)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Masuk...
                            </>
                        ) : 'Masuk Sekarang'}
                    </button>
                </form>

                {/* Info Akun Demo */}
                <div className="mt-5 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-700 font-semibold mb-1.5">💡 Akun Demo</p>
                    <p className="text-xs text-blue-600 font-mono">Admin&nbsp;: admin@lapor.go.id / admin123</p>
                    <p className="text-xs text-blue-600 font-mono">Warga&nbsp;&nbsp;: warga@email.com / warga123</p>
                </div>

                {/* Tautan ke halaman Registrasi */}
                <p className="mt-6 text-center font-body-sm text-on-surface-variant">
                    Belum punya akun? <Link to="/register" className="text-primary font-label-bold hover:underline">Daftar di sini</Link>
                </p>
            </div>
        </div>
    );
}
