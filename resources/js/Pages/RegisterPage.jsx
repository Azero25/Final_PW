import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../axios';

/**
 * Halaman Registrasi (Daftar Akun)
 * Digunakan untuk mendaftarkan pengguna baru ke dalam sistem.
 */
export default function RegisterPage() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (!name.trim() || !email.trim() || !password.trim()) {
            setError('Semua field harus diisi.');
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
            sessionStorage.setItem('user', JSON.stringify({ email: user.email, nama: user.name, role: user.role }));

            navigate('/'); // Arahkan ke beranda setelah sukses daftar
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
                    <p className="text-on-surface-variant mt-2 text-center">Daftar sekarang untuk mulai berpartisipasi mewujudkan kota yang lebih baik</p>
                </div>

                {error && (
                    <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm">
                        <span className="material-symbols-outlined text-base flex-shrink-0">error</span>
                        {error}
                    </div>
                )}

                {/* Form pengisian data diri */}
                <form onSubmit={handleRegister} className="space-y-5">
                    {/* Input Nama Lengkap */}
                    <div>
                        <label className="block font-label-bold text-on-surface mb-2">Nama Lengkap</label>
                        <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Nama sesuai KTP" className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all" />
                    </div>
                    {/* Input Email */}
                    <div>
                        <label className="block font-label-bold text-on-surface mb-2">Email</label>
                        <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="contoh@email.com" className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all" />
                    </div>
                    {/* Input Password */}
                    <div>
                        <label className="block font-label-bold text-on-surface mb-2">Password</label>
                        <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Minimal 8 karakter" className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all" />
                    </div>
                    
                    {/* Tombol aksi daftar */}
                    <button disabled={isLoading} type="submit" className="w-full py-4 mt-4 bg-primary-container text-on-primary rounded-xl font-label-bold text-lg hover:bg-primary transition-all shadow-[0px_10px_30px_rgba(0,102,204,0.2)] disabled:opacity-60 flex items-center justify-center gap-2">
                        {isLoading ? 'Mendaftar...' : 'Daftar Akun'}
                    </button>
                </form>

                {/* Tautan ke halaman login jika sudah punya akun */}
                <p className="mt-8 text-center font-body-sm text-on-surface-variant">
                    Sudah punya akun? <Link to="/login" className="text-primary font-label-bold hover:underline">Masuk di sini</Link>
                </p>
            </div>
        </div>
    );
}
