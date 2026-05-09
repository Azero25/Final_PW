import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Halaman Login
 * Menampilkan antarmuka bagi pengguna untuk masuk ke dalam sistem.
 */
export default function LoginPage() {
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

                {/* Bagian header/judul (Logo dan Teks) */}
                <div className="flex flex-col items-center mb-8">
                    <span className="material-symbols-outlined text-5xl text-primary-container mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
                    <h1 className="font-h2 text-3xl text-on-background">Selamat Datang</h1>
                    <p className="text-on-surface-variant mt-2 text-center">Masuk ke akun Anda untuk membuat dan melacak pengaduan</p>
                </div>

                {/* Form input data login */}
                <form className="space-y-6">
                    {/* Input untuk Email */}
                    <div>
                        <label className="block font-label-bold text-on-surface mb-2">Email</label>
                        <input type="email" placeholder="contoh@email.com" className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all" />
                    </div>

                    {/* Input untuk Password */}
                    <div>
                        <label className="block font-label-bold text-on-surface mb-2">Password</label>
                        <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all" />
                    </div>

                    {/* Opsi Ingat Saya dan Lupa Password */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded border-outline-variant text-primary focus:ring-primary" />
                            <span className="font-body-sm text-on-surface-variant">Ingat saya</span>
                        </label>
                    </div>

                    {/* Tombol Masuk */}
                    <button type="button" className="w-full py-4 bg-primary-container text-on-primary rounded-xl font-label-bold text-lg hover:bg-primary transition-all shadow-[0px_10px_30px_rgba(0,102,204,0.2)]">
                        Masuk Sekarang
                    </button>
                </form>

                {/* Tautan ke halaman Registrasi */}
                <p className="mt-8 text-center font-body-sm text-on-surface-variant">
                    Belum punya akun? <Link to="/register" className="text-primary font-label-bold hover:underline">Daftar di sini</Link>
                </p>
            </div>
        </div>
    );
}
