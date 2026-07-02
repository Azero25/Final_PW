import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import axios from 'axios';

export default function StatistikPage() {
    const [stats, setStats] = useState({
        total: 0,
        proses: 0,
        selesai: 0,
        resolusi: 0,
    });
    const [chartKategori, setChartKategori] = useState([]);
    const [chartBulanan, setChartBulanan] = useState([]);
    const [mapData, setMapData] = useState({ topLokasi: 'Belum Ada Data', topCount: 0, markers: [] });
    const [recentSelesai, setRecentSelesai] = useState([]);

    // Helper: waktu relatif sederhana
    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins} menit lalu`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} jam lalu`;
        const days = Math.floor(hours / 24);
        return `${days} hari lalu`;
    };

    useEffect(() => {
        window.scrollTo(0, 0);

        const fetchStats = async () => {
            try {
                const response = await axios.get('/api/pengaduans');
                const data = response.data;
                const total = data.length;
                const proses = data.filter(i => i.status === 'Laporan Diterima' || i.status === 'Verifikasi' || i.status === 'Sedang Diproses').length;
                const selesai = data.filter(i => i.status === 'Selesai').length;

                setStats({
                    total,
                    proses,
                    selesai,
                    resolusi: total > 0 ? ((selesai / total) * 100).toFixed(1) : 0,
                });

                // Hitung Data Grafik Kategori Top 5
                const kategoriCounts = {};
                data.forEach(item => {
                    const k = item.kategori || 'Lainnya';
                    const label = k.charAt(0).toUpperCase() + k.slice(1);
                    kategoriCounts[label] = (kategoriCounts[label] || 0) + 1;
                });

                const sortedKategori = Object.keys(kategoriCounts)
                    .map(key => ({ label: key, count: kategoriCounts[key] }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);

                const colors = ['bg-primary', 'bg-blue-400', 'bg-tertiary', 'bg-secondary', 'bg-slate-300'];
                const kategoriArr = sortedKategori.map((item, idx) => ({
                    label: item.label,
                    val: total > 0 ? Math.round((item.count / total) * 100) : 0,
                    color: colors[idx % colors.length]
                }));
                setChartKategori(kategoriArr);

                // Hitung Data Grafik Tren Bulanan (6 bulan terakhir)
                const monthNames = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGS", "SEP", "OKT", "NOV", "DES"];
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();

                let monthlyCounts = {};
                for (let i = 6; i >= 0; i--) {
                    let d = new Date(currentYear, currentMonth - i, 1);
                    monthlyCounts[`${monthNames[d.getMonth()]}`] = 0;
                }

                data.forEach(item => {
                    const date = new Date(item.created_at);
                    const monthStr = monthNames[date.getMonth()];
                    if (monthlyCounts[monthStr] !== undefined) {
                        monthlyCounts[monthStr]++;
                    }
                });

                const bulananArr = Object.keys(monthlyCounts).map(month => ({
                    bulan: month,
                    val: monthlyCounts[month],
                    active: month === monthNames[currentMonth]
                }));
                setChartBulanan(bulananArr);

                // Hitung Data Peta
                const lokasiCounts = {};
                const markers = [];
                const markerColors = ['bg-red-500', 'bg-primary', 'bg-tertiary', 'bg-secondary'];
                
                data.forEach((item, idx) => {
                    const loc = item.lokasi || 'Tidak Diketahui';
                    lokasiCounts[loc] = (lokasiCounts[loc] || 0) + 1;
                    
                    let hash = 0;
                    for (let i = 0; i < loc.length; i++) {
                        hash = loc.charCodeAt(i) + ((hash << 5) - hash);
                    }
                    const top = 25 + Math.abs((hash + idx * 17) % 50);
                    const left = 25 + Math.abs(((hash >> 3) + idx * 23) % 50);
                    
                    markers.push({
                        id: item.id || idx,
                        top: `${top}%`,
                        left: `${left}%`,
                        color: markerColors[idx % markerColors.length],
                        delay: `${(idx % 10) * 0.2}s`
                    });
                });

                let topLokasi = "Belum Ada Data";
                let topCount = 0;
                Object.keys(lokasiCounts).forEach(loc => {
                    if (lokasiCounts[loc] > topCount) {
                        topCount = lokasiCounts[loc];
                        topLokasi = loc;
                    }
                });

                setMapData({ topLokasi, topCount, markers });

                // 3 laporan selesai terbaru
                const selesaiList = data
                    .filter(i => i.status === 'Selesai')
                    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
                    .slice(0, 3);
                setRecentSelesai(selesaiList);

            } catch (error) {
                console.error("Failed to fetch stats", error);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="bg-background font-body-md text-on-surface min-h-screen flex flex-col">
            <style>
                {`
                .batik-pattern {
                    background-color: transparent;
                    background-image: radial-gradient(#004e9f 0.5px, transparent 0.5px), radial-gradient(#004e9f 0.5px, transparent 0.5px);
                    background-size: 20px 20px;
                    background-position: 0 0, 10px 10px;
                    opacity: 0.05;
                }
                .card-shadow {
                    box-shadow: 0px 4px 20px rgba(0, 102, 204, 0.05);
                }
                `}
            </style>

            {/* Navbar Bersama */}
            <Navbar />

            <main className="pt-24 pb-12 max-w-7xl mx-auto px-6 grow">
                {/* Header Section */}
                <header className="mb-10 relative overflow-hidden rounded-xl bg-primary-container p-10 text-white">
                    <div className="absolute inset-0 batik-pattern opacity-10"></div>
                    <div className="relative z-10">
                        <h1 className="font-h1 text-h1 mb-2">Statistik Publik &amp; Transparansi</h1>
                        <p className="font-body-lg text-body-lg opacity-90 max-w-2xl">Visualisasi data performa layanan publik Pemerintah Kota secara real-time. Kami berkomitmen pada transparansi untuk membangun kepercayaan warga.</p>
                    </div>
                </header>
                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Quick Stats Row */}
                    <div className="md:col-span-3 bg-white p-6 rounded-xl card-shadow flex flex-col items-center justify-center text-center border border-slate-100">
                        <span className="material-symbols-outlined text-4xl text-primary mb-3">description</span>
                        <h4 className="font-label-caps text-label-caps text-slate-500 uppercase mb-1">Total Laporan</h4>
                        <div className="font-h2 text-h2 text-primary">{stats.total}</div>
                        <p className="text-xs text-green-600 font-label-bold mt-2">Data Real-time</p>
                    </div>
                    <div className="md:col-span-3 bg-white p-6 rounded-xl card-shadow flex flex-col items-center justify-center text-center border border-slate-100">
                        <span className="material-symbols-outlined text-4xl text-tertiary mb-3">pending_actions</span>
                        <h4 className="font-label-caps text-label-caps text-slate-500 uppercase mb-1">Dalam Proses</h4>
                        <div className="font-h2 text-h2 text-tertiary">{stats.proses}</div>
                        <p className="text-xs text-slate-400 font-label-bold mt-2">Sedang dikerjakan</p>
                    </div>
                    <div className="md:col-span-3 bg-white p-6 rounded-xl card-shadow flex flex-col items-center justify-center text-center border border-slate-100">
                        <span className="material-symbols-outlined text-4xl text-green-600 mb-3">task_alt</span>
                        <h4 className="font-label-caps text-label-caps text-slate-500 uppercase mb-1">Selesai</h4>
                        <div className="font-h2 text-h2 text-green-600">{stats.selesai}</div>
                        <p className="text-xs text-green-600 font-label-bold mt-2">{stats.resolusi}% Tingkat Resolusi</p>
                    </div>
                    <div className="md:col-span-3 bg-white p-6 rounded-xl card-shadow flex flex-col items-center justify-center text-center border border-slate-100">
                        <span className="material-symbols-outlined text-4xl text-blue-400 mb-3">avg_pace</span>
                        <h4 className="font-label-caps text-label-caps text-slate-500 uppercase mb-1">Rata-rata Respon</h4>
                        <div className="font-h2 text-h2 text-blue-700">18 Jam</div>
                        <p className="text-xs text-green-600 font-label-bold mt-2">↓ 2 jam lebih cepat</p>
                    </div>
                    {/* Main Map Section */}
                    <div className="md:col-span-8 bg-white p-6 rounded-xl card-shadow border border-slate-100 min-h-125 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-h3 text-h3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">map</span>
                                Peta Sebaran Laporan
                            </h3>
                            <div className="flex gap-2">
                            </div>
                        </div>
                        <div className="grow bg-slate-50 rounded-lg relative overflow-hidden group">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126492.65158652427!2d110.3013898687786!3d-7.80324846462788!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a5787bd5b6bc5%3A0x21723fd4d3684f71!2sYogyakarta%2C%20Yogyakarta%20City%2C%20Special%20Region%20of%20Yogyakarta!5e0!3m2!1sen!2sid!4v1715872856000!5m2!1sen!2sid"
                                className="w-full border-0 pointer-events-none"
                                style={{ height: 'calc(100% + 100px)', marginTop: '-100px' }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade">
                            </iframe>
                            <div className="absolute inset-0 p-8 flex flex-col justify-end pointer-events-none">
                                <div className="bg-white/90 backdrop-blur-md p-4 rounded-lg w-fit shadow-lg border border-white/20 pointer-events-auto">
                                    <p className="text-xs font-label-caps text-slate-500 mb-2">WILAYAH TERPADAT</p>
                                    <p className="font-label-bold text-primary">{mapData.topLokasi}</p>
                                    <p className="text-sm">{mapData.topCount} Laporan Aktif</p>
                                </div>
                            </div>

                            {/* Titik-titik laporan Dinamis */}
                            {mapData.markers.map(marker => (
                                <div 
                                    key={marker.id}
                                    className={`absolute w-4 h-4 rounded-full animate-pulse border-2 border-white shadow-lg pointer-events-none ${marker.color}`}
                                    style={{ 
                                        top: marker.top, 
                                        left: marker.left, 
                                        animationDelay: marker.delay 
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>
                    {/* Categories Card */}
                    <div className="md:col-span-4 bg-white p-6 rounded-xl card-shadow border border-slate-100 flex flex-col">
                        <h3 className="font-h3 text-h3 mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">pie_chart</span>
                            Kategori Laporan
                        </h3>
                        <div className="space-y-6 grow flex flex-col justify-center">
                            {chartKategori.map(item => (
                                <div key={item.label}>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-label-bold">{item.label}</span>
                                        <span className="text-sm font-label-bold">{item.val}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div className={`${item.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${item.val}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Monthly Trend Graph */}
                    <div className="md:col-span-7 bg-white p-6 rounded-xl card-shadow border border-slate-100">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="font-h3 text-h3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">trending_up</span>
                                    Tren Laporan Bulanan
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">Volume laporan yang masuk sepanjang tahun 2026</p>
                            </div>
                        </div>
                        <div className="h-64 relative border-b border-slate-100 flex items-end justify-between gap-2 px-4 pb-2">
                            {/* Gridlines Background */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-7 pt-2">
                                <div className="w-full border-t border-slate-100/70"></div>
                                <div className="w-full border-t border-slate-100/70"></div>
                                <div className="w-full border-t border-slate-100/70"></div>
                                <div className="w-full border-t border-slate-100/70"></div>
                            </div>

                            {chartBulanan.map((item) => {
                                const maxVal = Math.max(...chartBulanan.map(b => b.val), 1);
                                return (
                                    <div key={item.bulan} className="w-full flex flex-col items-center gap-2 group relative z-10 h-full justify-end">
                                        <div className="absolute -top-10 bg-slate-800/90 text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 font-semibold">
                                            {item.val} Laporan
                                        </div>
                                        <div className={`w-full ${item.active ? 'bg-primary shadow-[0_4px_12px_rgba(0,102,204,0.3)] border-t border-blue-600' : 'bg-blue-100 group-hover:bg-primary/80 group-hover:shadow-[0_4px_12px_rgba(0,102,204,0.15)]'} rounded-t-lg transition-all duration-700`} style={{ height: `${(item.val / maxVal) * 85}%` }}></div>
                                        <span className={`text-[10px] font-label-bold mt-1 ${item.active ? 'text-blue-700 font-extrabold' : 'text-slate-400'}`}>{item.bulan}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {/* Fast Response Ranking */}
                    <div className="md:col-span-5 bg-white p-6 rounded-xl card-shadow border border-slate-100">
                        <h3 className="font-h3 text-h3 mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">speed</span>
                            Ranking Respon Kecamatan
                        </h3>
                        <div className="overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-xs font-label-caps text-slate-500 border-b border-slate-100">
                                        <th className="pb-3 px-2">KECAMATAN</th>
                                        <th className="pb-3 px-2">RESPON</th>
                                        <th className="pb-3 px-2">SKOR</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    <tr className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-2 font-label-bold">Gondomanan</td>
                                        <td className="py-4 px-2 text-sm">4.2 Jam</td>
                                        <td className="py-4 px-2">
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-label-bold">Unggul</span>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-2 font-label-bold">Danurejan</td>
                                        <td className="py-4 px-2 text-sm">5.8 Jam</td>
                                        <td className="py-4 px-2">
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-label-bold">Unggul</span>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-2 font-label-bold">Jetis</td>
                                        <td className="py-4 px-2 text-sm">8.1 Jam</td>
                                        <td className="py-4 px-2">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-label-bold">Standar</span>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-2 font-label-bold">Kotagede</td>
                                        <td className="py-4 px-2 text-sm">12.4 Jam</td>
                                        <td className="py-4 px-2">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-label-bold">Standar</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                {/* Latest Updates */}
                <section className="mt-12 bg-white rounded-xl card-shadow border border-slate-100 p-8">
                    <h3 className="font-h3 text-h3 mb-8">Laporan Terkini yang Diselesaikan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {recentSelesai.length === 0 ? (
                            <p className="text-sm text-slate-400 italic col-span-3">Belum ada laporan yang diselesaikan.</p>
                        ) : (
                            recentSelesai.map(item => {
                                const gambar = item.gambar && item.gambar.length > 0 ? item.gambar[0] : null;
                                return (
                                    <div key={item.id} className="border border-slate-100 rounded-xl p-4 hover:border-blue-200 transition-all cursor-default group">
                                        <div className="h-40 bg-slate-100 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                                            {gambar ? (
                                                <img alt={item.judul} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={gambar} />
                                            ) : (
                                                <span className="material-symbols-outlined text-5xl text-slate-300">image</span>
                                            )}
                                        </div>
                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] rounded-full font-label-bold uppercase">Selesai - {timeAgo(item.updated_at)}</span>
                                        <h4 className="font-label-bold text-md mt-2">{item.judul}</h4>
                                        <p className="text-xs text-slate-500 mt-1">{item.lokasi}</p>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
