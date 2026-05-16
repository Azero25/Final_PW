import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../Components/AdminLayout';

/**
 * Halaman Dashboard Admin
 * Panel kontrol utama untuk administrator sistem pengaduan.
 */
export default function AdminDashboardPage() {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    const [activeMenu, setActiveMenu] = useState('dashboard');

    // Data dummy statistik ringkasan
    const statsData = [
        { label: 'Total Laporan', value: '1.284', change: '+12%', icon: 'assignment', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
        { label: 'Menunggu Verifikasi', value: '48', change: '+5', icon: 'pending_actions', color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-100' },
        { label: 'Sedang Diproses', value: '127', change: '-3', icon: 'engineering', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
        { label: 'Selesai Bulan Ini', value: '312', change: '+28%', icon: 'task_alt', color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-100' },
    ];

    // Data dummy laporan terbaru
    const laporanTerbaru = [
        { id: 'LPW-2024-001284', judul: 'Jalan Rusak di Jl. Solo', kategori: 'Infrastruktur', kecamatan: 'Gondokusuman', tanggal: '16 Mei 2024', status: 'Menunggu', prioritas: 'Tinggi' },
        { id: 'LPW-2024-001283', judul: 'Sampah Menumpuk TPS Demangan', kategori: 'Kebersihan', kecamatan: 'Gondokusuman', tanggal: '16 Mei 2024', status: 'Diproses', prioritas: 'Sedang' },
        { id: 'LPW-2024-001282', judul: 'Lampu Jalan Mati di Jl. Veteran', kategori: 'Penerangan', kecamatan: 'Kraton', tanggal: '15 Mei 2024', status: 'Selesai', prioritas: 'Rendah' },
        { id: 'LPW-2024-001281', judul: 'Saluran Air Tersumbat', kategori: 'Sanitasi', kecamatan: 'Umbulharjo', tanggal: '15 Mei 2024', status: 'Diproses', prioritas: 'Tinggi' },
        { id: 'LPW-2024-001280', judul: 'PKL Berdagang di Trotoar', kategori: 'Ketertiban', kecamatan: 'Gondomanan', tanggal: '14 Mei 2024', status: 'Menunggu', prioritas: 'Sedang' },
        { id: 'LPW-2024-001279', judul: 'Pohon Tumbang Menghalangi Jalan', kategori: 'Lingkungan', kecamatan: 'Jetis', tanggal: '14 Mei 2024', status: 'Selesai', prioritas: 'Tinggi' },
        { id: 'LPW-2024-001278', judul: 'Fasilitas Taman Rusak', kategori: 'Fasilitas Umum', kecamatan: 'Danurejan', tanggal: '13 Mei 2024', status: 'Diproses', prioritas: 'Rendah' },
    ];

    // Konfigurasi menu sidebar
    const menuItems = [];

    // Helper badge status
    const StatusBadge = ({ status }) => {
        const config = {
            'Menunggu': 'bg-yellow-100 text-yellow-700 border border-yellow-200',
            'Diproses': 'bg-blue-100 text-blue-700 border border-blue-200',
            'Selesai': 'bg-green-100 text-green-700 border border-green-200',
            'Ditolak': 'bg-red-100 text-red-700 border border-red-200',
        };
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config[status] || 'bg-slate-100 text-slate-600'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                {status}
            </span>
        );
    };

    // Helper badge prioritas
    const PrioritasBadge = ({ prioritas }) => {
        const config = {
            'Tinggi': 'text-red-600 bg-red-50',
            'Sedang': 'text-orange-600 bg-orange-50',
            'Rendah': 'text-slate-500 bg-slate-100',
        };
        return (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${config[prioritas] || ''}`}>
                {prioritas}
            </span>
        );
    };

    return (
        <AdminLayout pageTitle="Dashboard" pageSubtitle={`Jumat, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`}>

                    {/* Kartu Statistik */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
                        {statsData.map((stat) => (
                            <div key={stat.label} className={`bg-white rounded-2xl p-5 border ${stat.border} shadow-sm hover:shadow-md transition-shadow`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                                        <span className={`material-symbols-outlined text-2xl ${stat.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                                    </div>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        {stat.change}
                                    </span>
                                </div>
                                <p className="text-3xl font-bold text-slate-800 mb-1">{stat.value}</p>
                                <p className="text-sm text-slate-500">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Baris tengah: Grafik + Aktivitas */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">

                        {/* Grafik Tren Bulanan (Simulasi) */}
                        <div className="xl:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="font-bold text-slate-800">Tren Laporan Masuk</h2>
                                    <p className="text-xs text-slate-400 mt-0.5">6 bulan terakhir</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg">Bulanan</button>
                                    <button className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">Mingguan</button>
                                </div>
                            </div>
                            {/* Bar Chart Simulasi */}
                            <div className="flex items-end justify-between gap-3 h-40">
                                {[
                                    { bulan: 'Des', val: 65 },
                                    { bulan: 'Jan', val: 78 },
                                    { bulan: 'Feb', val: 90 },
                                    { bulan: 'Mar', val: 110 },
                                    { bulan: 'Apr', val: 145 },
                                    { bulan: 'Mei', val: 312, active: true },
                                ].map((item) => (
                                    <div key={item.bulan} className="flex flex-col items-center gap-2 flex-1">
                                        <span className="text-xs font-bold text-slate-700">{item.val}</span>
                                        <div
                                            className={`w-full rounded-t-lg transition-all duration-500 ${item.active ? 'bg-blue-500' : 'bg-slate-200 hover:bg-blue-300'}`}
                                            style={{ height: `${(item.val / 312) * 130}px` }}
                                        ></div>
                                        <span className="text-xs text-slate-400">{item.bulan}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Distribusi Kategori */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                            <h2 className="font-bold text-slate-800 mb-1">Kategori Teratas</h2>
                            <p className="text-xs text-slate-400 mb-5">Berdasarkan jumlah laporan</p>
                            <div className="space-y-4">
                                {[
                                    { label: 'Infrastruktur', val: 38, color: 'bg-blue-500' },
                                    { label: 'Kebersihan', val: 24, color: 'bg-green-500' },
                                    { label: 'Penerangan', val: 18, color: 'bg-yellow-400' },
                                    { label: 'Sanitasi', val: 12, color: 'bg-orange-400' },
                                    { label: 'Lainnya', val: 8, color: 'bg-slate-300' },
                                ].map((item) => (
                                    <div key={item.label}>
                                        <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                                            <span className="font-medium">{item.label}</span>
                                            <span className="font-bold">{item.val}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full ${item.color} rounded-full transition-all duration-700`} style={{ width: `${item.val}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Tabel Laporan Terbaru */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                            <div>
                                <h2 className="font-bold text-slate-800">Laporan Terbaru</h2>
                                <p className="text-xs text-slate-400 mt-0.5">Pengaduan yang baru masuk dan perlu ditindaklanjuti</p>
                            </div>
                            <div className="flex gap-3">
                                {/* Search */}
                                <div className="relative hidden sm:block">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
                                    <input
                                        type="text"
                                        placeholder="Cari laporan..."
                                        className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 transition-colors"
                                    />
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                                    <span className="material-symbols-outlined text-base">download</span>
                                    Export
                                </button>
                            </div>
                        </div>

                        {/* Tabel */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 text-left">
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">No. Tiket</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Judul Laporan</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Kategori</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Kecamatan</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tanggal</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Prioritas</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {laporanTerbaru.map((laporan, idx) => (
                                        <tr key={laporan.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs text-blue-600 font-semibold">{laporan.id}</td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-slate-800 max-w-[200px] truncate">{laporan.judul}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium">{laporan.kategori}</span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 text-sm">{laporan.kecamatan}</td>
                                            <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">{laporan.tanggal}</td>
                                            <td className="px-6 py-4"><PrioritasBadge prioritas={laporan.prioritas} /></td>
                                            <td className="px-6 py-4"><StatusBadge status={laporan.status} /></td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1">
                                                    <button className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Lihat Detail">
                                                        <span className="material-symbols-outlined text-base">visibility</span>
                                                    </button>
                                                    <button className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Update Status">
                                                        <span className="material-symbols-outlined text-base">edit</span>
                                                    </button>
                                                    <button className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                                                        <span className="material-symbols-outlined text-base">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                            <p className="text-xs text-slate-500">Menampilkan 7 dari 1.284 laporan</p>
                            <div className="flex gap-1">
                                <button className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">Sebelumnya</button>
                                {[1, 2, 3].map((n) => (
                                    <button key={n} className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${n === 1 ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>{n}</button>
                                ))}
                                <span className="px-2 py-1.5 text-xs text-slate-400">...</span>
                                <button className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">184</button>
                                <button className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">Berikutnya</button>
                            </div>
                        </div>
                    </div>

        </AdminLayout>
    );
}
