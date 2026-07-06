import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../Components/AdminLayout';
import api from '../../axios';
/**
 * Halaman Dashboard Admin
 * Panel kontrol utama untuk administrator sistem pengaduan.
 */
export default function AdminDashboardPage() {
    const [laporanTerbaru, setLaporanTerbaru] = useState(() => {
        const stored = localStorage.getItem('laporwarga_cache_dashboard_laporan');
        return stored ? JSON.parse(stored) : [];
    });
    const [statsData, setStatsData] = useState(() => {
        const stored = localStorage.getItem('laporwarga_cache_dashboard_stats');
        return stored ? JSON.parse(stored) : [
            { label: 'Total Laporan', value: '0', change: '0%', icon: 'assignment', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
            { label: 'Menunggu Verifikasi', value: '0', change: '0', icon: 'pending_actions', color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-100' },
            { label: 'Sedang Diproses', value: '0', change: '0', icon: 'engineering', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
            { label: 'Selesai', value: '0', change: '0%', icon: 'task_alt', color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-100' },
        ];
    });
    const [chartBulanan, setChartBulanan] = useState(() => {
        const stored = localStorage.getItem('laporwarga_cache_dashboard_chart_bulanan');
        return stored ? JSON.parse(stored) : [];
    });
    const [chartKategori, setChartKategori] = useState(() => {
        const stored = localStorage.getItem('laporwarga_cache_dashboard_chart_kategori');
        return stored ? JSON.parse(stored) : [];
    });
    const [isLoading, setIsLoading] = useState(() => {
        const storedLaporan = localStorage.getItem('laporwarga_cache_dashboard_laporan');
        return !storedLaporan;
    });

    const [modalLaporan, setModalLaporan] = useState(null);
    const [modalMode, setModalMode] = useState('detail');
    const [editStatus, setEditStatus] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Search & Pagination States
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const fetchData = async () => {
        const hasCache = !!localStorage.getItem('laporwarga_cache_dashboard_laporan');
        if (!hasCache) setIsLoading(true);
        try {
            const response = await api.get('/api/pengaduans');
            const data = response.data;

            // Format data untuk tabel
            const formattedData = data.map(item => ({
                id: item.nomor_tiket,
                judul: item.judul,
                kategori: item.kategori,
                kecamatan: item.kecamatan || item.lokasi,
                pelapor: item.anonim ? 'Anonim' : (item.nama || 'Warga'),
                tanggal: new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                status: item.status,
                prioritas: item.urgensi === 'tinggi' ? 'Tinggi' : (item.urgensi === 'sedang' ? 'Sedang' : 'Rendah'),
                deskripsi: item.deskripsi || '',
                nama_petugas: item.nama_petugas,
                nama_dinas: item.nama_dinas
            }));
            setLaporanTerbaru(formattedData);
            localStorage.setItem('laporwarga_cache_dashboard_laporan', JSON.stringify(formattedData));

            // Hitung statistik
            const total = data.length;
            const menunggu = data.filter(i => i.status === 'Laporan Diterima' || i.status === 'Verifikasi').length;
            const diproses = data.filter(i => i.status === 'Sedang Diproses').length;
            const selesai = data.filter(i => i.status === 'Selesai').length;

            const newStats = [
                { label: 'Total Laporan', value: total.toString(), change: '+0%', icon: 'assignment', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
                { label: 'Menunggu Verifikasi', value: menunggu.toString(), change: '0', icon: 'pending_actions', color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-100' },
                { label: 'Sedang Diproses', value: diproses.toString(), change: '0', icon: 'engineering', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
                { label: 'Selesai', value: selesai.toString(), change: '+0%', icon: 'task_alt', color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-100' },
            ];
            setStatsData(newStats);
            localStorage.setItem('laporwarga_cache_dashboard_stats', JSON.stringify(newStats));

            // Hitung Data Grafik Tren Bulanan (6 bulan terakhir)
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            let monthlyCounts = {};
            for (let i = 5; i >= 0; i--) {
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
            localStorage.setItem('laporwarga_cache_dashboard_chart_bulanan', JSON.stringify(bulananArr));

            // Hitung Data Grafik Kategori
            const kategoriCounts = {};
            data.forEach(item => {
                const k = item.kategori || 'Lainnya';
                // Kapitalisasi huruf pertama
                const label = k.charAt(0).toUpperCase() + k.slice(1);
                kategoriCounts[label] = (kategoriCounts[label] || 0) + 1;
            });

            const sortedKategori = Object.keys(kategoriCounts)
                .map(key => ({ label: key, count: kategoriCounts[key] }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5); // Ambil Top 5

            const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-400', 'bg-orange-400', 'bg-slate-300'];
            const kategoriArr = sortedKategori.map((item, idx) => ({
                label: item.label,
                val: total > 0 ? Math.round((item.count / total) * 100) : 0,
                color: colors[idx % colors.length]
            }));
            setChartKategori(kategoriArr);
            localStorage.setItem('laporwarga_cache_dashboard_chart_kategori', JSON.stringify(kategoriArr));

        } catch (error) {
            console.error("Error fetching pengaduans", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchData();
    }, []);

    // Filter dan Paginate Data Laporan
    const filteredLaporan = laporanTerbaru.filter(l => 
        l.judul.toLowerCase().includes(searchQuery.toLowerCase()) || 
        l.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.pelapor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.kategori.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredLaporan.length / ITEMS_PER_PAGE) || 1;
    
    // Pastikan halaman saat ini tidak melebihi total halaman jika filter berubah
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages > 0 ? totalPages : 1);
        }
    }, [searchQuery, totalPages]);

    const paginatedLaporan = filteredLaporan.slice(
        (currentPage - 1) * ITEMS_PER_PAGE, 
        currentPage * ITEMS_PER_PAGE
    );

    const openModal = (laporanItem, mode = 'detail') => {
        setModalLaporan(laporanItem);
        setModalMode(mode);
        setEditStatus(laporanItem.status);
    };

    const handleSaveStatus = async () => {
        if (!modalLaporan || editStatus === modalLaporan.status) {
            setModalLaporan(null);
            return;
        }

        setIsSaving(true);
        try {
            await api.put(`/api/pengaduans/${modalLaporan.id}`, { status: editStatus });
            fetchData();
            setModalLaporan(null);
        } catch (error) {
            alert('Gagal mengupdate status laporan.');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!modalLaporan) return;

        setIsSaving(true);
        try {
            await api.delete(`/api/pengaduans/${modalLaporan.id}`);
            fetchData();
            setModalLaporan(null);
        } catch (error) {
            alert('Gagal menghapus laporan.');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleExportCSV = () => {
        if (filteredLaporan.length === 0) {
            alert('Tidak ada data laporan untuk di-export.');
            return;
        }

        const headers = [
            'Nomor Tiket',
            'Judul Laporan',
            'Deskripsi',
            'Kategori',
            'Lokasi Laporan',
            'Pelapor',
            'Tanggal',
            'Prioritas',
            'Status',
            'Petugas',
            'Dinas'
        ];

        const csvRows = [
            'sep=;',
            headers.join(';'),
            ...filteredLaporan.map(row => {
                const values = [
                    row.id, // nomor tiket
                    row.judul,
                    row.deskripsi,
                    row.kategori,
                    row.kecamatan,
                    row.pelapor,
                    row.tanggal,
                    row.prioritas,
                    row.status,
                    row.nama_petugas || '-',
                    row.nama_dinas || '-'
                ];

                return values.map(val => {
                    const escaped = String(val === null || val === undefined ? '' : val).replace(/"/g, '""');
                    return `"${escaped}"`;
                }).join(';');
            })
        ];

        const csvContent = "\ufeff" + csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        
        const dateStr = new Date().toISOString().split('T')[0];
        link.setAttribute('download', `laporan_pengaduan_dashboard_${dateStr}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Helper badge status
    const StatusBadge = ({ status }) => {
        const config = {
            'Laporan Diterima': 'bg-slate-100 text-slate-700 border border-slate-200',
            'Verifikasi': 'bg-yellow-100 text-yellow-700 border border-yellow-200',
            'Sedang Diproses': 'bg-blue-100 text-blue-700 border border-blue-200',
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
                            {/* Bar Chart Real Data */}
                            <div className="flex items-end justify-between gap-3 h-40">
                                {chartBulanan.map((item) => {
                                    const maxVal = Math.max(...chartBulanan.map(b => b.val), 1); // hindari bagi nol
                                    return (
                                        <div key={item.bulan} className="flex flex-col items-center gap-2 flex-1">
                                            <span className="text-xs font-bold text-slate-700">{item.val}</span>
                                            <div
                                                className={`w-full rounded-t-lg transition-all duration-500 ${item.active ? 'bg-blue-500' : 'bg-slate-200 hover:bg-blue-300'}`}
                                                style={{ height: `${(item.val / maxVal) * 130}px` }}
                                            ></div>
                                            <span className="text-xs text-slate-400">{item.bulan}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Distribusi Kategori */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                            <h2 className="font-bold text-slate-800 mb-1">Kategori Teratas</h2>
                            <p className="text-xs text-slate-400 mb-5">Berdasarkan jumlah laporan</p>
                            <div className="space-y-4">
                                {chartKategori.map((item) => (
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
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setCurrentPage(1); // Reset page on search
                                        }}
                                        placeholder="Cari laporan..."
                                        className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 transition-colors"
                                    />
                                </div>
                                <button 
                                    onClick={handleExportCSV}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-base">download</span>
                                    Export CSV
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
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-8 text-center text-slate-500">
                                                Memuat data...
                                            </td>
                                        </tr>
                                    ) : paginatedLaporan.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-8 text-center text-slate-500">
                                                Tidak ada laporan yang sesuai pencarian.
                                            </td>
                                        </tr>
                                    ) : paginatedLaporan.map((laporan, idx) => (
                                        <tr key={laporan.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs text-blue-600 font-semibold">{laporan.id}</td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-slate-800 max-w-50 truncate">{laporan.judul}</p>
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
                                                    <button onClick={() => openModal(laporan, 'detail')} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Lihat Detail">
                                                        <span className="material-symbols-outlined text-base">visibility</span>
                                                    </button>
                                                    <button onClick={() => openModal(laporan, 'edit')} className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Update Status">
                                                        <span className="material-symbols-outlined text-base">edit</span>
                                                    </button>
                                                    <button onClick={() => openModal(laporan, 'delete')} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
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
                            <p className="text-xs text-slate-500">
                                Menampilkan {filteredLaporan.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredLaporan.length)} dari {filteredLaporan.length} laporan
                            </p>
                            <div className="flex gap-1">
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Sebelumnya
                                </button>
                                
                                {(() => {
                                    if (totalPages <= 3) {
                                        return Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                                    currentPage === pageNum
                                                        ? 'bg-blue-600 text-white'
                                                        : 'text-slate-500 hover:bg-slate-100'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        ));
                                    }

                                    const range = [1];
                                    if (currentPage > 2) range.push('...');
                                    if (currentPage > 1 && currentPage < totalPages) range.push(currentPage);
                                    if (currentPage < totalPages - 1) range.push('...');
                                    range.push(totalPages);

                                    return range.map((item, idx) => {
                                        if (item === '...') {
                                            return (
                                                <span key={`dots-${idx}`} className="px-2 py-1.5 text-xs text-slate-400 select-none">
                                                    ...
                                                </span>
                                            );
                                        }
                                        return (
                                            <button
                                                key={`page-${item}`}
                                                onClick={() => setCurrentPage(item)}
                                                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                                    currentPage === item
                                                        ? 'bg-blue-600 text-white'
                                                        : 'text-slate-500 hover:bg-slate-100'
                                                }`}
                                            >
                                                {item}
                                            </button>
                                        );
                                    });
                                })()}

                                <button 
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Berikutnya
                                </button>
                            </div>
                        </div>
                    </div>

            {/* ======== MODAL DETAIL / EDIT / DELETE ======== */}
            {modalLaporan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setModalLaporan(null)}>
                    <div className={`bg-white rounded-2xl shadow-2xl w-full ${modalMode === 'delete' ? 'max-w-md' : 'max-w-lg'}`} onClick={(e) => e.stopPropagation()}>

                        {/* Header Modal */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                            <div>
                                <h2 className={`font-bold text-lg ${modalMode === 'delete' ? 'text-red-600' : 'text-slate-800'}`}>
                                    {modalMode === 'detail' ? 'Detail Laporan' : modalMode === 'edit' ? 'Update Status Laporan' : 'Konfirmasi Hapus Laporan'}
                                </h2>
                                <p className="text-xs text-slate-400 font-mono mt-0.5">{modalLaporan.id}</p>
                            </div>
                            <button onClick={() => setModalLaporan(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Body Modal */}
                        <div className="px-6 py-5 space-y-4">
                            {modalMode === 'delete' ? (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="material-symbols-outlined text-3xl">warning</span>
                                    </div>
                                    <p className="text-slate-700">Apakah Anda yakin ingin menghapus laporan <strong>{modalLaporan.judul}</strong>?</p>
                                    <p className="text-sm text-slate-500 mt-2">Tindakan ini tidak dapat dibatalkan dan semua data terkait laporan ini akan hilang selamanya.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-xs text-slate-400 mb-1">Judul Laporan</p>
                                            <p className="font-semibold text-slate-800">{modalLaporan.judul}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 mb-1">Pelapor</p>
                                            <p className="font-semibold text-slate-800">{modalLaporan.pelapor}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 mb-1">Kategori</p>
                                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium">{modalLaporan.kategori}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 mb-1">Kecamatan</p>
                                            <p className="text-slate-700">{modalLaporan.kecamatan}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 mb-1">Prioritas</p>
                                            <PrioritasBadge prioritas={modalLaporan.prioritas} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 mb-1">Tanggal Masuk</p>
                                            <p className="text-slate-700">{modalLaporan.tanggal}</p>
                                        </div>
                                    </div>

                                    {/* Status saat ini */}
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-slate-400 mb-1">Status Saat Ini</p>
                                            <StatusBadge status={modalLaporan.status} />
                                        </div>
                                        {modalMode === 'detail' && (
                                            <Link to={`/lacak?tiket=${modalLaporan.id}`} className="text-sm text-blue-600 hover:underline font-semibold flex items-center gap-1">
                                                Lihat Lacak Penuh <span className="material-symbols-outlined text-sm">open_in_new</span>
                                            </Link>
                                        )}
                                    </div>

                                    {/* Edit Mode: Ubah status */}
                                    {modalMode === 'edit' && (
                                        <div>
                                            <label className="text-xs text-slate-500 font-semibold block mb-2">Ubah Status Menjadi</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['Laporan Diterima', 'Verifikasi', 'Sedang Diproses', 'Selesai', 'Ditolak'].map((s) => (
                                                    <button
                                                        key={s}
                                                        onClick={() => setEditStatus(s)}
                                                        className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all
                                                            ${editStatus === s
                                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                                : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'
                                                            }`}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Footer Modal */}
                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
                            <button disabled={isSaving} onClick={() => setModalLaporan(null)} className="px-5 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-white transition-colors font-semibold bg-transparent">
                                {modalMode === 'detail' ? 'Tutup' : 'Batal'}
                            </button>

                            {modalMode === 'edit' && (
                                <button
                                    disabled={isSaving}
                                    onClick={handleSaveStatus}
                                    className="px-5 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            )}

                            {modalMode === 'delete' && (
                                <button
                                    disabled={isSaving}
                                    onClick={handleDelete}
                                    className="px-5 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSaving ? 'Menghapus...' : 'Ya, Hapus Laporan'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </AdminLayout>
    );
}
