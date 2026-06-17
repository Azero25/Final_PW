import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../axios';

/**
 * Halaman Registrasi (Daftar Akun)
 * Digunakan untuk mendaftarkan pengguna baru ke dalam sistem.
 * Perbaikan:
 * - Tambah konfirmasi password dengan indikator cocok/tidak
 * - Redirect ke halaman asal (from) setelah register sukses
 */
export default function RegisterPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            setError('Semua field harus diisi.');
            return;
        }

        if (password.length < 8) {
            setError('Password minimal harus 8 karakter.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Konfirmasi password tidak cocok. Periksa kembali.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post('/api/register', {
                name: name.trim(),
                email: email.trim(),
                password: password
            });

            // Simpan sesi
            const user = response.data.user;
            sessionStorage.setItem('user', JSON.stringify({
                email: user.email,
                nama: user.nama_lengkap,
                role: user.role
            }));

            // Arahkan ke halaman asal (from) atau ke /buat-pengaduan sebagai default
            const from = location.state?.from?.pathname || '/buat-pengaduan';
            navigate(from, { replace: true });
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Terjadi kesalahan. Silakan coba lagi.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Apakah password match
    const passwordMatch = confirmPassword.length > 0 && password === confirmPassword;
    const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

    return (
        <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col items-center justify-center p-6 relative z-0">
            {/* Efek latar belakang blur */}
            <div className="absolute inset-0 bg-primary-container/5 blur-3xl -z-10"></div>

            {/* Navigasi kembali ke beranda */}
            <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-primary hover:text-primary-container transition-colors font-label-bold">
                <span className="material-symbols-outlined">arrow_back</span>
                Kembali ke Beranda
            </Link>

            {/* Kotak utama form registrasi */}
            <div className="w-full max-w-md bg-surface-container-lowest p-8 rounded-3xl shadow-[0px_20px_50px_rgba(30,41,59,0.1)] border border-outline-variant/30">

                {/* Judul dan Logo */}
                <div className="flex flex-col items-center mb-8">
                    <span className="material-symbols-outlined text-5xl text-primary-container mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
                    <h1 className="font-h2 text-3xl text-on-background">Buat Akun Baru</h1>
                    <p className="text-on-surface-variant mt-2 text-center text-sm">
                        Daftar sekarang untuk mulai berpartisipasi mewujudkan kota yang lebih baik
                    </p>
                </div>

                {/* Pesan Error */}
                {error && (
                    <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm">
                        <span className="material-symbols-outlined text-base shrink-0">error</span>
                        {error}
                    </div>
                )}

                {/* Form pengisian data diri */}
                <form onSubmit={handleRegister} className="space-y-5">

                    {/* Input Nama Lengkap */}
                    <div>
                        <label className="block font-label-bold text-on-surface mb-2">Nama Lengkap</label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            type="text"
                            placeholder="Nama sesuai KTP"
                            className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        />
                    </div>

                    {/* Input Email */}
                    <div>
                        <label className="block font-label-bold text-on-surface mb-2">Email</label>
                        <input
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            type="email"
                            placeholder="contoh@email.com"
                            className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        />
                    </div>

                    {/* Input Password */}
                    <div>
                        <label className="block font-label-bold text-on-surface mb-2">Password</label>
                        <div className="relative">
                            <input
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Minimal 8 karakter"
                                className="w-full px-4 py-3 pr-12 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <span className="material-symbols-outlined text-xl">
                                    {showPassword ? 'visibility_off' : 'visibility'}
                                </span>
                            </button>
                        </div>
                        {password.length > 0 && password.length < 8 && (
                            <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">info</span>
                                Password minimal 8 karakter ({password.length}/8)
                            </p>
                        )}
                    </div>

                    {/* Input Konfirmasi Password */}
                    <div>
                        <label className="block font-label-bold text-on-surface mb-2">Konfirmasi Password</label>
                        <div className="relative">
                            <input
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                type={showConfirm ? 'text' : 'password'}
                                placeholder="Ulangi password Anda"
                                className={`w-full px-4 py-3 pr-12 rounded-xl border bg-surface focus:outline-none focus:ring-2 transition-all
                                    ${passwordMismatch
                                        ? 'border-red-400 focus:ring-red-300'
                                        : passwordMatch
                                            ? 'border-emerald-400 focus:ring-emerald-300'
                                            : 'border-outline-variant focus:ring-primary focus:border-primary'
                                    }`}
                            />
                            {/* Toggle show/hide */}
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <span className="material-symbols-outlined text-xl">
                                    {showConfirm ? 'visibility_off' : 'visibility'}
                                </span>
                            </button>
                        </div>
                        {/* Indikator cocok / tidak */}
                        {passwordMatch && (
                            <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                Password cocok
                            </p>
                        )}
                        {passwordMismatch && (
                            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">warning</span>
                                Password tidak cocok
                            </p>
                        )}
                    </div>

                    {/* Tombol aksi daftar */}
                    <button
                        disabled={isLoading || passwordMismatch}
                        type="submit"
                        className="w-full py-4 mt-2 bg-primary-container text-on-primary rounded-xl font-label-bold text-lg hover:bg-primary transition-all shadow-[0px_10px_30px_rgba(0,102,204,0.2)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Mendaftar...
                            </>
                        ) : 'Daftar Akun'}
                    </button>
                </form>

                {/* Tautan ke halaman login */}
                <p className="mt-8 text-center font-body-sm text-on-surface-variant">
                    Sudah punya akun?{' '}
                    {/* Teruskan state from ke halaman login */}
                    <Link
                        to="/login"
                        state={location.state}
                        className="text-primary font-label-bold hover:underline"
                    >
                        Masuk di sini
                    </Link>
                </p>
            </div>
        </div>
    );
}
