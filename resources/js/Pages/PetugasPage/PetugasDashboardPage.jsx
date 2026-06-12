import React, { useState, useEffect, useMemo } from 'react';
import PetugasLayout from '../../Components/PetugasLayout';
import api from '../../axios';

const mapStatusToPetugas = (backendStatus) => {
    if (backendStatus === 'Laporan Diterima' || backendStatus === 'Verifikasi') {
        return 'Menunggu';
    }
    if (backendStatus === 'Sedang Diproses' || backendStatus === 'Diproses') {
        return 'Diproses';
    }
    if (backendStatus === 'Selesai') {
        return 'Selesai';
    }
    return backendStatus;
};

const mapStatusToBackend = (petugasStatus) => {
    if (petugasStatus === 'Menunggu') {
        return 'Verifikasi';
    }
    if (petugasStatus === 'Diproses') {
        return 'Sedang Diproses';
    }
    if (petugasStatus === 'Selesai') {
        return 'Selesai';
    }
    return petugasStatus;
};

const matchesDinas = (reportKategori, petugasDinas) => {
    if (!reportKategori || !petugasDinas) return false;
    const rKat = reportKategori.toLowerCase();
    const pDinas = petugasDinas.toLowerCase();

    if (pDinas.includes('pekerjaan umum') || pDinas.includes('pupr')) {
        return rKat === 'infrastruktur' || rKat === 'lainnya';
    }
    if (pDinas.includes('bpbd') || pDinas.includes('penanggulangan bencana')) {
        return rKat === 'kedaruratan' || rKat === 'bencana';
    }
    if (pDinas.includes('lingkungan hidup') || pDinas.includes('dlh')) {
        return rKat === 'lingkungan' || rKat === 'kebersihan';
    }
    if (pDinas.includes('kesehatan')) {
        return rKat === 'kesehatan';
    }
    if (pDinas.includes('perhubungan') || pDinas.includes('dishub')) {
        return rKat === 'transportasi';
    }
    if (pDinas.includes('perumahan') || pDinas.includes('perkim')) {
        return rKat === 'perumahan';
    }
    if (pDinas.includes('pendidikan')) {
        return rKat === 'pendidikan';
    }
    if (pDinas.includes('sosial')) {
        return rKat === 'sosial';
    }
    if (pDinas.includes('polisi pamong praja') || pDinas.includes('satpol')) {
        return rKat === 'ketertiban';
    }
    return rKat === pDinas;
};

const formatLaporanToTugas = (laporan) => {
    return {
        id: laporan.nomor_tiket || laporan.id,
        judul: laporan.judul,
        kategori: laporan.kategori,
        lokasi: laporan.lokasi,
        tanggal: laporan.created_at,
        prioritas: laporan.prioritas || (laporan.urgensi ? (laporan.urgensi.charAt(0).toUpperCase() + laporan.urgensi.slice(1)) : 'Sedang'),
        status: mapStatusToPetugas(laporan.status),
        pelapor: laporan.nama || 'Warga',
        deskripsi: laporan.deskripsi
    };
};

/**
 * Dashboard Petugas — 2 Tab:
 * 1. Statistik: Kartu ringkasan, Grafik bar tren bulanan, Distribusi status
 * 2. Daftar Tugas: Tabel tugas dinas, filter, detail, update status
 *
 * Data dummy di-generate berdasarkan dinas petugas yang login.
 * Ketika backend siap, tinggal ganti ke api.get(...)
 */
import { getTasksForDinas } from './petugasData';

