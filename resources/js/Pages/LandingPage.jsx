import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import axios from 'axios';

/**
 * Komponen Halaman Utama (Landing Page)
 * Halaman pertama yang dilihat oleh publik (Citizen View).
 */
export default function LandingPage() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        diproses: 0,
        selesai: 0,
        diprosesPct: 0,
        selesaiPct: 0
    });
    const [categoriesChart, setCategoriesChart] = useState([]);

    // State untuk Data Public API (Persyaratan Dosen)
    const [news, setNews] = useState([]);
    const [isLoadingNews, setIsLoadingNews] = useState(true);

    // State untuk chart tren laporan bulanan
    const [chartData, setChartData] = useState([
        { name: '', count: 0, selesai: 0 },
        { name: '', count: 0, selesai: 0 },
        { name: '', count: 0, selesai: 0 },
        { name: '', count: 0, selesai: 0 },
        { name: '', count: 0, selesai: 0 },
        { name: '', count: 0, selesai: 0 },
    ]);
    const [hoveredIndex, setHoveredIndex] = useState(null);

    // Muat data user saat komponen dimuat
    useEffect(() => {
        const sesi = sessionStorage.getItem('user');
        if (sesi) {
            try { setCurrentUser(JSON.parse(sesi)); } catch (e) { setCurrentUser(null); }
        } else {
            setCurrentUser(null);
        }
    }, []);

    // Handler tombol buat pengaduan
    const handleBuatPengaduan = () => {
        if (currentUser) {
            navigate('/buat-pengaduan');
        } else {
            navigate('/login', { state: { from: { pathname: '/buat-pengaduan' } } });
        }
    };

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

                // Hitung Data Grafik Kategori Top 4
                const kategoriCounts = {};
                data.forEach(item => {
                    const k = item.kategori || 'Lainnya';
                    const label = k.charAt(0).toUpperCase() + k.slice(1);
                    kategoriCounts[label] = (kategoriCounts[label] || 0) + 1;
                });

                const sortedKategori = Object.keys(kategoriCounts)
                    .map(key => ({ label: key, count: kategoriCounts[key] }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 4);

                const colors = ['bg-primary', 'bg-green-500', 'bg-red-500', 'bg-yellow-500'];
                const kategoriArr = sortedKategori.map((item, idx) => ({
                    label: item.label,
                    count: item.count,
                    val: total > 0 ? Math.round((item.count / total) * 100) : 0,
                    color: colors[idx % colors.length]
                }));
                setCategoriesChart(kategoriArr);

                // Generate chart data based on last 6 months
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
                const result = [];
                const d = new Date();
                
                for (let i = 5; i >= 0; i--) {
                    const monthDate = new Date(d.getFullYear(), d.getMonth() - i, 1);
                    const m = monthDate.getMonth();
                    const y = monthDate.getFullYear();
                    
                    // Count real matching reports
                    const realCount = data.filter(item => {
                        const dateStr = item.tanggal_laporan || item.created_at;
                        if (!dateStr) return false;
                        const date = new Date(dateStr);
                        return date.getMonth() === m && date.getFullYear() === y;
                    }).length;

                    const realSelesai = data.filter(item => {
                        const dateStr = item.tanggal_laporan || item.created_at;
                        if (!dateStr) return false;
                        const date = new Date(dateStr);
                        return date.getMonth() === m && date.getFullYear() === y && item.status === 'Selesai';
                    }).length;

                    result.push({
                        name: months[m],
                        count: realCount,
                        selesai: realSelesai
                    });
                }
                setChartData(result);
            } catch (error) {
                console.error("Failed to fetch stats", error);
            }
        };

        // Fetch news dari Public API menggunakan Axios (Persyaratan Dosen)
        const fetchNews = async () => {
            try {
                setIsLoadingNews(true);
                // Mengambil 10 item dari JSONPlaceholder
                const response = await axios.get('https://jsonplaceholder.typicode.com/posts?_limit=10');
                setNews(response.data);
            } catch (error) {
                console.error("Failed to fetch news from public API", error);
            } finally {
                setIsLoadingNews(false);
            }
        };

        fetchStats();
        fetchNews();
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
                            <button
                                onClick={handleBuatPengaduan}
                                className="px-5 sm:px-8 py-3 sm:py-4 bg-primary-container text-on-primary rounded-xl font-label-bold text-sm sm:text-lg hover:bg-primary transition-all shadow-[0px_10px_30px_rgba(0,102,204,0.2)] flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                                {currentUser ? 'Buat Pengaduan' : 'Mulai Laporan'}
                            </button>
                            <Link to="/lacak" className="px-5 sm:px-8 py-3 sm:py-4 bg-surface text-primary border-2 border-primary-container rounded-xl font-label-bold text-sm sm:text-lg hover:bg-primary-fixed-dim transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined">search</span>
                                Lacak Tiket
                            </Link>
                        </div>

                        {/* Badge status user */}
                        {currentUser ? (
                            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 w-fit">
                                <span className="material-symbols-outlined text-emerald-600 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                                <span className="text-emerald-700 text-sm font-semibold">Login sebagai <strong>{currentUser.nama}</strong> — siap membuat laporan</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 w-fit">
                                <span className="material-symbols-outlined text-amber-600 text-base">info</span>
                                <span className="text-amber-700 text-sm">Belum punya akun? <Link to="/register" className="font-bold underline hover:text-amber-900">Daftar gratis</Link> atau <Link to="/login" className="font-bold underline hover:text-amber-900">Login</Link> untuk membuat laporan.</span>
                            </div>
                        )}
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

                {/* Bagian Kategori Laporan Terbanyak (Real-time) */}
                <section className="py-8 sm:py-12 border-t border-outline-variant/30 mt-8">
                    <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl shadow-[0px_4px_30px_rgba(0,102,204,0.05)] border border-outline-variant/30">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 font-bold text-xs tracking-widest uppercase mb-3">Statistik Kategori</span>
                                <h2 className="font-h2 text-3xl font-bold">Kategori Laporan Terbanyak</h2>
                                <p className="text-slate-500 mt-1 text-sm">Distribusi keluhan warga berdasarkan bidang masalah secara real-time.</p>
                            </div>
                            <Link to="/statistik" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                                Lihat Statistik Lengkap <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </Link>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            {/* Chart Bar List */}
                            <div className="space-y-5">
                                {categoriesChart.length === 0 ? (
                                    <p className="text-sm text-slate-400 italic">Belum ada data laporan.</p>
                               ) : (
                                    categoriesChart.map((item, idx) => (
                                        <div key={item.label} className="group">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-semibold text-slate-700 group-hover:text-primary transition-colors">{item.label}</span>
                                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">{item.count} Laporan ({item.val}%)</span>
                                            </div>
                                            <div className="w-full bg-slate-150 h-3 rounded-full overflow-hidden border border-slate-100">
                                                <div className={`${item.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${item.val}%` }}></div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Info Box / Graphic Illustration */}
                            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-center h-full">
                                <span className="material-symbols-outlined text-primary text-5xl mb-4">analytics</span>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">Pantau & Berpartisipasi</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                                    Setiap laporan yang masuk langsung dikelompokkan sesuai dengan dinas teknis yang berwenang untuk memprosesnya. Grafik ini diperbarui otomatis setiap kali ada warga yang mengirimkan laporan baru.
                                </p>
                                <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-primary"></span> Infrastruktur</span>
                                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Kebersihan</span>
                                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Kesehatan</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Chart Trend Bulanan */}
                {(() => {
                    const maxVal = Math.max(...chartData.map(d => d.count), 10);
                    const roundedMax = Math.ceil(maxVal / 5) * 5;
                    return (
                        <section className="py-12">
                            <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl shadow-[0px_20px_50px_rgba(30,41,59,0.05)] border border-outline-variant/30">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                    <div>
                                        <span className="inline-block py-1 px-3 rounded-full bg-primary-container/10 text-primary font-label-bold text-xs tracking-widest uppercase mb-2 border border-primary/20">Aktivitas Laporan</span>
                                        <h2 className="font-h2 text-2xl sm:text-3xl font-bold text-on-background">Tren Laporan Bulanan</h2>
                                        <p className="text-on-surface-variant text-sm mt-1">Perkembangan jumlah pengaduan masuk vs laporan selesai dalam 6 bulan terakhir</p>
                                    </div>
                                    {/* Legend */}
                                    <div className="flex gap-4 text-sm font-label-bold">
                                        <div className="flex items-center gap-2">
                                            <span className="w-3.5 h-3.5 rounded-full bg-primary shadow-sm shadow-primary/30"></span>
                                            <span className="text-on-surface">Total Laporan</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/30"></span>
                                            <span className="text-on-surface">Laporan Selesai</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Chart Area */}
                                <div className="relative w-full overflow-hidden">
                                    {/* Custom Tooltip */}
                                    {hoveredIndex !== null && (
                                        <div 
                                            className="absolute top-2 bg-slate-900/95 text-white p-3.5 rounded-xl border border-slate-700/50 shadow-xl backdrop-blur-md pointer-events-none transition-all duration-150 z-20"
                                            style={{ 
                                                left: `${Math.min(Math.max(60 + hoveredIndex * 100 - 80, 10), 450)}px`,
                                            }}
                                        >
                                            <p className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">{chartData[hoveredIndex].name}</p>
                                            <div className="space-y-1 text-sm font-semibold">
                                                <div className="flex justify-between gap-6">
                                                    <span className="text-blue-300">Total Masuk:</span>
                                                    <span>{chartData[hoveredIndex].count}</span>
                                                </div>
                                                <div className="flex justify-between gap-6">
                                                    <span className="text-emerald-400">Selesai:</span>
                                                    <span>{chartData[hoveredIndex].selesai}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Responsive SVG Chart */}
                                    <svg 
                                        viewBox="0 0 600 240" 
                                        className="w-full h-auto overflow-visible"
                                    >
                                        <defs>
                                            {/* Gradients */}
                                            <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#0066cc" stopOpacity="0.25" />
                                                <stop offset="100%" stopColor="#0066cc" stopOpacity="0.0" />
                                            </linearGradient>
                                            <linearGradient id="selesaiGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                                                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                                            </linearGradient>
                                            <linearGradient id="lineTotal" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#0066cc" />
                                                <stop offset="100%" stopColor="#6366f1" />
                                            </linearGradient>
                                            <linearGradient id="lineSelesai" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#10b981" />
                                                <stop offset="100%" stopColor="#059669" />
                                            </linearGradient>
                                        </defs>

                                        {/* Gridlines */}
                                        {[0, 1, 2, 3, 4].map(idx => (
                                            <line 
                                                key={idx}
                                                x1="60" 
                                                y1={40 + idx * 40} 
                                                x2="560" 
                                                y2={40 + idx * 40} 
                                                stroke="rgba(148, 163, 184, 0.15)" 
                                                strokeDasharray="4 4" 
                                            />
                                        ))}

                                        {/* Y-Axis Labels */}
                                        {[0, 1, 2, 3, 4].map(idx => {
                                            const val = Math.round(roundedMax - (idx * (roundedMax / 4)));
                                            return (
                                                <text 
                                                    key={idx}
                                                    x="45" 
                                                    y={44 + idx * 40} 
                                                    className="fill-on-surface-variant font-public-sans text-[10px] font-semibold text-right"
                                                    textAnchor="end"
                                                >
                                                    {val}
                                                </text>
                                            );
                                        })}

                                        {/* SVG Area Paths (Gradient Fills) */}
                                        <path 
                                            d={`M 60 ${200 - (chartData[0].count / roundedMax) * 160} 
                                                L 160 ${200 - (chartData[1].count / roundedMax) * 160} 
                                                L 260 ${200 - (chartData[2].count / roundedMax) * 160} 
                                                L 360 ${200 - (chartData[3].count / roundedMax) * 160} 
                                                L 460 ${200 - (chartData[4].count / roundedMax) * 160} 
                                                L 560 ${200 - (chartData[5].count / roundedMax) * 160} 
                                                L 560 200 L 60 200 Z`}
                                            fill="url(#totalGrad)" 
                                        />
                                        <path 
                                            d={`M 60 ${200 - (chartData[0].selesai / roundedMax) * 160} 
                                                L 160 ${200 - (chartData[1].selesai / roundedMax) * 160} 
                                                L 260 ${200 - (chartData[2].selesai / roundedMax) * 160} 
                                                L 360 ${200 - (chartData[3].selesai / roundedMax) * 160} 
                                                L 460 ${200 - (chartData[4].selesai / roundedMax) * 160} 
                                                L 560 ${200 - (chartData[5].selesai / roundedMax) * 160} 
                                                L 560 200 L 60 200 Z`}
                                            fill="url(#selesaiGrad)" 
                                        />

                                        {/* SVG Lines */}
                                        <path 
                                            d={`M 60 ${200 - (chartData[0].count / roundedMax) * 160} 
                                                L 160 ${200 - (chartData[1].count / roundedMax) * 160} 
                                                L 260 ${200 - (chartData[2].count / roundedMax) * 160} 
                                                L 360 ${200 - (chartData[3].count / roundedMax) * 160} 
                                                L 460 ${200 - (chartData[4].count / roundedMax) * 160} 
                                                L 560 ${200 - (chartData[5].count / roundedMax) * 160}`}
                                            fill="none" 
                                            stroke="url(#lineTotal)" 
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                        />
                                        <path 
                                            d={`M 60 ${200 - (chartData[0].selesai / roundedMax) * 160} 
                                                L 160 ${200 - (chartData[1].selesai / roundedMax) * 160} 
                                                L 260 ${200 - (chartData[2].selesai / roundedMax) * 160} 
                                                L 360 ${200 - (chartData[3].selesai / roundedMax) * 160} 
                                                L 460 ${200 - (chartData[4].selesai / roundedMax) * 160} 
                                                L 560 ${200 - (chartData[5].selesai / roundedMax) * 160}`}
                                            fill="none" 
                                            stroke="url(#lineSelesai)" 
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                        />

                                        {/* Hover vertical alignment line */}
                                        {hoveredIndex !== null && (
                                            <line 
                                                x1={60 + hoveredIndex * 100} 
                                                y1="30" 
                                                x2={60 + hoveredIndex * 100} 
                                                y2="200" 
                                                stroke="rgba(148, 163, 184, 0.3)" 
                                                strokeWidth="1.5"
                                                strokeDasharray="2 2"
                                            />
                                        )}

                                        {/* Glowing Circles on Vertices */}
                                        {chartData.map((d, idx) => {
                                            const x = 60 + idx * 100;
                                            const yTotal = 200 - (d.count / roundedMax) * 160;
                                            const ySelesai = 200 - (d.selesai / roundedMax) * 160;
                                            const isHovered = hoveredIndex === idx;

                                            return (
                                                <g key={idx}>
                                                    {/* Total Laporan Circle */}
                                                    <circle 
                                                        cx={x} 
                                                        cy={yTotal} 
                                                        r={isHovered ? 7 : 4} 
                                                        fill="#ffffff" 
                                                        stroke="#0066cc" 
                                                        strokeWidth={isHovered ? 4 : 2}
                                                        className="transition-all duration-150 cursor-pointer"
                                                    />
                                                    {/* Laporan Selesai Circle */}
                                                    <circle 
                                                        cx={x} 
                                                        cy={ySelesai} 
                                                        r={isHovered ? 7 : 4} 
                                                        fill="#ffffff" 
                                                        stroke="#10b981" 
                                                        strokeWidth={isHovered ? 4 : 2}
                                                        className="transition-all duration-150 cursor-pointer"
                                                    />
                                                </g>
                                            );
                                        })}

                                        {/* X-Axis Labels */}
                                        {chartData.map((d, idx) => (
                                            <text 
                                                key={idx}
                                                x={60 + idx * 100} 
                                                y="222" 
                                                className="fill-on-surface-variant font-public-sans text-[11px] font-bold"
                                                textAnchor="middle"
                                            >
                                                {d.name}
                                            </text>
                                        ))}

                                        {/* Interactive Transparent Hover Bars */}
                                        {chartData.map((d, idx) => (
                                            <rect 
                                                key={idx}
                                                x={35 + idx * 100} 
                                                y="20" 
                                                width="50" 
                                                height="190" 
                                                fill="transparent" 
                                                className="cursor-pointer"
                                                onMouseEnter={() => setHoveredIndex(idx)}
                                                onMouseLeave={() => setHoveredIndex(null)}
                                            />
                                        ))}
                                    </svg>
                                </div>
                            </div>
                        </section>
                    );
                })()}

                {/* Bagian Berita Terbaru (Public API Integration) */}
                <section className="py-12 border-t border-outline-variant/30 mt-8">
                    <div className="text-center mb-10">
                        <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 font-bold text-xs tracking-widest uppercase mb-3">Informasi Publik</span>
                        <h2 className="font-h2 text-3xl font-bold">Pengumuman & Berita Terkini</h2>
                        <p className="text-slate-500 mt-2 text-sm max-w-xl mx-auto">Data ini diambil secara langsung dari Public API menggunakan Axios sebagai demonstrasi integrasi pihak ketiga.</p>
                    </div>

                    {isLoadingNews ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-slate-500 font-medium animate-pulse">Mengambil data dari server publik...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {news.map((item) => (
                                <div key={item.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0px_4px_20px_rgba(0,102,204,0.05)] hover:shadow-[0px_10px_30px_rgba(0,102,204,0.1)] transition-shadow flex flex-col h-full">
                                    <div className="flex gap-2 mb-3">
                                        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-md">Berita #{item.id}</span>
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-800 mb-2 capitalize line-clamp-2">{item.title}</h3>
                                    <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-grow">{item.body}</p>
                                    <div className="mt-auto pt-4 border-t border-slate-100">
                                        <button className="text-blue-600 font-semibold text-sm hover:text-blue-800 transition-colors">Baca selengkapnya &rarr;</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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
