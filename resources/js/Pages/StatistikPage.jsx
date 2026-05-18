import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

export default function StatistikPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
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

            <main className="pt-24 pb-12 max-w-7xl mx-auto px-6 flex-grow">
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
                        <div className="font-h2 text-h2 text-primary">12,842</div>
                        <p className="text-xs text-green-600 font-label-bold mt-2">↑ 12% dari bulan lalu</p>
                    </div>
                    <div className="md:col-span-3 bg-white p-6 rounded-xl card-shadow flex flex-col items-center justify-center text-center border border-slate-100">
                        <span className="material-symbols-outlined text-4xl text-tertiary mb-3">pending_actions</span>
                        <h4 className="font-label-caps text-label-caps text-slate-500 uppercase mb-1">Dalam Proses</h4>
                        <div className="font-h2 text-h2 text-tertiary">458</div>
                        <p className="text-xs text-slate-400 font-label-bold mt-2">Update: 5 menit yang lalu</p>
                    </div>
                    <div className="md:col-span-3 bg-white p-6 rounded-xl card-shadow flex flex-col items-center justify-center text-center border border-slate-100">
                        <span className="material-symbols-outlined text-4xl text-green-600 mb-3">task_alt</span>
                        <h4 className="font-label-caps text-label-caps text-slate-500 uppercase mb-1">Selesai</h4>
                        <div className="font-h2 text-h2 text-green-600">11,924</div>
                        <p className="text-xs text-green-600 font-label-bold mt-2">93.2% Tingkat Resolusi</p>
                    </div>
                    <div className="md:col-span-3 bg-white p-6 rounded-xl card-shadow flex flex-col items-center justify-center text-center border border-slate-100">
                        <span className="material-symbols-outlined text-4xl text-blue-400 mb-3">avg_pace</span>
                        <h4 className="font-label-caps text-label-caps text-slate-500 uppercase mb-1">Rata-rata Respon</h4>
                        <div className="font-h2 text-h2 text-blue-700">18 Jam</div>
                        <p className="text-xs text-green-600 font-label-bold mt-2">↓ 2 jam lebih cepat</p>
                    </div>
                    {/* Main Map Section */}
                    <div className="md:col-span-8 bg-white p-6 rounded-xl card-shadow border border-slate-100 min-h-[500px] flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-h3 text-h3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">map</span>
                                Peta Sebaran Laporan
                            </h3>
                            <div className="flex gap-2">
                            </div>
                        </div>
                        <div className="flex-grow bg-slate-50 rounded-lg relative overflow-hidden group">
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
                                    <p className="font-label-bold text-primary">Kecamatan Umbulharjo</p>
                                    <p className="text-sm">152 Laporan Aktif</p>
                                </div>
                            </div>

                            {/* Titik-titik laporan (Mock Markers) */}
                            <div className="absolute top-[35%] left-[45%] w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white shadow-lg pointer-events-none"></div>
                            <div className="absolute top-[42%] left-[52%] w-4 h-4 bg-primary rounded-full animate-pulse border-2 border-white shadow-lg pointer-events-none" style={{ animationDelay: '0.2s' }}></div>
                            <div className="absolute top-[55%] left-[48%] w-4 h-4 bg-tertiary rounded-full animate-pulse border-2 border-white shadow-lg pointer-events-none" style={{ animationDelay: '0.5s' }}></div>
                            <div className="absolute top-[60%] left-[58%] w-4 h-4 bg-primary rounded-full animate-pulse border-2 border-white shadow-lg pointer-events-none" style={{ animationDelay: '0.8s' }}></div>
                            <div className="absolute top-[48%] left-[62%] w-4 h-4 bg-secondary rounded-full animate-pulse border-2 border-white shadow-lg pointer-events-none" style={{ animationDelay: '1.1s' }}></div>
                           
                        </div>
                    </div>
                    {/* Categories Card */}
                    <div className="md:col-span-4 bg-white p-6 rounded-xl card-shadow border border-slate-100 flex flex-col">
                        <h3 className="font-h3 text-h3 mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">pie_chart</span>
                            Kategori Laporan
                        </h3>
                        <div className="space-y-6 flex-grow flex flex-col justify-center">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-label-bold">Infrastruktur &amp; Jalan</span>
                                    <span className="text-sm font-label-bold">42%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-primary h-full rounded-full" style={{ width: "42%" }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-label-bold">Kebersihan &amp; Sampah</span>
                                    <span className="text-sm font-label-bold">28%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-blue-400 h-full rounded-full" style={{ width: "28%" }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-label-bold">Penerangan Jalan</span>
                                    <span className="text-sm font-label-bold">15%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-tertiary h-full rounded-full" style={{ width: "15%" }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-label-bold">Kesehatan</span>
                                    <span className="text-sm font-label-bold">10%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-secondary h-full rounded-full" style={{ width: "10%" }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-label-bold">Lainnya</span>
                                    <span className="text-sm font-label-bold">5%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-slate-300 h-full rounded-full" style={{ width: "5%" }}></div>
                                </div>
                            </div>
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
                                <p className="text-sm text-slate-500 mt-1">Volume laporan yang masuk sepanjang tahun 2024</p>
                            </div>
                        </div>
                        <div className="h-64 flex items-end justify-between gap-2 px-4">
                            <div className="w-full flex flex-col items-center gap-2 group">
                                <div className="w-full bg-blue-100 rounded-t-lg transition-all group-hover:bg-primary" style={{ height: "60%" }}></div>
                                <span className="text-[10px] font-label-bold text-slate-400">JAN</span>
                            </div>
                            <div className="w-full flex flex-col items-center gap-2 group">
                                <div className="w-full bg-blue-100 rounded-t-lg transition-all group-hover:bg-primary" style={{ height: "75%" }}></div>
                                <span className="text-[10px] font-label-bold text-slate-400">FEB</span>
                            </div>
                            <div className="w-full flex flex-col items-center gap-2 group">
                                <div className="w-full bg-blue-100 rounded-t-lg transition-all group-hover:bg-primary" style={{ height: "45%" }}></div>
                                <span className="text-[10px] font-label-bold text-slate-400">MAR</span>
                            </div>
                            <div className="w-full flex flex-col items-center gap-2 group">
                                <div className="w-full bg-blue-100 rounded-t-lg transition-all group-hover:bg-primary" style={{ height: "90%" }}></div>
                                <span className="text-[10px] font-label-bold text-slate-400">APR</span>
                            </div>
                            <div className="w-full flex flex-col items-center gap-2 group">
                                <div className="w-full bg-blue-100 rounded-t-lg transition-all group-hover:bg-primary" style={{ height: "65%" }}></div>
                                <span className="text-[10px] font-label-bold text-slate-400">MEI</span>
                            </div>
                            <div className="w-full flex flex-col items-center gap-2 group">
                                <div className="w-full bg-primary rounded-t-lg transition-all" style={{ height: "100%" }}></div>
                                <span className="text-[10px] font-label-bold text-blue-700">JUN</span>
                            </div>
                            <div className="w-full flex flex-col items-center gap-2 group">
                                <div className="w-full bg-blue-100 rounded-t-lg transition-all group-hover:bg-primary" style={{ height: "55%" }}></div>
                                <span className="text-[10px] font-label-bold text-slate-400">JUL</span>
                            </div>
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
                        {/* Case 1 */}
                        <div className="border border-slate-100 rounded-xl p-4 hover:border-blue-200 transition-all cursor-default group">
                            <div className="h-40 bg-slate-100 rounded-lg mb-4 overflow-hidden">
                                <img alt="Perbaikan Jalan" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/img/perbaikan-jalan.jpg" />
                            </div>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] rounded-full font-label-bold uppercase">Selesai - 2 Jam Lalu</span>
                            <h4 className="font-label-bold text-md mt-2">Perbaikan Jalan Berlubang</h4>
                            <p className="text-xs text-slate-500 mt-1">Jl. Antasari No. 12, Kebayoran Baru</p>
                        </div>
                        {/* Case 2 */}
                        <div className="border border-slate-100 rounded-xl p-4 hover:border-blue-200 transition-all cursor-default group">
                            <div className="h-40 bg-slate-100 rounded-lg mb-4 overflow-hidden">
                                <img alt="Penerangan Jalan" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/img/penerangan-jalan.jpg" />
                            </div>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] rounded-full font-label-bold uppercase">Selesai - 5 Jam Lalu</span>
                            <h4 className="font-label-bold text-md mt-2">Lampu Jalan Padam</h4>
                            <p className="text-xs text-slate-500 mt-1">Area Taman Mataram, Selong</p>
                        </div>
                        {/* Case 3 */}
                        <div className="border border-slate-100 rounded-xl p-4 hover:border-blue-200 transition-all cursor-default group">
                            <div className="h-40 bg-slate-100 rounded-lg mb-4 overflow-hidden">
                                <img alt="Kebersihan" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="/img/kebersihan.jpg" />
                            </div>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] rounded-full font-label-bold uppercase">Selesai - 8 Jam Lalu</span>
                            <h4 className="font-label-bold text-md mt-2">Penumpukan Sampah Liar</h4>
                            <p className="text-xs text-slate-500 mt-1">Pasar Santa, Petogogan</p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
