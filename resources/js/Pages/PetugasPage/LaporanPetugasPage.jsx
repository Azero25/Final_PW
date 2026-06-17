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
        deskripsi: laporan.deskripsi,
        gambar: laporan.gambar || []
    };
};

/**
 * Halaman Daftar Laporan Petugas
 * Menampilkan tabel laporan lengkap milik dinas petugas,
 * lengkap dengan pencarian, pemfilteran, modal detail, dan pembaruan status.
 */
export default function LaporanPetugasPage() {
    const [petugas, setPetugas] = useState(null);
    const [tugasList, setTugasList] = useState([]);

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

    // Ambil data petugas dari session
    useEffect(() => {
        const sesi = sessionStorage.getItem('petugas');
        if (sesi) setPetugas(JSON.parse(sesi));
    }, []);

    const fetchLaporan = async () => {
        if (!petugas) return;
        try {
            const response = await api.get('/api/pengaduans');
            const filtered = response.data
                .filter(l => l.id_petugas === petugas.original_id)
                .map(formatLaporanToTugas);
            setTugasList(filtered);
        } catch (error) {
            console.error("Error fetching reports:", error);
        }
    };

    // Ambil data tugas berdasarkan dinas petugas yang login
    useEffect(() => {
        if (petugas) {
            fetchLaporan();
        }
    }, [petugas]);

    // Memfilter tugas berdasarkan kriteria input user
    const filteredTugas = useMemo(() => {
        return tugasList.filter(t => {
            const matchStatus = filterStatus === 'Semua' || t.status === filterStatus;
            const matchPrioritas = filterPrioritas === 'Semua' || t.prioritas === filterPrioritas;
            const matchSearch = !searchQuery ||
                t.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.pelapor.toLowerCase().includes(searchQuery.toLowerCase());
            return matchStatus && matchPrioritas && matchSearch;
        });
    }, [tugasList, filterStatus, filterPrioritas, searchQuery]);

    // Buka Modal Detail / Edit Status
    const openModal = (tugas, mode = 'detail') => {
        setModalTugas(tugas);
        setModalMode(mode);
        setEditStatus(tugas.status);
    };

    // Eksekusi pembaruan status laporan
    const handleUpdateStatus = async () => {
        if (!modalTugas || editStatus === modalTugas.status) {
            setModalTugas(null);
            return;
        }
        setIsSaving(true);

        try {
            const backendStatus = mapStatusToBackend(editStatus);
            await api.put(`/api/pengaduans/${modalTugas.id}`, { status: backendStatus });

            // Refetch data agar terupdate secara real-time
            await fetchLaporan();

            setToastMessage(`Status laporan ${modalTugas.id} berhasil diubah menjadi "${editStatus}"`);
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

    return (
        <PetugasLayout
            pageTitle="Daftar Laporan Masuk"
            pageSubtitle={petugas ? `Kelola laporan masyarakat untuk ${petugas.dinas}` : ''}
        >
            <div className="space-y-6 animate-in fade-in duration-300">
                {/* Panel Utama Filter & Pencarian */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6">
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                        {/* Search Input */}
                        <div className="relative flex-1 min-w-70">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari nomor tiket, pelapor, judul, lokasi..."
                                className="w-full pl-11 pr-4 py-3 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                            />
                        </div>

                        {/* Status Filter Tab-like buttons */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mr-1">Status:</span>
                            {['Semua', 'Menunggu', 'Diproses', 'Selesai'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setFilterStatus(s)}
                                    className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all
                                        ${filterStatus === s
                                            ? 'bg-linear-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/15'
                                            : 'text-slate-600 hover:bg-slate-50 border border-slate-200/80 bg-white'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        {/* Priority Selector */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Prioritas:</span>
                            <select
                                value={filterPrioritas}
                                onChange={(e) => setFilterPrioritas(e.target.value)}
                                className="text-xs border border-slate-200/80 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-400 font-bold text-slate-700 bg-white transition-colors cursor-pointer"
                            >
                                <option value="Semua">Semua Prioritas</option>
                                <option value="Tinggi">Tinggi</option>
                                <option value="Sedang">Sedang</option>
                                <option value="Rendah">Rendah</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-50/30">
                        <div>
                            <h2 className="font-bold text-slate-800 text-base">Laporan Bidang Dinas</h2>
                            <p className="text-xs text-slate-400 mt-0.5">Ditemukan {filteredTugas.length} laporan dari total {tugasList.length} laporan masuk</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">No. Tiket</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Pelapor</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Judul Laporan</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider hidden md:table-cell">Kategori</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider hidden lg:table-cell">Lokasi</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider hidden sm:table-cell">Tanggal Masuk</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Prioritas</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {filteredTugas.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-16 text-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <span className="material-symbols-outlined text-3xl text-slate-300">search_off</span>
                                            </div>
                                            <p className="text-slate-400 text-sm font-semibold">Tidak menemukan data laporan yang cocok</p>
                                            <p className="text-slate-300 text-xs mt-1">Coba gunakan filter status lain atau kata kunci pencarian yang berbeda</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTugas.map((tugas) => (
                                        <tr key={tugas.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs text-blue-600 font-bold">{tugas.id}</td>
                                            <td className="px-6 py-4 font-medium text-slate-800">{tugas.pelapor}</td>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-slate-800 max-w-50 truncate" title={tugas.judul}>{tugas.judul}</p>
                                            </td>
                                            <td className="px-6 py-4 hidden md:table-cell">
                                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg font-medium">{tugas.kategori}</span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 hidden lg:table-cell max-w-37.5 truncate" title={tugas.lokasi}>{tugas.lokasi}</td>
                                            <td className="px-6 py-4 text-slate-400 text-xs whitespace-nowrap hidden sm:table-cell">
                                                {new Date(tugas.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4"><PrioritasBadge prioritas={tugas.prioritas} /></td>
                                            <td className="px-6 py-4"><StatusBadge status={tugas.status} /></td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => openModal(tugas, 'detail')}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                        title="Lihat Detail Laporan"
                                                    >
                                                        <span className="material-symbols-outlined text-base block">visibility</span>
                                                    </button>
                                                    <button
                                                        onClick={() => openModal(tugas, 'updateStatus')}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                        title="Perbarui Status Laporan"
                                                    >
                                                        <span className="material-symbols-outlined text-base block">edit</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination / Table Footer */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-50 bg-slate-50/20 text-xs text-slate-500 font-medium">
                        <span>Menampilkan {filteredTugas.length} baris data laporan</span>
                        <div className="flex items-center gap-1">
                            <span className="text-slate-400">Dinas Terkait:</span>
                            <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md">{petugas?.dinas || 'Loading...'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ====== MODAL DETAIL / UPDATE STATUS ====== */}
            {modalTugas && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalTugas(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/40">
                            <div>
                                <h3 className="font-bold text-base text-slate-800">
                                    {modalMode === 'detail' ? 'Detail Informasi Laporan' : 'Ubah Status Penyelesaian Laporan'}
                                </h3>
                                <p className="text-xs text-blue-600 font-mono mt-0.5 font-bold">{modalTugas.id}</p>
                            </div>
                            <button onClick={() => setModalTugas(null)} className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto">
                            {/* Grid Detail */}
                            <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-sm">
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Judul Laporan</p>
                                    <p className="font-semibold text-slate-800 leading-tight">{modalTugas.judul}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Nama Pelapor</p>
                                    <p className="font-semibold text-slate-800 leading-tight">{modalTugas.pelapor}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Kategori / Bidang</p>
                                    <span className="inline-block text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold mt-0.5">{modalTugas.kategori}</span>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Lokasi Kejadian</p>
                                    <p className="text-slate-700 font-medium">{modalTugas.lokasi}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Tingkat Prioritas</p>
                                    <div className="mt-0.5"><PrioritasBadge prioritas={modalTugas.prioritas} /></div>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Tanggal Masuk</p>
                                    <p className="text-slate-700 font-medium">
                                        {new Date(modalTugas.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>

                            {/* Deskripsi Pengaduan */}
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1.5">Deskripsi Lengkap Laporan</p>
                                <p className="text-sm text-slate-700 leading-relaxed font-medium">{modalTugas.deskripsi}</p>
                            </div>

                            {/* Bukti Foto Laporan */}
                            {modalTugas.gambar && modalTugas.gambar.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Bukti Foto Kejadian</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {modalTugas.gambar.map((imgUrl, idx) => (
                                            <a
                                                key={idx}
                                                href={imgUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group relative block aspect-video bg-slate-100 rounded-2xl overflow-hidden border border-slate-200/80 hover:shadow-lg transition-all duration-300"
                                            >
                                                <img
                                                    src={imgUrl}
                                                    alt={`Bukti ${idx + 1}`}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-white text-xl">open_in_new</span>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Status Saat Ini */}
                            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Status Laporan Saat Ini</p>
                                    <StatusBadge status={modalTugas.status} />
                                </div>
                            </div>

                            {/* Form Pilihan Status */}
                            {modalMode === 'updateStatus' && (
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Ubah Status Laporan Menjadi</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Menunggu', 'Diproses', 'Selesai'].map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => setEditStatus(s)}
                                                className={`py-3 rounded-2xl text-sm font-bold border-2 transition-all
                                                    ${editStatus === s
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                                                        : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200'
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
                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/30">
                            <button
                                disabled={isSaving}
                                onClick={() => setModalTugas(null)}
                                className="px-5 py-2.5 text-sm text-slate-500 border border-slate-200 hover:border-slate-300 rounded-xl hover:bg-white transition-colors font-bold bg-transparent"
                            >
                                {modalMode === 'detail' ? 'Tutup' : 'Batal'}
                            </button>

                            {modalMode === 'updateStatus' && (
                                <button
                                    disabled={isSaving}
                                    onClick={handleUpdateStatus}
                                    className="px-5 py-2.5 text-sm bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-400 hover:to-indigo-500 transition-all font-bold flex items-center gap-2 disabled:opacity-50 shadow-md shadow-blue-500/15"
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
                <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl bg-emerald-50 border border-emerald-100 text-emerald-800 animate-in fade-in slide-in-from-top-3 duration-300">
                    <span className="material-symbols-outlined text-2xl shrink-0 text-emerald-600">check_circle</span>
                    <p className="text-sm font-semibold">{toastMessage}</p>
                </div>
            )}
        </PetugasLayout>
    );
}