export default function PetugasDashboardPage() {
    const [petugas, setPetugas] = useState(null);
    const [activeTab, setActiveTab] = useState('statistik');

    // Filter state
    const [filterStatus, setFilterStatus] = useState('Semua');
    const [filterPrioritas, setFilterPrioritas] = useState('Semua');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state
    const [modalTugas, setModalTugas] = useState(null);
    const [modalMode, setModalMode] = useState('detail'); // 'detail' | 'updateStatus'
    const [editStatus, setEditStatus] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Ambil data petugas
    useEffect(() => {
        const sesi = sessionStorage.getItem('petugas');
        if (sesi) setPetugas(JSON.parse(sesi));
    }, []);

    // Data tugas berdasarkan dinas
    const [tugasList, setTugasList] = useState([]);

    const fetchLaporan = async () => {
        if (!petugas?.dinas) return;
        try {
            const response = await api.get('/api/pengaduans');
            const filtered = response.data
                .filter(l => matchesDinas(l.kategori, petugas.dinas))
                .map(formatLaporanToTugas);
            setTugasList(filtered);
        } catch (error) {
            console.error("Error fetching reports:", error);
        }
    };

    useEffect(() => {
        if (petugas) {
            fetchLaporan();
        }
    }, [petugas]);

    // ====== STATISTIK ======
    const stats = useMemo(() => {
        const total = tugasList.length;
        const selesai = tugasList.filter(t => t.status === 'Selesai').length;
        const diproses = tugasList.filter(t => t.status === 'Diproses').length;
        const menunggu = tugasList.filter(t => t.status === 'Menunggu').length;
        const tingkatPenyelesaian = total > 0 ? Math.round((selesai / total) * 100) : 0;

        return { total, selesai, diproses, menunggu, tingkatPenyelesaian };
    }, [tugasList]);

    // Data chart bulanan (6 bulan terakhir) — simulasi
    const chartBulanan = useMemo(() => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
        const now = new Date();
        const result = [];

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const month = monthNames[d.getMonth()];
            // Simulasi: hitung tugas yang tanggalnya jatuh di bulan itu
            const count = tugasList.filter(t => {
                const td = new Date(t.tanggal);
                return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
            }).length;
            result.push({
                bulan: month,
                val: count,
                active: i === 0,
            });
        }
        return result;
    }, [tugasList]);

    // Distribusi status
    const statusDistribusi = useMemo(() => {
        const total = tugasList.length || 1;
        return [
            { label: 'Menunggu', count: stats.menunggu, pct: Math.round((stats.menunggu / total) * 100), color: 'bg-amber-400', textColor: 'text-amber-600', bgLight: 'bg-amber-50' },
            { label: 'Diproses', count: stats.diproses, pct: Math.round((stats.diproses / total) * 100), color: 'bg-blue-500', textColor: 'text-blue-600', bgLight: 'bg-blue-50' },
            { label: 'Selesai', count: stats.selesai, pct: Math.round((stats.selesai / total) * 100), color: 'bg-emerald-500', textColor: 'text-emerald-600', bgLight: 'bg-emerald-50' },
        ];
    }, [stats, tugasList]);

    // ====== FILTERED TUGAS ======
    const filteredTugas = useMemo(() => {
        return tugasList.filter(t => {
            const matchStatus = filterStatus === 'Semua' || t.status === filterStatus;
            const matchPrioritas = filterPrioritas === 'Semua' || t.prioritas === filterPrioritas;
            const matchSearch = !searchQuery || t.judul.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.toLowerCase().includes(searchQuery.toLowerCase()) || t.lokasi.toLowerCase().includes(searchQuery.toLowerCase());
            return matchStatus && matchPrioritas && matchSearch;
        });
    }, [tugasList, filterStatus, filterPrioritas, searchQuery]);

    // ====== MODAL HANDLERS ======
    const openModal = (tugas, mode = 'detail') => {
        setModalTugas(tugas);
        setModalMode(mode);
        setEditStatus(tugas.status);
    };

    const handleUpdateStatus = async () => {
        if (!modalTugas || editStatus === modalTugas.status) {
            setModalTugas(null);
            return;
        }
        setIsSaving(true);

        try {
            const backendStatus = mapStatusToBackend(editStatus);
            await api.put(`/api/pengaduans/${modalTugas.id}`, { status: backendStatus });
            
            await fetchLaporan();

            setToastMessage(`Status ${modalTugas.id} diperbarui menjadi "${editStatus}"`);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Gagal memperbarui status laporan ke server.");
        } finally {
            setIsSaving(false);
            setModalTugas(null);
        }
    };

    // ====== BADGE HELPERS ======
    const StatusBadge = ({ status }) => {
        const config = {
            'Menunggu': 'bg-amber-100 text-amber-700 border border-amber-200',
            'Diproses': 'bg-blue-100 text-blue-700 border border-blue-200',
            'Selesai': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
        };
        const icons = {
            'Menunggu': 'hourglass_top',
            'Diproses': 'engineering',
            'Selesai': 'check_circle',
        };
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config[status] || 'bg-slate-100 text-slate-600'}`}>
                <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icons[status] || 'circle'}</span>
                {status}
            </span>
        );
    };

    const PrioritasBadge = ({ prioritas }) => {
        const config = {
            'Tinggi': 'text-red-600 bg-red-50 border border-red-100',
            'Sedang': 'text-orange-600 bg-orange-50 border border-orange-100',
            'Rendah': 'text-slate-500 bg-slate-100 border border-slate-200',
        };
        const icons = {
            'Tinggi': 'priority_high',
            'Sedang': 'remove',
            'Rendah': 'keyboard_arrow_down',
        };
        return (
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${config[prioritas] || ''}`}>
                <span className="material-symbols-outlined text-[11px]">{icons[prioritas]}</span>
                {prioritas}
            </span>
        );
    };

    const tabs = [
        { id: 'statistik', label: 'Statistik', icon: 'analytics' },
        { id: 'tugas', label: 'Daftar Tugas', icon: 'assignment' },
    ];

    return (
        <PetugasLayout
            pageTitle="Dashboard Petugas"
            pageSubtitle={petugas ? `${petugas.dinas} — ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}` : ''}
        >
            {/* Tab Navigasi */}
            <div className="flex items-center gap-1 bg-white rounded-2xl p-1.5 border border-slate-200 shadow-sm mb-6 w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                            ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: activeTab === tab.id ? "'FILL' 1" : "'FILL' 0" }}>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ==================== TAB 1: STATISTIK ==================== */}
            {activeTab === 'statistik' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    {/* Kartu Statistik */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                        {[
                            { label: 'Total Tugas', value: stats.total, icon: 'assignment', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100', gradient: 'from-blue-500 to-blue-600' },
                            { label: 'Tugas Selesai', value: stats.selesai, icon: 'task_alt', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', gradient: 'from-emerald-500 to-emerald-600' },
                            { label: 'Tugas Aktif', value: stats.diproses + stats.menunggu, icon: 'pending_actions', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100', gradient: 'from-blue-500 to-blue-600' },
                            { label: 'Tingkat Penyelesaian', value: `${stats.tingkatPenyelesaian}%`, icon: 'trending_up', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', gradient: 'from-amber-500 to-amber-600' },
                        ].map((stat) => (
                            <div key={stat.label} className={`bg-white rounded-2xl p-5 border ${stat.border} shadow-sm hover:shadow-md transition-all duration-200 group`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}>
                                        <span className={`material-symbols-outlined text-2xl ${stat.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-slate-800 mb-1">{stat.value}</p>
                                <p className="text-sm text-slate-500">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Baris grafik */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                        {/* Grafik Tren Bulanan */}
                        <div className="xl:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="font-bold text-slate-800">Tren Tugas Bulanan</h2>
                                    <p className="text-xs text-slate-400 mt-0.5">6 bulan terakhir — {petugas?.dinas}</p>
                                </div>
                            </div>
                            <div className="flex items-end justify-between gap-3 h-40">
                                {chartBulanan.map((item) => {
                                    const maxVal = Math.max(...chartBulanan.map(b => b.val), 1);
                                    return (
                                        <div key={item.bulan} className="flex flex-col items-center gap-2 flex-1">
                                            <span className="text-xs font-bold text-slate-700">{item.val}</span>
                                            <div
                                                className={`w-full rounded-t-lg transition-all duration-500 ${item.active ? 'bg-gradient-to-t from-blue-500 to-indigo-400' : 'bg-slate-200 hover:bg-blue-300'}`}
                                                style={{ height: `${Math.max((item.val / maxVal) * 130, 8)}px` }}
                                            ></div>
                                            <span className={`text-xs ${item.active ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>{item.bulan}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Distribusi Status */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                            <h2 className="font-bold text-slate-800 mb-1">Distribusi Status</h2>
                            <p className="text-xs text-slate-400 mb-5">Berdasarkan status tugas</p>
                            <div className="space-y-4">
                                {statusDistribusi.map((item) => (
                                    <div key={item.label}>
                                        <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                                            <span className="font-medium flex items-center gap-2">
                                                <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
                                                {item.label}
                                            </span>
                                            <span className="font-bold">{item.count} ({item.pct}%)</span>
                                        </div>
                                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full ${item.color} rounded-full transition-all duration-700`} style={{ width: `${item.pct}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Mini donut visual */}
                            <div className="mt-6 flex items-center justify-center">
                                <div className="relative w-28 h-28">
                                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                                        {(() => {
                                            let offset = 0;
                                            const colors = ['#f59e0b', '#3b82f6', '#10b981'];
                                            return statusDistribusi.map((item, idx) => {
                                                const dashArray = (item.pct / 100) * 251.2;
                                                const dashOffset = -offset;
                                                offset += dashArray;
                                                return (
                                                    <circle
                                                        key={item.label}
                                                        cx="50" cy="50" r="40"
                                                        fill="none"
                                                        stroke={colors[idx]}
                                                        strokeWidth="12"
                                                        strokeDasharray={`${dashArray} ${251.2 - dashArray}`}
                                                        strokeDashoffset={dashOffset}
                                                        strokeLinecap="round"
                                                        className="transition-all duration-700"
                                                    />
                                                );
                                            });
                                        })()}
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-lg font-bold text-slate-800">{stats.tingkatPenyelesaian}%</span>
                                        <span className="text-[9px] text-slate-400">Selesai</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================== TAB 2: DAFTAR TUGAS ==================== */}
            {activeTab === 'tugas' && (
                <div className="space-y-5 animate-in fade-in duration-300">
                    {/* Filter Bar */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            {/* Search */}
                            <div className="relative flex-grow w-full sm:w-auto">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari tiket, judul, atau lokasi..."
                                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 transition-all"
                                />
                            </div>

                            {/* Filter Status */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-slate-400 font-semibold">Status:</span>
                                {['Semua', 'Menunggu', 'Diproses', 'Selesai'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setFilterStatus(s)}
                                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all
                                            ${filterStatus === s
                                                ? 'bg-blue-500 text-white shadow-sm'
                                                : 'text-slate-500 hover:bg-slate-100 border border-slate-200'
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>

                            {/* Filter Prioritas */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-slate-400 font-semibold">Prioritas:</span>
                                <select
                                    value={filterPrioritas}
                                    onChange={(e) => setFilterPrioritas(e.target.value)}
                                    className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-400 transition-colors bg-white"
                                >
                                    <option value="Semua">Semua</option>
                                    <option value="Tinggi">Tinggi</option>
                                    <option value="Sedang">Sedang</option>
                                    <option value="Rendah">Rendah</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Tabel Tugas */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div>
                                <h2 className="font-bold text-slate-800">Tugas Dinas — {petugas?.dinas}</h2>
                                <p className="text-xs text-slate-400 mt-0.5">Menampilkan {filteredTugas.length} dari {tugasList.length} tugas</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 text-left">
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">No. Tiket</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Judul</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Kategori</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Lokasi</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Tanggal</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Prioritas</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredTugas.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-12 text-center">
                                                <span className="material-symbols-outlined text-4xl text-slate-300 block mb-2">search_off</span>
                                                <p className="text-slate-400 text-sm">Tidak ada tugas yang sesuai filter</p>
                                            </td>
                                        </tr>
                                    ) : filteredTugas.map((tugas) => (
                                        <tr key={tugas.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs text-blue-600 font-semibold">{tugas.id}</td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-slate-800 max-w-[200px] truncate">{tugas.judul}</p>
                                            </td>
                                            <td className="px-6 py-4 hidden md:table-cell">
                                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium">{tugas.kategori}</span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 text-sm hidden lg:table-cell">{tugas.lokasi}</td>
                                            <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap hidden sm:table-cell">
                                                {new Date(tugas.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4"><PrioritasBadge prioritas={tugas.prioritas} /></td>
                                            <td className="px-6 py-4"><StatusBadge status={tugas.status} /></td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => openModal(tugas, 'detail')}
                                                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Lihat Detail"
                                                    >
                                                        <span className="material-symbols-outlined text-base">visibility</span>
                                                    </button>
                                                    <button
                                                        onClick={() => openModal(tugas, 'updateStatus')}
                                                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Update Status"
                                                    >
                                                        <span className="material-symbols-outlined text-base">edit</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination info */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                            <p className="text-xs text-slate-500">Menampilkan {filteredTugas.length} tugas</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================== MODAL DETAIL / UPDATE STATUS ==================== */}
            {modalTugas && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setModalTugas(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                            <div>
                                <h2 className="font-bold text-lg text-slate-800">
                                    {modalMode === 'detail' ? 'Detail Tugas' : 'Update Status Tugas'}
                                </h2>
                                <p className="text-xs text-blue-600 font-mono mt-0.5">{modalTugas.id}</p>
                            </div>
                            <button onClick={() => setModalTugas(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                            {/* Info Tugas */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-xs text-slate-400 mb-1">Judul Laporan</p>
                                    <p className="font-semibold text-slate-800">{modalTugas.judul}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 mb-1">Pelapor</p>
                                    <p className="font-semibold text-slate-800">{modalTugas.pelapor}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 mb-1">Kategori</p>
                                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium">{modalTugas.kategori}</span>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 mb-1">Lokasi</p>
                                    <p className="text-slate-700">{modalTugas.lokasi}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 mb-1">Prioritas</p>
                                    <PrioritasBadge prioritas={modalTugas.prioritas} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 mb-1">Tanggal Masuk</p>
                                    <p className="text-slate-700">{new Date(modalTugas.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>

                            {/* Deskripsi */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-xs text-slate-400 mb-1.5">Deskripsi Laporan</p>
                                <p className="text-sm text-slate-700 leading-relaxed">{modalTugas.deskripsi}</p>
                            </div>

                            {/* Status */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-400 mb-1">Status Saat Ini</p>
                                    <StatusBadge status={modalTugas.status} />
                                </div>
                            </div>

                            {/* Update Status Form */}
                            {modalMode === 'updateStatus' && (
                                <div>
                                    <label className="text-xs text-slate-500 font-semibold block mb-2">Ubah Status Menjadi</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Menunggu', 'Diproses', 'Selesai'].map((s) => (
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
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
                            <button
                                disabled={isSaving}
                                onClick={() => setModalTugas(null)}
                                className="px-5 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-white transition-colors font-semibold bg-transparent"
                            >
                                {modalMode === 'detail' ? 'Tutup' : 'Batal'}
                            </button>

                            {modalMode === 'updateStatus' && (
                                <button
                                    disabled={isSaving}
                                    onClick={handleUpdateStatus}
                                    className="px-5 py-2 text-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-400 hover:to-indigo-500 transition-all font-semibold flex items-center gap-2 disabled:opacity-50 shadow-md shadow-blue-500/15"
                                >
                                    {isSaving ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Menyimpan...
                                        </>
                                    ) : 'Simpan Perubahan'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ====== SUCCESS TOAST ====== */}
            {showToast && (
                <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl bg-emerald-50 border border-emerald-200 text-emerald-800 animate-in fade-in slide-in-from-top-3 duration-300">
                    <span className="material-symbols-outlined text-2xl flex-shrink-0 text-emerald-600">check_circle</span>
                    <p className="text-sm font-semibold">{toastMessage}</p>
                </div>
            )}
        </PetugasLayout>
    );
}
