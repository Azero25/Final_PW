import React, { useEffect, useState } from 'react';
import AdminLayout from '../../Components/AdminLayout';
import api from '../../axios';
import { Link } from 'react-router-dom';

const StatusBadge = ({ status }) => {
    const config = {
        'Laporan Diterima': 'bg-slate-100 text-slate-700 border border-slate-200',
        'Verifikasi': 'bg-yellow-100 text-yellow-700 border border-yellow-200',
        'Sedang Diproses': 'bg-blue-100 text-blue-700 border border-blue-200',
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
    const [laporan, setLaporan] = useState(() => {
        const stored = localStorage.getItem('laporwarga_cache_laporan');
        return stored ? JSON.parse(stored) : [];
    });
    const [isLoading, setIsLoading] = useState(() => {
        const stored = localStorage.getItem('laporwarga_cache_laporan');
        return !stored;
    });

    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('Semua');
    const [filterKategori, setFilterKategori] = useState('Semua');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedIds, setSelectedIds] = useState([]);
    const [modalLaporan, setModalLaporan] = useState(null);
    const [modalMode, setModalMode] = useState('detail');
    const [editStatus, setEditStatus] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [lightboxImg, setLightboxImg] = useState(null);
    const [eligiblePetugas, setEligiblePetugas] = useState([]);
    const [selectedPetugasId, setSelectedPetugasId] = useState('');

    const getImageUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:image')) {
            return path;
        }
        if (path.startsWith('/storage')) {
            const baseUrl = window.location.origin.includes('5173') ? 'http://127.0.0.1:8000' : '';
            return `${baseUrl}${path}`;
        }
        return path;
    };

    const statusList  = ['Semua', 'Laporan Diterima', 'Verifikasi', 'Sedang Diproses', 'Selesai', 'Ditolak'];
    const kategoriList = ['Semua', 'Infrastruktur', 'Kebersihan', 'Penerangan', 'Sanitasi', 'Ketertiban', 'Lingkungan', 'Fasilitas Umum', 'Lainnya'];

    const fetchData = async () => {
        const hasCache = !!localStorage.getItem('laporwarga_cache_laporan');
        if (!hasCache) setIsLoading(true);
        try {
            const response = await api.get('/api/pengaduans');
            const data = response.data;

            // Format data aman: Simpan primary key murni di properti 'id'
            const formattedData = data.map(item => ({
                id: item.id,
                nomor_tiket: item.nomor_tiket,
                judul: item.judul,
                kategori: item.kategori,
                kecamatan: item.kecamatan || item.lokasi,
                pelapor: item.anonim ? 'Anonim' : (item.nama || 'Warga'),
                tanggal: new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                status: item.status,
                prioritas: item.urgensi === 'tinggi' ? 'Tinggi' : (item.urgensi === 'sedang' ? 'Sedang' : 'Rendah'),
                bukti_foto: item.bukti_foto,
                gambar: Array.isArray(item.gambar) ? item.gambar : (item.gambar ? [item.gambar] : []),
                deskripsi: item.deskripsi || '',
                id_petugas: item.id_petugas ? Number(item.id_petugas) : '',
                nama_petugas: item.nama_petugas,
                id_dinas: item.id_dinas,
                nama_dinas: item.nama_dinas
            }));
            setLaporan(formattedData);
            localStorage.setItem('laporwarga_cache_laporan', JSON.stringify(formattedData));
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

    const filtered = laporan.filter((l) => {
        const matchSearch   = l.judul.toLowerCase().includes(search.toLowerCase()) ||
                              l.nomor_tiket.toLowerCase().includes(search.toLowerCase()) ||
                              l.pelapor.toLowerCase().includes(search.toLowerCase());
        const matchStatus   = filterStatus === 'Semua' || l.status === filterStatus;
        const matchKategori = filterKategori === 'Semua' || l.kategori === filterKategori;
        return matchSearch && matchStatus && matchKategori;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const activePage = Math.max(1, Math.min(currentPage, totalPages || 1));

    const toggleAll = () => setSelectedIds(selectedIds.length === filtered.length && filtered.length > 0 ? [] : filtered.map(l => l.id));
    const toggleOne = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

    const openModal = async (laporanItem, mode = 'detail') => {
        setModalLaporan(laporanItem);
        setModalMode(mode);
        setEditStatus(laporanItem.status);

        // Amankan tipe data string id petugas agar ter-select otomatis di dropdown form edit
        setSelectedPetugasId('');

        if (mode === 'edit' || mode === 'detail') {
            try {
                const response = await api.get(`/api/pengaduans/${laporanItem.id}/petugas-eligible`);
                setEligiblePetugas(response.data || []);
                if(laporanItem.id_petugas) {
                    setSelectedPetugasId(String(laporanItem.id_petugas));
                }
            } catch (err) {
                console.error("Gagal memuat petugas yang eligible", err);
                setEligiblePetugas([]);
            }
        }
    };

    const openBulkDeleteModal = () => {
        setModalLaporan({ id: 'BULK', judul: `${selectedIds.length} Laporan Terpilih` });
        setModalMode('bulkDelete');
    };

    const handleSaveStatus = async () => {
        if (!modalLaporan) return;
        setIsSaving(true);
        try {
            let statusUpdatedByAssign = false;

            // 1. Update petugas jika berubah
            if (selectedPetugasId !== (modalLaporan.id_petugas ? String(modalLaporan.id_petugas) : '')) {
                if (selectedPetugasId) {
                    await api.post(`/api/pengaduans/${modalLaporan.id}/assign`, { id_petugas: selectedPetugasId });
                    statusUpdatedByAssign = true;
                }
            }

            // 2. Update status jika berubah menggunakan database ID asli murni
            if (editStatus !== modalLaporan.status || (statusUpdatedByAssign && editStatus !== 'Sedang Diproses')) {
                await api.put(`/api/pengaduans/${modalLaporan.id}`, { status: editStatus });
            }

            await fetchData();
            setModalLaporan(null);
        } catch (error) {
            alert('Gagal menyimpan perubahan laporan.');
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
            await fetchData();
            setModalLaporan(null);
            setSelectedIds(prev => prev.filter(id => id !== modalLaporan.id));
        } catch (error) {
            alert('Gagal menghapus laporan.');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleBulkStatus = async (status) => {
        setIsSaving(true);
        try {
            for (const id of selectedIds) {
                await api.put(`/api/pengaduans/${id}`, { status });
            }
            await fetchData();
            setSelectedIds([]);
            alert(`Status ${selectedIds.length} laporan terpilih berhasil diperbarui!`);
        } catch (error) {
            console.error('Error bulk updating status:', error);
            alert('Gagal memperbarui status beberapa laporan.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleBulkDeleteConfirm = async () => {
        setIsSaving(true);
        try {
            for (const id of selectedIds) {
                await api.delete(`/api/pengaduans/${id}`);
            }
            await fetchData();
            setSelectedIds([]);
            setModalLaporan(null);
            alert(`Sebanyak ${selectedIds.length} laporan terpilih berhasil dihapus!`);
        } catch (error) {
            console.error('Error bulk deleting reports:', error);
            alert('Gagal menghapus beberapa laporan terpilih.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleExportCSV = () => {
        if (filtered.length === 0) {
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
            ...filtered.map(row => {
                const values = [
                    row.nomor_tiket,
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
        link.setAttribute('download', `laporan_pengaduan_${dateStr}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const ringkasan = [
        { label: 'Total Laporan', value: laporan.length, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: 'assignment' },
        { label: 'Menunggu / Verifikasi', value: laporan.filter(l => l.status === 'Laporan Diterima' || l.status === 'Verifikasi').length, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100', icon: 'pending_actions' },
        { label: 'Diproses', value: laporan.filter(l => l.status === 'Sedang Diproses').length, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', icon: 'engineering' },
        { label: 'Selesai', value: laporan.filter(l => l.status === 'Selesai').length, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', icon: 'task_alt' },
    ];

    return (
        <>
            <AdminLayout pageTitle="Manajemen Laporan" pageSubtitle="Kelola seluruh laporan pengaduan warga">

                {/* Kartu Ringkasan */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                    {ringkasan.map((r) => (
                        <div key={r.label} className={`bg-white rounded-2xl p-4 border ${r.border} shadow-sm flex items-center gap-4`}>
                            <div className={`w-11 h-11 ${r.bg} rounded-xl flex items-center justify-center shrink-0`}>
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
                        <div className="relative flex-1 min-w-45">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
                            <input
                                type="text"
                                placeholder="Cari ID, judul, atau pelapor..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
                            />
                        </div>

                        <select
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="text-sm border border-slate-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none focus:border-blue-400 bg-white"
                        >
                            {statusList.map(s => <option key={s}>{s}</option>)}
                        </select>

                        <select
                            value={filterKategori}
                            onChange={(e) => {
                                setFilterKategori(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="text-sm border border-slate-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none focus:border-blue-400 bg-white"
                        >
                            {kategoriList.map(k => <option key={k}>{k}</option>)}
                        </select>

                        <button 
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors ml-auto"
                        >
                            <span className="material-symbols-outlined text-base">download</span>
                            Export CSV
                        </button>
                    </div>

                    {/* Bulk action bar */}
                    {selectedIds.length > 0 && (
                        <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-4 flex-wrap">
                            <span className="text-sm font-semibold text-blue-700">{selectedIds.length} laporan terpilih</span>

                            <button
                                disabled={isSaving}
                                onClick={() => handleBulkStatus('Sedang Diproses')}
                                className="text-xs text-orange-600 hover:underline font-semibold flex items-center gap-1 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-sm">engineering</span>
                                Tandai Diproses
                            </button>

                            <button
                                disabled={isSaving}
                                onClick={() => handleBulkStatus('Selesai')}
                                className="text-xs text-green-600 hover:underline font-semibold flex items-center gap-1 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-sm">task_alt</span>
                                Tandai Selesai
                            </button>

                            <button
                                disabled={isSaving}
                                onClick={openBulkDeleteModal}
                                className="text-xs text-red-500 hover:underline font-semibold flex items-center gap-1 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-sm">delete</span>
                                Hapus Terpilih
                            </button>

                            <button onClick={() => setSelectedIds([])} className="ml-auto text-xs text-slate-500 hover:underline">Batalkan Pilihan</button>
                        </div>
                    )}

                    {/* Tabel */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-250 text-sm">
                            <thead>
                                <tr className="bg-slate-50 text-left">
                                    <th className="px-4 py-3">
                                        <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="rounded" />
                                    </th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">No. Tiket</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Judul Laporan</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Kategori</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Lokasi Laporan</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Pelapor</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Tanggal</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Prioritas</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={10} className="text-center py-16 text-slate-400">
                                            <div className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>Memuat data laporan...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="text-center py-16 text-slate-400">
                                            <span className="material-symbols-outlined text-4xl block mb-2">search_off</span>
                                            Tidak ada laporan ditemukan
                                        </td>
                                    </tr>
                                ) : filtered.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage).map((laporanItem) => (
                                    <tr key={laporanItem.id} className={`hover:bg-slate-50 transition-colors ${selectedIds.includes(laporanItem.id) ? 'bg-blue-50/50' : ''}`}>
                                        <td className="px-4 py-3">
                                            <input type="checkbox" checked={selectedIds.includes(laporanItem.id)} onChange={() => toggleOne(laporanItem.id)} className="rounded" />
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-blue-600 font-semibold whitespace-nowrap">{laporanItem.nomor_tiket}</td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-slate-800 max-w-45 truncate">{laporanItem.judul}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium whitespace-nowrap">{laporanItem.kategori}</span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">{laporanItem.kecamatan}</td>
                                        <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">{laporanItem.pelapor}</td>
                                        <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{laporanItem.tanggal}</td>
                                        <td className="px-4 py-3"><PrioritasBadge prioritas={laporanItem.prioritas} /></td>
                                        <td className="px-4 py-3"><StatusBadge status={laporanItem.status} /></td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => openModal(laporanItem, 'detail')} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Lihat Detail">
                                                    <span className="material-symbols-outlined text-base">visibility</span>
                                                </button>
                                                <button onClick={() => openModal(laporanItem, 'edit')} className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Update Status">
                                                    <span className="material-symbols-outlined text-base">edit</span>
                                                </button>
                                                <button onClick={() => openModal(laporanItem, 'delete')} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
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
                    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-100 gap-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs text-slate-500 font-medium">Tampilkan</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-blue-400 text-slate-600 font-semibold"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                                <span className="text-xs text-slate-500 font-medium">data</span>
                            </div>
                            <p className="text-xs text-slate-500">
                                Menampilkan {filtered.length > 0 ? (activePage - 1) * itemsPerPage + 1 : 0} - {Math.min(activePage * itemsPerPage, filtered.length)} dari {filtered.length} laporan
                            </p>
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={activePage === 1}
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
                                                activePage === pageNum
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-slate-500 hover:bg-slate-100'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    ));
                                }

                                const range = [1];
                                if (activePage > 2) range.push('...');
                                if (activePage > 1 && activePage < totalPages) range.push(activePage);
                                if (activePage < totalPages - 1) range.push('...');
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
                                                activePage === item
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
                                disabled={activePage === totalPages || totalPages === 0}
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
                        <div className={`bg-white rounded-2xl shadow-2xl w-full ${modalMode === 'delete' || modalMode === 'bulkDelete' ? 'max-w-md' : 'max-w-lg'} animate-in fade-in zoom-in-95 duration-200`} onClick={(e) => e.stopPropagation()}>

                            {/* Header Modal */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                                <div>
                                    <h2 className={`font-bold text-lg ${modalMode === 'delete' || modalMode === 'bulkDelete' ? 'text-red-600' : 'text-slate-800'}`}>
                                        {modalMode === 'detail' ? 'Detail Laporan'
                                            : modalMode === 'edit' ? 'Update Status Laporan'
                                            : modalMode === 'bulkDelete' ? 'Konfirmasi Hapus Massal'
                                            : 'Konfirmasi Hapus Laporan'}
                                    </h2>
                                    {modalMode !== 'bulkDelete' && modalLaporan.nomor_tiket && (
                                        <p className="text-xs text-slate-400 font-mono mt-0.5">{modalLaporan.nomor_tiket}</p>
                                    )}
                                    {modalMode === 'bulkDelete' && (
                                        <p className="text-xs text-blue-600 font-semibold mt-0.5">{selectedIds.length} Laporan Terpilih</p>
                                    )}
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
                                ) : modalMode === 'bulkDelete' ? (
                                    <div className="text-center space-y-3">
                                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <span className="material-symbols-outlined text-3xl">warning</span>
                                        </div>
                                        <p className="text-slate-700">Apakah Anda yakin ingin menghapus <strong>{selectedIds.length} laporan terpilih</strong>?</p>

                                        <div className="max-h-28 overflow-y-auto border border-slate-100 rounded-xl p-3 bg-slate-50 flex flex-wrap gap-1.5 text-left">
                                            {selectedIds.map(id => {
                                                const l = laporan.find(x => x.id === id);
                                                return l ? (
                                                    <span key={id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-sm">
                                                        {l.judul}
                                                    </span>
                                                ) : null;
                                            })}
                                        </div>
                                        <p className="text-sm text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
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
                                            <div>
                                                <p className="text-xs text-slate-400 mb-1">Dinas Terkait</p>
                                                <p className="font-semibold text-slate-800">{modalLaporan.nama_dinas || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 mb-1">Petugas Ditugaskan</p>
                                                <p className="font-semibold text-slate-800">{modalLaporan.nama_petugas || '-'}</p>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-slate-400 mb-1">Status Saat Ini</p>
                                                <StatusBadge status={modalLaporan.status} />
                                            </div>
                                            {modalMode === 'detail' && (
                                                <Link to={`/lacak?tiket=${modalLaporan.nomor_tiket}`} className="text-sm text-blue-600 hover:underline font-semibold flex items-center gap-1">
                                                    Lihat Lacak Penuh <span className="material-symbols-outlined text-sm">open_in_new</span>
                                                </Link>
                                            )}
                                        </div>

                                        {modalMode === 'detail' && (() => {
                                            const imgs = Array.from(new Set([
                                                ...(modalLaporan.gambar && Array.isArray(modalLaporan.gambar) ? modalLaporan.gambar : []),
                                                ...(modalLaporan.bukti_foto ? [modalLaporan.bukti_foto] : [])
                                            ])).filter(Boolean);

                                            if (imgs.length === 0) return null;

                                            return (
                                                <div className="pt-2">
                                                    <p className="text-xs text-slate-400 mb-2 flex items-center gap-1.5 font-semibold uppercase tracking-wide">
                                                        <span className="material-symbols-outlined text-sm">photo_library</span>
                                                        Bukti Lampiran Foto
                                                    </p>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {imgs.map((src, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="relative group rounded-lg overflow-hidden border border-slate-200 shadow-sm cursor-zoom-in aspect-square"
                                                                onClick={() => setLightboxImg(getImageUrl(src))}
                                                            >
                                                                <img src={getImageUrl(src)} alt={`Bukti ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {modalMode === 'detail' && modalLaporan.foto_selesai_list && modalLaporan.foto_selesai_list.length > 0 && (
                                            <div className="pt-2">
                                                <p className="text-xs text-emerald-800 mb-2 flex items-center gap-1.5 font-semibold uppercase tracking-wide">
                                                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                                                    Bukti Foto Penyelesaian (Dari Petugas)
                                                    <span className="ml-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{modalLaporan.foto_selesai_list.length} foto</span>
                                                </p>
                                                <div className={`grid gap-2 ${
                                                    modalLaporan.foto_selesai_list.length === 1 ? 'grid-cols-1 max-w-xs' :
                                                    modalLaporan.foto_selesai_list.length === 2 ? 'grid-cols-2' :
                                                    'grid-cols-2 sm:grid-cols-3'
                                                }`}>
                                                    {modalLaporan.foto_selesai_list.map((src, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="relative group rounded-lg overflow-hidden border border-emerald-200 shadow-sm cursor-zoom-in aspect-square bg-emerald-50/10"
                                                            onClick={() => setLightboxImg(getImageUrl(src))}
                                                        >
                                                            <img src={getImageUrl(src)} alt={`Bukti Penyelesaian ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {modalMode === 'edit' && (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-xs text-slate-500 font-semibold block mb-2">Ubah Status Menjadi</label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {['Laporan Diterima', 'Verifikasi', 'Sedang Diproses', 'Selesai', 'Ditolak'].map((s) => (
                                                            <button
                                                                type="button"
                                                                key={s}
                                                                onClick={() => setEditStatus(s)}
                                                                className={`py-2 px-3 rounded-xl text-xs font-semibold border-2 transition-all
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

                                                <div className="border-t border-slate-100 pt-3">
                                                    <label className="text-xs text-slate-500 font-semibold block mb-1.5 flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm font-bold">badge</span>
                                                        Tugaskan Petugas ({modalLaporan.nama_dinas || 'Dinas Terkait'})
                                                    </label>
                                                    {eligiblePetugas.length === 0 ? (
                                                        <p className="text-xs text-slate-400 italic">Tidak ada petugas yang tersedia untuk dinas ini.</p>
                                                    ) : (
                                                        <select
                                                            value={selectedPetugasId}
                                                            onChange={(e) => setSelectedPetugasId(e.target.value)}
                                                            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 bg-white focus:outline-none focus:border-blue-400"
                                                        >
                                                            <option value="">-- Pilih Petugas --</option>
                                                            {eligiblePetugas.map(p => {
                                                                const pId = p.id_petugas !== undefined && p.id_petugas !== null ? p.id_petugas : p.id;
                                                                const pNama = p.nama_petugas ?? p.nama;
                                                                const pNip = p.NIP ?? p.nip ?? '-';
                                                                return (
                                                                    <option key={pId} value={String(pId)}>
                                                                        {pNama} (NIP: {pNip})
                                                                    </option>
                                                                );
                                                            })}
                                                        </select>
                                                    )}
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
                                        className="px-5 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
                                    >
                                        {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </button>
                                )}

                                {modalMode === 'delete' && (
                                    <button
                                        disabled={isSaving}
                                        onClick={handleDelete}
                                        className="px-5 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold"
                                    >
                                        {isSaving ? 'Menghapus...' : 'Ya, Hapus Laporan'}
                                    </button>
                                )}

                                {modalMode === 'bulkDelete' && (
                                    <button
                                        disabled={isSaving}
                                        onClick={handleBulkDeleteConfirm}
                                        className="px-5 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold"
                                    >
                                        {isSaving ? 'Menghapus...' : `Ya, Hapus ${selectedIds.length} Laporan`}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </AdminLayout>

            {/* Lightbox Modal */}
            {lightboxImg && (
                <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4" onClick={() => setLightboxImg(null)}>
                    <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
                        <img src={lightboxImg} alt="Bukti Lampiran" className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
                        <button onClick={() => setLightboxImg(null)} className="absolute top-3 right-3 w-10 h-10 bg-white/20 text-white rounded-full flex items-center justify-center"><span className="material-symbols-outlined">close</span></button>
                    </div>
                </div>
            )}
        </>
    );
}
