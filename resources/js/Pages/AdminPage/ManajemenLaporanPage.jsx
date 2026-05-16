import React, { useEffect, useState } from 'react';
import AdminLayout from '../../Components/AdminLayout';

// Data dummy laporan lengkap
const DUMMY_LAPORAN = [
    { id: 'LPW-2024-001284', judul: 'Jalan Rusak di Jl. Solo', kategori: 'Infrastruktur', kecamatan: 'Gondokusuman', pelapor: 'Budi Santoso', tanggal: '16 Mei 2024', status: 'Menunggu', prioritas: 'Tinggi' },
    { id: 'LPW-2024-001283', judul: 'Sampah Menumpuk TPS Demangan', kategori: 'Kebersihan', kecamatan: 'Gondokusuman', pelapor: 'Siti Rahayu', tanggal: '16 Mei 2024', status: 'Diproses', prioritas: 'Sedang' },
    { id: 'LPW-2024-001282', judul: 'Lampu Jalan Mati di Jl. Veteran', kategori: 'Penerangan', kecamatan: 'Kraton', pelapor: 'Agus Wijaya', tanggal: '15 Mei 2024', status: 'Selesai', prioritas: 'Rendah' },
    { id: 'LPW-2024-001281', judul: 'Saluran Air Tersumbat', kategori: 'Sanitasi', kecamatan: 'Umbulharjo', pelapor: 'Dewi Kusuma', tanggal: '15 Mei 2024', status: 'Diproses', prioritas: 'Tinggi' },
    { id: 'LPW-2024-001280', judul: 'PKL Berdagang di Trotoar', kategori: 'Ketertiban', kecamatan: 'Gondomanan', pelapor: 'Hendra Putra', tanggal: '14 Mei 2024', status: 'Menunggu', prioritas: 'Sedang' },
    { id: 'LPW-2024-001279', judul: 'Pohon Tumbang Menghalangi Jalan', kategori: 'Lingkungan', kecamatan: 'Jetis', pelapor: 'Rina Marlina', tanggal: '14 Mei 2024', status: 'Selesai', prioritas: 'Tinggi' },
    { id: 'LPW-2024-001278', judul: 'Fasilitas Taman Rusak', kategori: 'Fasilitas Umum', kecamatan: 'Danurejan', pelapor: 'Doni Pratama', tanggal: '13 Mei 2024', status: 'Diproses', prioritas: 'Rendah' },
    { id: 'LPW-2024-001277', judul: 'Banjir di Gang Mawar', kategori: 'Sanitasi', kecamatan: 'Wirobrajan', pelapor: 'Yulia Sari', tanggal: '13 Mei 2024', status: 'Menunggu', prioritas: 'Tinggi' },
    { id: 'LPW-2024-001276', judul: 'Trotoar Berlubang Membahayakan', kategori: 'Infrastruktur', kecamatan: 'Mergangsan', pelapor: 'Bambang Eko', tanggal: '12 Mei 2024', status: 'Ditolak', prioritas: 'Sedang' },
    { id: 'LPW-2024-001275', judul: 'Kebisingan Pabrik Malam Hari', kategori: 'Ketertiban', kecamatan: 'Kotagede', pelapor: 'Sri Mulyati', tanggal: '12 Mei 2024', status: 'Diproses', prioritas: 'Sedang' },
];

