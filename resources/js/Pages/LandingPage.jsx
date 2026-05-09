import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Komponen Halaman Utama (Landing Page)
 * Halaman pertama yang dilihat oleh publik (Citizen View).
 */
export default function LandingPage() {
    return (
        <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
            {/* Bagian Navigasi Atas (Navbar) */}
            <nav className="bg-white text-blue-700 font-public-sans antialiased fixed top-0 left-0 w-full z-50 border-b border-slate-200 shadow-sm">
                <div className="flex justify-between items-center px-6 lg:px-12 py-3 max-w-screen-2xl mx-auto w-full">
                    {/* Kiri: Logo & Menu */}
                    <div className="flex items-center gap-10">
                        {/* Logo */}
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
                            <span className="text-xl font-bold tracking-tight text-blue-700 dark:text-blue-400">Sistem Pengaduan</span>
                        </div>
                        {/* Menu */}
                        <div className="hidden md:flex items-center gap-6">
                            <a className="text-blue-700 dark:text-blue-400 font-semibold border-b-2 border-blue-700 pb-1 transition-colors duration-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 active:opacity-80 active:scale-95 transition-all" href="#">Beranda</a>
                            <a className="text-slate-600 dark:text-slate-400 hover:text-blue-600 pb-1 transition-colors duration-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 active:opacity-80 active:scale-95 transition-all" href="#">Cara Kerja</a>
                            <a className="text-slate-600 dark:text-slate-400 hover:text-blue-600 pb-1 transition-colors duration-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 active:opacity-80 active:scale-95 transition-all" href="#">Statistik</a>
                            <a className="text-slate-600 dark:text-slate-400 hover:text-blue-600 pb-1 transition-colors duration-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 active:opacity-80 active:scale-95 transition-all" href="#">Lacak</a>
                            <a className="text-slate-600 dark:text-slate-400 hover:text-blue-600 pb-1 transition-colors duration-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 active:opacity-80 active:scale-95 transition-all" href="#">Bantuan</a>
                        </div>
                    </div>

                    {/* Kanan: Tombol Login & Register */}
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="hidden md:inline-block px-6 py-2 text-primary border border-primary rounded-lg font-label-bold hover:bg-primary-fixed-dim transition-colors">Login</Link>
                        <Link to="/register" className="px-6 py-2 bg-primary-container text-on-primary rounded-lg font-label-bold hover:bg-primary transition-colors shadow-[0px_4px_20px_rgba(0,102,204,0.15)]">Register</Link>
                    </div>
                </div>
            </nav>

            {/* Konten Utama Halaman */}
            <main className="flex-grow pt-24 px-6 max-w-7xl mx-auto w-full">
                {/* Bagian Hero (Sambutan Utama) */}
                <section className="flex flex-col lg:flex-row items-center justify-between gap-12 py-12 lg:py-24">
                    <div className="flex-1 space-y-8">
                        <h1 className="font-h1 text-on-background text-5xl lg:text-6xl leading-tight">
                            Sampaikan Keluhan Warga dengan <span className="text-primary-container">Mudah dan Cepat</span>
                        </h1>
                        <p className="font-body-lg text-on-surface-variant max-w-2xl">
                            Platform resmi pemerintah daerah untuk menerima, memproses, dan menyelesaikan laporan masyarakat. Transparan, terukur, dan terintegrasi untuk mewujudkan Smart City.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-4">
                            <button className="px-8 py-4 bg-primary-container text-on-primary rounded-xl font-label-bold text-lg hover:bg-primary transition-all shadow-[0px_10px_30px_rgba(0,102,204,0.2)] flex items-center gap-2">
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                                Buat Pengaduan
                            </button>
                            <button className="px-8 py-4 bg-surface text-primary border-2 border-primary-container rounded-xl font-label-bold text-lg hover:bg-primary-fixed-dim transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined">search</span>
                                Lacak Tiket
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 w-full relative">
                        <div className="absolute inset-0 bg-primary-container/5 rounded-3xl blur-3xl"></div>
                        <img alt="Modern city landmark illustration" className="w-full h-auto object-cover rounded-3xl shadow-[0px_20px_50px_rgba(30,41,59,0.15)] relative z-10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuEgNITxVgHTsDVY6_Fq6I_JVFOCguptriqzLC811G95NwPFWfuQkbEf2_4eq4M6xlbRqsVXerxosuauh2BYQJ3Bpi0Zffzm5HlgHN-704nxlgwNhqKu6-NA0cg8KMnygHeM5W2VE58TwfKhiZ53sWiwJJ3A8UgvydXkv2jzni2tUHsHAOfieS-_X5YlJjsbzkUk0_qxx4Rm0GZ6Bluv3YVsrjzQDSdYYMY_pcw0l4eAZu8Y39vzE_irRfZkB-btPW2LU2sbT5ITs" />
                    </div>
                </section>

                {/* Bagian Statistik Layanan (Desain Kotak Grid) */}
                <section className="py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0px_4px_20px_rgba(0,102,204,0.05)] border border-outline-variant/30 flex flex-col justify-between h-40">
                            <div className="flex justify-between items-start">
                                <span className="font-label-bold text-on-surface-variant uppercase tracking-wider">Total Laporan</span>
                                <div className="p-2 bg-primary-container/10 rounded-lg">
                                    <span className="material-symbols-outlined text-primary-container">description</span>
                                </div>
                            </div>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-4xl font-bold font-public-sans text-on-background block leading-none">12,450</span>
                                <span className="text-sm text-secondary block">+12% bulan ini</span>
                            </div>
                        </div>

                        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0px_4px_20px_rgba(0,102,204,0.05)] border border-outline-variant/30 flex flex-col justify-between h-40 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
                            <div className="flex justify-between items-start relative z-10">
                                <span className="font-label-bold text-on-surface-variant uppercase tracking-wider">Diproses</span>
                                <div className="p-2 bg-amber-500/10 rounded-lg">
                                    <span className="material-symbols-outlined text-amber-600">sync</span>
                                </div>
                            </div>
                            <div className="mt-4 relative z-10">
                                <span className="text-4xl font-bold font-public-sans text-on-background block leading-none">1,234</span>
                                <div className="w-full bg-surface-container-high h-2 rounded-full mt-3">
                                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: "10%" }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0px_4px_20px_rgba(0,102,204,0.05)] border border-outline-variant/30 flex flex-col justify-between h-40 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
                            <div className="flex justify-between items-start relative z-10">
                                <span className="font-label-bold text-on-surface-variant uppercase tracking-wider">Selesai</span>
                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                    <span className="material-symbols-outlined text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                </div>
                            </div>
                            <div className="mt-4 relative z-10">
                                <span className="text-4xl font-bold font-public-sans text-on-background block leading-none">11,105</span>
                                <div className="w-full bg-surface-container-high h-2 rounded-full mt-3">
                                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "89%" }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-primary-container p-6 rounded-2xl shadow-[0px_10px_30px_rgba(0,102,204,0.15)] flex flex-col justify-between h-40 text-on-primary">
                            <div className="flex justify-between items-start">
                                <span className="font-label-bold text-on-primary-container uppercase tracking-wider">Rata-rata Respon</span>
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <span className="material-symbols-outlined text-on-primary">timer</span>
                                </div>
                            </div>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-4xl font-bold font-public-sans text-on-primary block leading-none">2.4</span>
                                <span className="text-lg font-medium text-on-primary-container block">Hari</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Bagian Cara Kerja Layanan */}
                <section className="py-16 lg:py-24">
                    <div className="text-center mb-16">
                        <h2 className="font-h2 text-on-background">Cara Kerja</h2>
                        <p className="font-body-lg text-on-surface-variant mt-4 max-w-2xl mx-auto">Proses pelaporan dirancang agar sederhana, transparan, dan mudah dipantau oleh masyarakat.</p>
                    </div>
                    <div className="relative">
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-outline-variant/30 -translate-y-1/2 z-0"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                            <div className="flex flex-col items-center text-center group">
                                <div className="w-24 h-24 bg-surface-container-lowest rounded-full shadow-[0px_10px_30px_rgba(0,102,204,0.1)] flex items-center justify-center mb-6 border-4 border-surface group-hover:border-primary-fixed transition-colors duration-300">
                                    <span className="material-symbols-outlined text-4xl text-primary-container">edit_document</span>
                                </div>
                                <h3 className="font-h3 text-on-background mb-3">1. Tulis Laporan</h3>
                                <p className="font-body-md text-on-surface-variant px-4">Deskripsikan masalah, lokasi, dan lampirkan foto bukti kejadian melalui form yang tersedia.</p>
                            </div>

                            <div className="flex flex-col items-center text-center group">
                                <div className="w-24 h-24 bg-surface-container-lowest rounded-full shadow-[0px_10px_30px_rgba(0,102,204,0.1)] flex items-center justify-center mb-6 border-4 border-surface group-hover:border-primary-fixed transition-colors duration-300">
                                    <span className="material-symbols-outlined text-4xl text-amber-600">published_with_changes</span>
                                </div>
                                <h3 className="font-h3 text-on-background mb-3">2. Proses Tindak Lanjut</h3>
                                <p className="font-body-md text-on-surface-variant px-4">Laporan Anda diverifikasi dan diteruskan ke instansi terkait untuk segera ditangani.</p>
                            </div>

                            <div className="flex flex-col items-center text-center group">
                                <div className="w-24 h-24 bg-surface-container-lowest rounded-full shadow-[0px_10px_30px_rgba(0,102,204,0.1)] flex items-center justify-center mb-6 border-4 border-surface group-hover:border-primary-fixed transition-colors duration-300">
                                    <span className="material-symbols-outlined text-4xl text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                                </div>
                                <h3 className="font-h3 text-on-background mb-3">3. Selesai &amp; Evaluasi</h3>
                                <p className="font-body-md text-on-surface-variant px-4">Terima notifikasi penyelesaian dan berikan penilaian terhadap kinerja layanan kami.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Bagian Footer (Catatan Kaki) */}
            <footer className="bg-slate-900 dark:bg-black text-blue-400 font-public-sans text-xs text-slate-400 w-full border-t border-slate-800 mt-auto">
                <div className="w-full py-12 px-6 flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto gap-8 md:gap-0">
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <span className="text-white font-bold text-lg flex items-center gap-2">
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
                            Sistem Pengaduan
                        </span>
                        <p>© 2024 Pemerintah Daerah. Terintegrasi Smart City Indonesia.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6">
                        <a className="text-slate-500 hover:text-slate-300 hover:text-blue-400 transition-colors" href="#">Kontak Layanan</a>
                        <a className="text-slate-500 hover:text-slate-300 hover:text-blue-400 transition-colors" href="#">Daftar Instansi</a>
                        <a className="text-slate-500 hover:text-slate-300 hover:text-blue-400 transition-colors" href="#">Kebijakan Privasi</a>
                        <a className="text-slate-500 hover:text-slate-300 hover:text-blue-400 transition-colors" href="#">Media Sosial</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
