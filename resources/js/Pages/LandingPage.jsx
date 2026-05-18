import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import axios from 'axios';

/**
 * Komponen Halaman Utama (Landing Page)
 * Halaman pertama yang dilihat oleh publik (Citizen View).
 */
export default function LandingPage() {
    const [stats, setStats] = useState({
        total: 0,
        diproses: 0,
        selesai: 0,
        diprosesPct: 0,
        selesaiPct: 0
    });

    useEffect(() => {
        window.scrollTo(0, 0);
        
        // Fetch real stats
        const fetchStats = async () => {
            try {
                const response = await axios.get('/api/pengaduans');
                const data = response.data;
                const total = data.length;
                const diproses = data.filter(i => i.status === 'Laporan Diterima' || i.status === 'Verifikasi' || i.status === 'Sedang Diproses').length;
                const selesai = data.filter(i => i.status === 'Selesai').length;
                
                setStats({
                    total,
                    diproses,
                    selesai,
                    diprosesPct: total > 0 ? Math.round((diproses / total) * 100) : 0,
                    selesaiPct: total > 0 ? Math.round((selesai / total) * 100) : 0,
                });
            } catch (error) {
                console.error("Failed to fetch stats", error);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
            
            {/* Navbar Bersama */}
            <Navbar />

            {/* Konten Utama Halaman */}
            <main className="flex-grow pt-16 sm:pt-24 px-4 sm:px-6 max-w-7xl mx-auto w-full">
                {/* Bagian Hero (Sambutan Utama) */}
                <section className="flex flex-col lg:flex-row items-center justify-between gap-8 py-8 lg:py-24">
                    <div className="flex-1 space-y-5">
                        <h1 className="font-h1 text-on-background text-3xl sm:text-4xl lg:text-6xl leading-tight">
                            Sampaikan Keluhan Warga dengan <span className="text-primary-container">Mudah dan Cepat</span>
                        </h1>
                        <p className="font-body-lg text-on-surface-variant text-sm sm:text-base max-w-2xl">
                            Platform resmi pemerintah daerah untuk menerima, memproses, dan menyelesaikan laporan masyarakat. Transparan, terukur, dan terintegrasi untuk mewujudkan Smart City.
                        </p>
                        <div className="flex flex-wrap gap-3 pt-2">
                            <Link to="/buat-pengaduan" className="px-5 sm:px-8 py-3 sm:py-4 bg-primary-container text-on-primary rounded-xl font-label-bold text-sm sm:text-lg hover:bg-primary transition-all shadow-[0px_10px_30px_rgba(0,102,204,0.2)] flex items-center gap-2">
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                                Buat Pengaduan
                            </Link>
                            <Link to="/lacak" className="px-5 sm:px-8 py-3 sm:py-4 bg-surface text-primary border-2 border-primary-container rounded-xl font-label-bold text-sm sm:text-lg hover:bg-primary-fixed-dim transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined">search</span>
                                Lacak Tiket
                            </Link>
                        </div>
                    </div>
                    <div className="flex-1 w-full relative">
                        <div className="absolute inset-0 bg-primary-container/5 rounded-3xl blur-3xl"></div>
                        <img alt="Modern city landmark illustration" className="w-full h-auto object-cover rounded-2xl sm:rounded-3xl shadow-[0px_20px_50px_rgba(30,41,59,0.15)] relative z-10" src="/img/modern-city.jpg" />
                    </div>
                </section>

                {/* Bagian Statistik Layanan (Desain Kotak Grid) */}
                <section className="py-8 sm:py-12">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0px_4px_20px_rgba(0,102,204,0.05)] border border-outline-variant/30 flex flex-col justify-between h-40">
                            <div className="flex justify-between items-start">
                                <span className="font-label-bold text-on-surface-variant uppercase tracking-wider">Total Laporan</span>
                                <div className="p-2 bg-primary-container/10 rounded-lg">
                                    <span className="material-symbols-outlined text-primary-container">description</span>
                                </div>
                            </div>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-4xl font-bold font-public-sans text-on-background block leading-none">{stats.total}</span>
                                   <span className="text-sm text-secondary hidden sm:block">Laporan Real-time</span>
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
                                <span className="text-4xl font-bold font-public-sans text-on-background block leading-none">{stats.diproses}</span>
                                <div className="w-full bg-surface-container-high h-2 rounded-full mt-3">
                                    <div className="bg-amber-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${stats.diprosesPct}%` }}></div>
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
                                <span className="text-4xl font-bold font-public-sans text-on-background block leading-none">{stats.selesai}</span>
                                <div className="w-full bg-surface-container-high h-2 rounded-full mt-3">
                                    <div className="bg-emerald-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${stats.selesaiPct}%` }}></div>
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
                <section className="py-20 lg:py-32 relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-container/5 rounded-full blur-[100px] pointer-events-none"></div>
                    
                    <div className="text-center mb-20 relative z-10">
                        <span className="inline-block py-1 px-3 rounded-full bg-primary-container/10 text-primary font-label-bold text-sm tracking-widest uppercase mb-4 border border-primary/20">Prosedur</span>
                        <h2 className="font-h2 text-on-background text-4xl md:text-5xl font-bold tracking-tight">Cara Kerja <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Sistem</span></h2>
                        <p className="font-body-lg text-on-surface-variant mt-6 max-w-2xl mx-auto">Proses pelaporan dirancang agar sederhana, transparan, dan mudah dipantau oleh masyarakat. Hanya butuh 3 langkah mudah.</p>
                    </div>

                    <div className="relative max-w-6xl mx-auto z-10">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-[4.5rem] left-[15%] right-[15%] h-1 bg-gradient-to-r from-transparent via-primary-container/40 to-transparent -translate-y-1/2 z-0"></div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                            {/* Step 1 */}
                            <div className="flex flex-col items-center text-center group">
                                <div className="w-36 h-36 relative mb-8 flex justify-center items-center">
                                    <div className="absolute inset-0 bg-primary-container/20 rounded-full scale-0 group-hover:scale-110 transition-transform duration-500 ease-out"></div>
                                    <div className="absolute inset-4 bg-surface rounded-full shadow-[0px_10px_30px_rgba(0,102,204,0.15)] flex items-center justify-center border border-primary-container/20 group-hover:border-primary transition-colors duration-300 z-10 overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <span className="material-symbols-outlined text-5xl text-primary transform group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">edit_document</span>
                                    </div>
                                    <div className="absolute top-0 right-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg z-20 border-4 border-background">1</div>
                                </div>
                                <h3 className="text-2xl font-bold text-on-background mb-4 group-hover:text-primary transition-colors duration-300">Tulis Laporan</h3>
                                <p className="font-body-md text-on-surface-variant px-6 leading-relaxed">Deskripsikan masalah, lokasi, dan lampirkan foto bukti kejadian melalui form yang tersedia dengan jelas.</p>
                            </div>

                            {/* Step 2 */}
                            <div className="flex flex-col items-center text-center group">
                                <div className="w-36 h-36 relative mb-8 flex justify-center items-center">
                                    <div className="absolute inset-0 bg-amber-500/10 rounded-full scale-0 group-hover:scale-110 transition-transform duration-500 ease-out delay-75"></div>
                                    <div className="absolute inset-4 bg-surface rounded-full shadow-[0px_10px_30px_rgba(245,158,11,0.15)] flex items-center justify-center border border-amber-500/20 group-hover:border-amber-500 transition-colors duration-300 z-10 overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <span className="material-symbols-outlined text-5xl text-amber-500 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">published_with_changes</span>
                                    </div>
                                    <div className="absolute top-0 right-0 w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg z-20 border-4 border-background">2</div>
                                </div>
                                <h3 className="text-2xl font-bold text-on-background mb-4 group-hover:text-amber-600 transition-colors duration-300">Proses Tindak Lanjut</h3>
                                <p className="font-body-md text-on-surface-variant px-6 leading-relaxed">Laporan Anda diverifikasi dan diteruskan ke instansi terkait untuk segera ditangani secara profesional.</p>
                            </div>

                            {/* Step 3 */}
                            <div className="flex flex-col items-center text-center group">
                                <div className="w-36 h-36 relative mb-8 flex justify-center items-center">
                                    <div className="absolute inset-0 bg-emerald-500/10 rounded-full scale-0 group-hover:scale-110 transition-transform duration-500 ease-out delay-150"></div>
                                    <div className="absolute inset-4 bg-surface rounded-full shadow-[0px_10px_30px_rgba(16,185,129,0.15)] flex items-center justify-center border border-emerald-500/20 group-hover:border-emerald-500 transition-colors duration-300 z-10 overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <span className="material-symbols-outlined text-5xl text-emerald-500 transform group-hover:scale-110 transition-transform duration-300" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                                    </div>
                                    <div className="absolute top-0 right-0 w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg z-20 border-4 border-background">3</div>
                                </div>
                                <h3 className="text-2xl font-bold text-on-background mb-4 group-hover:text-emerald-600 transition-colors duration-300">Selesai &amp; Evaluasi</h3>
                                <p className="font-body-md text-on-surface-variant px-6 leading-relaxed">Terima notifikasi penyelesaian dan berikan penilaian terhadap kinerja layanan kami untuk evaluasi.</p>
                            </div>
                        </div>
                        
                        {/* Call to action within how it works */}
                        <div className="mt-20 text-center">
                            <Link to="/cara-kerja" className="group relative inline-flex px-8 py-4 bg-surface border border-primary/20 text-primary font-bold rounded-full overflow-hidden shadow-sm hover:shadow-md hover:border-primary transition-all duration-300">
                                <div className="absolute inset-0 w-0 bg-primary/10 transition-all duration-[250ms] ease-out group-hover:w-full"></div>
                                <span className="relative flex items-center justify-center gap-2">
                                    Lihat Panduan Lengkap
                                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                </span>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Bagian Footer (Catatan Kaki) */}
            <Footer />
        </div>
    );
}