const StatusBadge = ({ status }) => {
    const config = {
        'Menunggu': 'bg-yellow-100 text-yellow-700 border border-yellow-200',
        'Diproses': 'bg-blue-100 text-blue-700 border border-blue-200',
        'Selesai':  'bg-green-100 text-green-700 border border-green-200',
        'Ditolak':  'bg-red-100 text-red-700 border border-red-200',
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config[status] || 'bg-slate-100 text-slate-600'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
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
    return (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${config[prioritas] || ''}`}>
            {prioritas}
        </span>
    );
};

export default function ManajemenLaporanPage() {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('Semua');
    const [filterKategori, setFilterKategori] = useState('Semua');
    const [selectedIds, setSelectedIds] = useState([]);
    const [modalLaporan, setModalLaporan] = useState(null); // laporan yang dibuka detail/edit
    const [modalMode, setModalMode] = useState('detail');   // 'detail' | 'edit'
    const [editStatus, setEditStatus] = useState('');

    const statusList  = ['Semua', 'Menunggu', 'Diproses', 'Selesai', 'Ditolak'];
    const kategoriList = ['Semua', 'Infrastruktur', 'Kebersihan', 'Penerangan', 'Sanitasi', 'Ketertiban', 'Lingkungan', 'Fasilitas Umum'];

    // Filter & pencarian
    const filtered = DUMMY_LAPORAN.filter((l) => {
        const matchSearch   = l.judul.toLowerCase().includes(search.toLowerCase()) || l.id.includes(search) || l.pelapor.toLowerCase().includes(search.toLowerCase());
        const matchStatus   = filterStatus === 'Semua' || l.status === filterStatus;
        const matchKategori = filterKategori === 'Semua' || l.kategori === filterKategori;
        return matchSearch && matchStatus && matchKategori;
    });

    // Pilih semua / satu
    const toggleAll = () => setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map(l => l.id));
    const toggleOne = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

    // Buka modal
    const openModal = (laporan, mode = 'detail') => {
        setModalLaporan(laporan);
        setModalMode(mode);
        setEditStatus(laporan.status);
    };

    // Ringkasan per status
    const ringkasan = [
        { label: 'Total', value: DUMMY_LAPORAN.length, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: 'assignment' },
        { label: 'Menunggu', value: DUMMY_LAPORAN.filter(l => l.status === 'Menunggu').length, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100', icon: 'pending_actions' },
        { label: 'Diproses', value: DUMMY_LAPORAN.filter(l => l.status === 'Diproses').length, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', icon: 'engineering' },
        { label: 'Selesai', value: DUMMY_LAPORAN.filter(l => l.status === 'Selesai').length, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', icon: 'task_alt' },
    ];

    return (
        <AdminLayout pageTitle="Manajemen Laporan" pageSubtitle="Kelola seluruh laporan pengaduan warga">

            {/* Kartu Ringkasan */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {ringkasan.map((r) => (
                    <div key={r.label} className={`bg-white rounded-2xl p-4 border ${r.border} shadow-sm flex items-center gap-4`}>
                        <div className={`w-11 h-11 ${r.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <span className={`material-symbols-outlined text-2xl ${r.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{r.icon}</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{r.value}</p>
                            <p className="text-xs text-slate-500">{r.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabel Utama */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

                {/* Toolbar */}
                <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[180px]">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
                        <input
                            type="text"
                            placeholder="Cari ID, judul, atau pelapor..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
                        />
                    </div>

                    {/* Filter Status */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="text-sm border border-slate-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none focus:border-blue-400 bg-white"
                    >
                        {statusList.map(s => <option key={s}>{s}</option>)}
                    </select>

                    {/* Filter Kategori */}
                    <select
                        value={filterKategori}
                        onChange={(e) => setFilterKategori(e.target.value)}
                        className="text-sm border border-slate-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none focus:border-blue-400 bg-white"
                    >
                        {kategoriList.map(k => <option key={k}>{k}</option>)}
                    </select>

                    {/* Export */}
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors ml-auto">
                        <span className="material-symbols-outlined text-base">download</span>
                        Export CSV
                    </button>
                </div>

                {/* Bulk action bar */}
                {selectedIds.length > 0 && (
                    <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-4">
                        <span className="text-sm font-semibold text-blue-700">{selectedIds.length} laporan dipilih</span>
                        <button className="text-xs text-orange-600 hover:underline font-semibold">Tandai Diproses</button>
                        <button className="text-xs text-green-600 hover:underline font-semibold">Tandai Selesai</button>
                        <button className="text-xs text-red-500 hover:underline font-semibold">Hapus Terpilih</button>
                        <button onClick={() => setSelectedIds([])} className="ml-auto text-xs text-slate-500 hover:underline">Batalkan Pilihan</button>
                    </div>
                )}

                {/* Tabel */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 text-left">
                                <th className="px-4 py-3">
                                    <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="rounded" />
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">No. Tiket</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Judul Laporan</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Kategori</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Kecamatan</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Pelapor</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Tanggal</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Prioritas</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="text-center py-16 text-slate-400">
                                        <span className="material-symbols-outlined text-4xl block mb-2">search_off</span>
                                        Tidak ada laporan ditemukan
                                    </td>
                                </tr>
                            ) : filtered.map((laporan) => (
                                <tr key={laporan.id} className={`hover:bg-slate-50 transition-colors ${selectedIds.includes(laporan.id) ? 'bg-blue-50/50' : ''}`}>
                                    <td className="px-4 py-3">
                                        <input type="checkbox" checked={selectedIds.includes(laporan.id)} onChange={() => toggleOne(laporan.id)} className="rounded" />
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-blue-600 font-semibold whitespace-nowrap">{laporan.id}</td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-slate-800 max-w-[180px] truncate">{laporan.judul}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium whitespace-nowrap">{laporan.kategori}</span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">{laporan.kecamatan}</td>
                                    <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">{laporan.pelapor}</td>
                                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{laporan.tanggal}</td>
                                    <td className="px-4 py-3"><PrioritasBadge prioritas={laporan.prioritas} /></td>
                                    <td className="px-4 py-3"><StatusBadge status={laporan.status} /></td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => openModal(laporan, 'detail')} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Lihat Detail">
                                                <span className="material-symbols-outlined text-base">visibility</span>
                                            </button>
                                            <button onClick={() => openModal(laporan, 'edit')} className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Update Status">
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
                    <p className="text-xs text-slate-500">Menampilkan {filtered.length} dari {DUMMY_LAPORAN.length} laporan</p>
                    <div className="flex gap-1">
                        <button className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">Sebelumnya</button>
                        {[1, 2, 3].map((n) => (
                            <button key={n} className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${n === 1 ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>{n}</button>
                        ))}
                        <button className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">Berikutnya</button>
                    </div>
                </div>
            </div>

            {/* ======== MODAL DETAIL / EDIT ======== */}
            {modalLaporan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setModalLaporan(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>

                        {/* Header Modal */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                            <div>
                                <h2 className="font-bold text-slate-800 text-lg">
                                    {modalMode === 'detail' ? 'Detail Laporan' : 'Update Status Laporan'}
                                </h2>
                                <p className="text-xs text-slate-400 font-mono mt-0.5">{modalLaporan.id}</p>
                            </div>
                            <button onClick={() => setModalLaporan(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Body Modal */}
                        <div className="px-6 py-5 space-y-4">
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
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-xs text-slate-400 mb-2">Status Saat Ini</p>
                                <StatusBadge status={modalLaporan.status} />
                            </div>

                            {/* Edit Mode: Ubah status */}
                            {modalMode === 'edit' && (
                                <div>
                                    <label className="text-xs text-slate-500 font-semibold block mb-2">Ubah Status Menjadi</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Menunggu', 'Diproses', 'Selesai', 'Ditolak'].map((s) => (
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

                        {/* Footer Modal */}
                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                            <button onClick={() => setModalLaporan(null)} className="px-5 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-semibold">
                                {modalMode === 'detail' ? 'Tutup' : 'Batal'}
                            </button>
                            {modalMode === 'edit' && (
                                <button
                                    onClick={() => setModalLaporan(null)}
                                    className="px-5 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                                >
                                    Simpan Perubahan
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </AdminLayout>
    );
}
