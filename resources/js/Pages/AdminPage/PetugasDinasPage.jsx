import React, { useEffect, useState } from 'react';
import AdminLayout from '../../Components/AdminLayout';

const DUMMY_DINAS = [
    { id: 'DNS-001', nama: 'Dinas Pekerjaan Umum', singkatan: 'DPU', kategori: 'Infrastruktur', totalPetugas: 8, totalLaporan: 145, color: 'bg-blue-500' },
    { id: 'DNS-002', nama: 'Dinas Lingkungan Hidup', singkatan: 'DLH', kategori: 'Kebersihan & Lingkungan', totalPetugas: 6, totalLaporan: 98, color: 'bg-green-500' },
    { id: 'DNS-003', nama: 'Dinas Perhubungan', singkatan: 'DISHUB', kategori: 'Penerangan & Lalu Lintas', totalPetugas: 5, totalLaporan: 72, color: 'bg-yellow-500' },
    { id: 'DNS-004', nama: 'Dinas Sosial', singkatan: 'DINSOS', kategori: 'Ketertiban Sosial', totalPetugas: 4, totalLaporan: 33, color: 'bg-purple-500' },
    { id: 'DNS-005', nama: 'Badan Penanggulangan Bencana', singkatan: 'BPBD', kategori: 'Kedaruratan', totalPetugas: 10, totalLaporan: 28, color: 'bg-red-500' },
];

const DUMMY_PETUGAS = [
    { id: 'PTG-001', nama: 'Ir. Hadi Susanto',    nip: '19800101 200501 1 001', dinas: 'DNS-001', jabatan: 'Kepala Seksi Jalan', telp: '081111111001', status: 'Aktif',    bebanKerja: 12 },
    { id: 'PTG-002', nama: 'Tri Wahyudi, S.T.',   nip: '19850215 201001 1 002', dinas: 'DNS-001', jabatan: 'Staf Teknis',        telp: '081111111002', status: 'Aktif',    bebanKerja: 8  },
    { id: 'PTG-003', nama: 'Eko Nugroho',          nip: '19900320 201501 1 003', dinas: 'DNS-001', jabatan: 'Staf Lapangan',     telp: '081111111003', status: 'Aktif',    bebanKerja: 5  },
    { id: 'PTG-004', nama: 'Retno Wulandari',      nip: '19880512 201201 2 004', dinas: 'DNS-002', jabatan: 'Kepala Bidang',     telp: '082222222001', status: 'Aktif',    bebanKerja: 15 },
    { id: 'PTG-005', nama: 'Slamet Riyadi',        nip: '19920701 201801 1 005', dinas: 'DNS-002', jabatan: 'Staf Kebersihan',   telp: '082222222002', status: 'Aktif',    bebanKerja: 9  },
    { id: 'PTG-006', nama: 'Nur Aini, S.E.',       nip: '19950810 202001 2 006', dinas: 'DNS-003', jabatan: 'Staf Administrasi', telp: '083333333001', status: 'Nonaktif', bebanKerja: 0  },
    { id: 'PTG-007', nama: 'Joko Pranowo',         nip: '19870924 201301 1 007', dinas: 'DNS-003', jabatan: 'Teknisi Lampu',     telp: '083333333002', status: 'Aktif',    bebanKerja: 7  },
    { id: 'PTG-008', nama: 'Dewi Anggraini',       nip: '19911115 201701 2 008', dinas: 'DNS-004', jabatan: 'Penyuluh Sosial',   telp: '084444444001', status: 'Aktif',    bebanKerja: 4  },
    { id: 'PTG-009', nama: 'Budi Hartono, S.H.',   nip: '19830202 200901 1 009', dinas: 'DNS-005', jabatan: 'Koordinator Tim',   telp: '085555555001', status: 'Aktif',    bebanKerja: 20 },
    { id: 'PTG-010', nama: 'Agung Prasetyo',       nip: '19960305 202101 1 010', dinas: 'DNS-005', jabatan: 'Staf Lapangan',     telp: '085555555002', status: 'Aktif',    bebanKerja: 11 },
];

const StatusBadge = ({ status }) => {
    const cfg = { 'Aktif': 'bg-green-100 text-green-700 border border-green-200', 'Nonaktif': 'bg-slate-100 text-slate-500 border border-slate-200' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg[status] || 'bg-slate-100 text-slate-500'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>{status}
        </span>
    );
};

export default function PetugasDinasPage() {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    const [tab, setTab] = useState('petugas'); // 'petugas' | 'dinas'
    const [search, setSearch] = useState('');
    const [filterDinas, setFilterDinas] = useState('Semua');
    const [filterStatus, setFilterStatus] = useState('Semua');
    const [modal, setModal] = useState(null);
    const [modalMode, setModalMode] = useState('detail');
    const [editData, setEditData] = useState({});

    const getDinasNama = (id) => DUMMY_DINAS.find(d => d.id === id)?.singkatan || id;
    const getDinasColor = (id) => DUMMY_DINAS.find(d => d.id === id)?.color || 'bg-slate-500';

    const filteredPetugas = DUMMY_PETUGAS.filter(p => {
        const q = search.toLowerCase();
        const matchQ = p.nama.toLowerCase().includes(q) || p.nip.includes(q) || p.jabatan.toLowerCase().includes(q);
        const matchD = filterDinas === 'Semua' || p.dinas === filterDinas;
        const matchS = filterStatus === 'Semua' || p.status === filterStatus;
        return matchQ && matchD && matchS;
    });

    const filteredDinas = DUMMY_DINAS.filter(d => {
        const q = search.toLowerCase();
        return d.nama.toLowerCase().includes(q) || d.singkatan.toLowerCase().includes(q);
    });

    const openModal = (item, mode = 'detail') => { setModal(item); setModalMode(mode); setEditData({ ...item }); };
    const openTambah = () => { setModal({}); setModalMode('tambah'); setEditData({ nama: '', nip: '', dinas: 'DNS-001', jabatan: '', telp: '', status: 'Aktif' }); };

    const ringkasan = [
        { label: 'Total Dinas',   value: DUMMY_DINAS.length,                                         bg: 'bg-indigo-50',  color: 'text-indigo-600',  border: 'border-indigo-100', icon: 'account_balance' },
        { label: 'Total Petugas', value: DUMMY_PETUGAS.length,                                        bg: 'bg-blue-50',    color: 'text-blue-600',    border: 'border-blue-100',   icon: 'badge' },
        { label: 'Petugas Aktif', value: DUMMY_PETUGAS.filter(p => p.status === 'Aktif').length,      bg: 'bg-green-50',   color: 'text-green-600',   border: 'border-green-100',  icon: 'check_circle' },
        { label: 'Sedang Bertugas',value: DUMMY_PETUGAS.filter(p => p.bebanKerja > 0).length,         bg: 'bg-orange-50',  color: 'text-orange-600',  border: 'border-orange-100', icon: 'engineering' },
    ];

    return (
        <AdminLayout pageTitle="Petugas & Dinas" pageSubtitle="Kelola data petugas dan dinas terkait">

            {/* Ringkasan */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {ringkasan.map(r => (
                    <div key={r.label} className={`bg-white rounded-2xl p-4 border ${r.border} shadow-sm flex items-center gap-4`}>
                        <div className={`w-11 h-11 ${r.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <span className={`material-symbols-outlined text-2xl ${r.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{r.icon}</span>
                        </div>
                        <div><p className="text-2xl font-bold text-slate-800">{r.value}</p><p className="text-xs text-slate-500">{r.label}</p></div>
                    </div>
                ))}
            </div>

            {/* Tab + Toolbar */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 pt-4 border-b border-slate-100">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        {/* Tabs */}
                        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                            {[{ id: 'petugas', label: 'Data Petugas', icon: 'badge' }, { id: 'dinas', label: 'Data Dinas', icon: 'account_balance' }].map(t => (
                                <button key={t.id} onClick={() => { setTab(t.id); setSearch(''); }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.id ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                    <span className="material-symbols-outlined text-base">{t.icon}</span>{t.label}
                                </button>
                            ))}
                        </div>
                        {/* Search & Filter */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
                                <input type="text" placeholder="Cari..." value={search} onChange={e => setSearch(e.target.value)}
                                    className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 w-48" />
                            </div>
                            {tab === 'petugas' && (
                                <>
                                    <select value={filterDinas} onChange={e => setFilterDinas(e.target.value)} className="text-sm border border-slate-200 rounded-xl px-3 py-2 text-slate-600 bg-white focus:outline-none focus:border-blue-400">
                                        <option value="Semua">Semua Dinas</option>
                                        {DUMMY_DINAS.map(d => <option key={d.id} value={d.id}>{d.singkatan}</option>)}
                                    </select>
                                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-sm border border-slate-200 rounded-xl px-3 py-2 text-slate-600 bg-white focus:outline-none focus:border-blue-400">
                                        {['Semua', 'Aktif', 'Nonaktif'].map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </>
                            )}
                            <button onClick={openTambah} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                                <span className="material-symbols-outlined text-base">add</span>
                                {tab === 'petugas' ? 'Tambah Petugas' : 'Tambah Dinas'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ===== TAB: PETUGAS ===== */}
                {tab === 'petugas' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 text-left">
                                    {['Petugas', 'NIP', 'Dinas', 'Jabatan', 'Telepon', 'Beban Kerja', 'Status', 'Aksi'].map(h => (
                                        <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredPetugas.length === 0 ? (
                                    <tr><td colSpan={8} className="text-center py-16 text-slate-400">
                                        <span className="material-symbols-outlined text-4xl block mb-2">search_off</span>Tidak ada petugas ditemukan
                                    </td></tr>
                                ) : filteredPetugas.map(p => (
                                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 ${getDinasColor(p.dinas)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                                    <span className="text-white text-xs font-bold">{p.nama.charAt(0)}</span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800 text-sm">{p.nama}</p>
                                                    <p className="text-xs text-slate-400 font-mono">{p.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.nip}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-md text-white ${getDinasColor(p.dinas)}`}>{getDinasNama(p.dinas)}</span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 text-xs">{p.jabatan}</td>
                                        <td className="px-4 py-3 text-slate-500 text-xs">{p.telp}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${p.bebanKerja > 15 ? 'bg-red-400' : p.bebanKerja > 8 ? 'bg-orange-400' : 'bg-green-400'}`}
                                                        style={{ width: `${Math.min((p.bebanKerja / 20) * 100, 100)}%` }}></div>
                                                </div>
                                                <span className="text-xs font-semibold text-slate-600">{p.bebanKerja}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                <button onClick={() => openModal(p, 'detail')} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Detail">
                                                    <span className="material-symbols-outlined text-base">visibility</span>
                                                </button>
                                                <button onClick={() => openModal(p, 'edit')} className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Edit">
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
                )}

                {/* ===== TAB: DINAS ===== */}
                {tab === 'dinas' && (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredDinas.map(d => (
                            <div key={d.id} className="border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-shadow bg-white">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-11 h-11 ${d.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                            <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm leading-tight">{d.nama}</p>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md text-white ${d.color} mt-1 inline-block`}>{d.singkatan}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => openModal(d, 'edit')} className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors">
                                            <span className="material-symbols-outlined text-base">edit</span>
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 mb-4 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">category</span>{d.kategori}
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                                        <p className="text-xl font-bold text-slate-800">{d.totalPetugas}</p>
                                        <p className="text-xs text-slate-400">Petugas</p>
                                    </div>
                                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                                        <p className="text-xl font-bold text-blue-700">{d.totalLaporan}</p>
                                        <p className="text-xs text-blue-400">Laporan</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination (hanya tab petugas) */}
                {tab === 'petugas' && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                        <p className="text-xs text-slate-500">Menampilkan {filteredPetugas.length} dari {DUMMY_PETUGAS.length} petugas</p>
                        <div className="flex gap-1">
                            <button className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg">Sebelumnya</button>
                            <button className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg">1</button>
                            <button className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg">Berikutnya</button>
                        </div>
                    </div>
                )}
            </div>

            {/* ===== MODAL ===== */}
            {modal !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setModal(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                            <h2 className="font-bold text-slate-800 text-lg">
                                {modalMode === 'detail' ? 'Detail Petugas' : modalMode === 'edit' ? 'Edit Data' : tab === 'petugas' ? 'Tambah Petugas' : 'Tambah Dinas'}
                            </h2>
                            <button onClick={() => setModal(null)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                            {tab === 'petugas' ? (
                                <>
                                    {['nama', 'nip', 'jabatan', 'telp'].map(field => (
                                        <div key={field}>
                                            <label className="text-xs text-slate-500 font-semibold block mb-1.5 capitalize">
                                                {field === 'nip' ? 'NIP' : field === 'telp' ? 'No. Telepon' : field.charAt(0).toUpperCase() + field.slice(1)}
                                            </label>
                                            {modalMode === 'detail' ? (
                                                <p className="text-sm text-slate-800 font-medium px-3 py-2 bg-slate-50 rounded-lg">{modal[field] || '-'}</p>
                                            ) : (
                                                <input type="text" value={editData[field] || ''} onChange={e => setEditData({ ...editData, [field]: e.target.value })}
                                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400" />
                                            )}
                                        </div>
                                    ))}
                                    <div>
                                        <label className="text-xs text-slate-500 font-semibold block mb-1.5">Dinas</label>
                                        {modalMode === 'detail' ? (
                                            <p className="text-sm text-slate-800 font-medium px-3 py-2 bg-slate-50 rounded-lg">{DUMMY_DINAS.find(d => d.id === modal.dinas)?.nama || '-'}</p>
                                        ) : (
                                            <select value={editData.dinas || ''} onChange={e => setEditData({ ...editData, dinas: e.target.value })}
                                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 bg-white">
                                                {DUMMY_DINAS.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
                                            </select>
                                        )}
                                    </div>
                                    {modalMode === 'detail' && (
                                        <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 flex items-center gap-4">
                                            <span className="material-symbols-outlined text-orange-500 text-3xl">engineering</span>
                                            <div>
                                                <p className="text-2xl font-bold text-orange-700">{modal.bebanKerja}</p>
                                                <p className="text-xs text-orange-500">Laporan sedang ditangani</p>
                                            </div>
                                        </div>
                                    )}
                                    {modalMode !== 'detail' && (
                                        <div>
                                            <label className="text-xs text-slate-500 font-semibold block mb-1.5">Status</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['Aktif', 'Nonaktif'].map(s => (
                                                    <button key={s} onClick={() => setEditData({ ...editData, status: s })}
                                                        className={`py-2 rounded-xl text-sm font-semibold border-2 transition-all ${editData.status === s ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-blue-300'}`}>
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                // Form Dinas
                                <>
                                    {['nama', 'singkatan', 'kategori'].map(field => (
                                        <div key={field}>
                                            <label className="text-xs text-slate-500 font-semibold block mb-1.5 capitalize">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                                            <input type="text" value={editData[field] || ''} onChange={e => setEditData({ ...editData, [field]: e.target.value })}
                                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400" />
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                            <button onClick={() => setModal(null)} className="px-5 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold">
                                {modalMode === 'detail' ? 'Tutup' : 'Batal'}
                            </button>
                            {modalMode !== 'detail' && (
                                <button onClick={() => setModal(null)} className="px-5 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold">
                                    {modalMode === 'tambah' ? 'Tambahkan' : 'Simpan'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
