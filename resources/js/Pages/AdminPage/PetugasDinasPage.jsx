import React, { useEffect, useState } from 'react';
import AdminLayout from '../../Components/AdminLayout';
import api from '../../axios';

const StatusBadge = ({ status }) => {
    const cfg = { 'Aktif': 'bg-green-100 text-green-700 border border-green-200', 'Nonaktif': 'bg-slate-100 text-slate-500 border border-slate-200' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg[status] || 'bg-slate-100 text-slate-500'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>{status}
        </span>
    );
};

const isImageUrl = (avatar) => {
    return avatar && (avatar.startsWith('/storage') || avatar.startsWith('http') || avatar.startsWith('data:image'));
};

export default function PetugasDinasPage() {
    const [tab, setTab] = useState('petugas'); // 'petugas' | 'dinas'
    const [search, setSearch] = useState('');
    const [filterDinas, setFilterDinas] = useState('Semua');
    const [filterStatus, setFilterStatus] = useState('Semua');

    const [modal, setModal] = useState(null);
    const [modalMode, setModalMode] = useState('detail'); // 'detail' | 'edit' | 'tambah'
    const [editData, setEditData] = useState({});
    const [successAccount, setSuccessAccount] = useState(null);

    // Delete states
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

    const [dinasList, setDinasList] = useState([]);
    const [petugasList, setPetugasList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch dynamic data from database
    const fetchData = async () => {
        setLoading(true);
        try {
            const [dinasRes, petugasRes] = await Promise.all([
                api.get('/api/dinas'),
                api.get('/api/petugas')
            ]);
            setDinasList(dinasRes.data);
            setPetugasList(petugasRes.data);
        } catch (error) {
            console.error("Error fetching dinas and petugas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchData();
    }, []);

    const getDinasNama = (id) => dinasList.find(d => d.id === id)?.singkatan || id;
    const getDinasColor = (id) => dinasList.find(d => d.id === id)?.color || 'bg-slate-500';

    const filteredPetugas = petugasList.filter(p => {
        const q = search.toLowerCase();
        const matchQ = p.nama.toLowerCase().includes(q) || p.nip.includes(q) || p.jabatan.toLowerCase().includes(q);
        const matchD = filterDinas === 'Semua' || p.dinas === filterDinas;
        const matchS = filterStatus === 'Semua' || p.status === filterStatus;
        return matchQ && matchD && matchS;
    });

    const filteredDinas = dinasList.filter(d => {
        const q = search.toLowerCase();
        return d.nama.toLowerCase().includes(q) || d.singkatan.toLowerCase().includes(q);
    });

    const openModal = (item, mode = 'detail') => {
        setModal(item);
        setModalMode(mode);
        setEditData({ ...item });
    };

    const openTambah = () => {
        setModal({});
        setModalMode('tambah');
        if (tab === 'petugas') {
            setEditData({
                nama: '',
                nip: '',
                dinas: dinasList[0]?.id || '',
                jabatan: '',
                telp: '',
                status: 'Aktif'
            });
        } else {
            setEditData({
                nama: '',
                singkatan: '',
                kategori: ''
            });
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (tab === 'petugas') {
                if (modalMode === 'tambah') {
                    const res = await api.post('/api/petugas', {
                        nama: editData.nama,
                        nip: editData.nip,
                        dinas: editData.dinas,
                        jabatan: editData.jabatan,
                        telp: editData.telp,
                    });
                    if (res.data && res.data.status === 'success') {
                        setModal(null);
                        await fetchData();
                        setSuccessAccount({
                            nama: res.data.data.nama,
                            username: res.data.data.username,
                            password: 'petugas123'
                        });
                    }
                } else if (modalMode === 'edit') {
                    const res = await api.put(`/api/petugas/${modal.original_id}`, {
                        nama: editData.nama,
                        nip: editData.nip,
                        dinas: editData.dinas,
                        jabatan: editData.jabatan,
                        telp: editData.telp,
                    });
                    if (res.data && res.data.status === 'success') {
                        setModal(null);
                        await fetchData();
                    }
                }
            } else {
                if (modalMode === 'tambah') {
                    const res = await api.post('/api/dinas', {
                        nama: editData.nama,
                        singkatan: editData.singkatan,
                        kategori: editData.kategori,
                    });
                    if (res.data && res.data.status === 'success') {
                        setModal(null);
                        await fetchData();
                    }
                } else if (modalMode === 'edit') {
                    const res = await api.put(`/api/dinas/${modal.original_id}`, {
                        nama: editData.nama,
                        singkatan: editData.singkatan,
                    });
                    if (res.data && res.data.status === 'success') {
                        setModal(null);
                        await fetchData();
                    }
                }
            }
        } catch (error) {
            console.error("Error saving data:", error);
            if (error.response && error.response.data && error.response.data.message) {
                alert(`Gagal menyimpan: ${error.response.data.message}`);
            } else {
                alert("Terjadi kesalahan saat menyimpan data.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            if (tab === 'petugas') {
                const res = await api.delete(`/api/petugas/${deleteTarget.original_id}`);
                if (res.data && res.data.status === 'success') {
                    setDeleteTarget(null);
                    await fetchData();
                }
            } else {
                const res = await api.delete(`/api/dinas/${deleteTarget.original_id}`);
                if (res.data && res.data.status === 'success') {
                    setDeleteTarget(null);
                    await fetchData();
                }
            }
        } catch (error) {
            console.error(`Gagal menghapus ${tab}:`, error);
            alert(`Gagal menghapus ${tab} dari database.`);
        } finally {
            setIsDeleting(false);
        }
    };

    const toggleAll = () => setSelectedIds(selectedIds.length === filteredPetugas.length && filteredPetugas.length > 0 ? [] : filteredPetugas.map(p => p.original_id));
    const toggleOne = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

    const handleBulkDelete = () => {
        setShowBulkDeleteModal(true);
    };

    const handleBulkDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            for (const id of selectedIds) {
                await api.delete(`/api/petugas/${id}`);
            }
            setSelectedIds([]);
            setShowBulkDeleteModal(false);
            await fetchData();
            alert("Petugas terpilih berhasil dihapus.");
        } catch (err) {
            console.error("Gagal menghapus petugas secara massal", err);
            alert("Gagal menghapus beberapa petugas.");
        } finally {
            setIsDeleting(false);
        }
    };

    const ringkasan = [
        { label: 'Total Dinas',    value: dinasList.length,                                         bg: 'bg-indigo-50',  color: 'text-indigo-600',  border: 'border-indigo-100', icon: 'account_balance' },
        { label: 'Total Petugas',  value: petugasList.length,                                       bg: 'bg-blue-50',    color: 'text-blue-600',    border: 'border-blue-100',   icon: 'badge' },
        { label: 'Petugas Aktif',  value: petugasList.filter(p => p.status === 'Aktif').length,      bg: 'bg-green-50',   color: 'text-green-600',   border: 'border-green-100',  icon: 'check_circle' },
        { label: 'Sedang Bertugas', value: petugasList.filter(p => p.bebanKerja > 0).length,         bg: 'bg-orange-50',  color: 'text-orange-600',  border: 'border-orange-100', icon: 'engineering' },
    ];

    return (
        <AdminLayout pageTitle="Petugas & Dinas" pageSubtitle="Kelola data petugas dan dinas terkait">

            {/* Ringkasan */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {ringkasan.map(r => (
                    <div key={r.label} className={`bg-white rounded-2xl p-4 border ${r.border} shadow-sm flex items-center gap-4`}>
                        <div className={`w-11 h-11 ${r.bg} rounded-xl flex items-center justify-center shrink-0`}>
                            <span className={`material-symbols-outlined text-2xl ${r.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{r.icon}</span>
                        </div>
                        <div><p className="text-2xl font-bold text-slate-800">{r.value}</p><p className="text-xs text-slate-500">{r.label}</p></div>
                    </div>
                ))}
            </div>

            {/* Tab + Toolbar */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        {/* Tabs */}
                        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                            {[{ id: 'petugas', label: 'Data Petugas', icon: 'badge' }, { id: 'dinas', label: 'Data Dinas', icon: 'account_balance' }].map(t => (
                                <button key={t.id} onClick={() => { setTab(t.id); setSearch(''); setSelectedIds([]); }}
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
                                    className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 w-48 bg-white" />
                            </div>
                            {tab === 'petugas' && (
                                <>
                                    <select value={filterDinas} onChange={e => setFilterDinas(e.target.value)} className="text-sm border border-slate-200 rounded-xl px-3 py-2 text-slate-600 bg-white focus:outline-none focus:border-blue-400">
                                        <option value="Semua">Semua Dinas</option>
                                        {dinasList.map(d => <option key={d.id} value={d.id}>{d.singkatan}</option>)}
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
                        {/* Bulk Action Bar */}
                        {selectedIds.length > 0 && (
                            <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-4 flex-wrap">
                                <span className="text-sm font-semibold text-blue-700">{selectedIds.length} petugas terpilih</span>
                                <button
                                    disabled={isDeleting}
                                    onClick={handleBulkDelete}
                                    className="text-xs text-red-500 hover:underline font-semibold flex items-center gap-1 disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                    Hapus Terpilih
                                </button>
                                <button onClick={() => setSelectedIds([])} className="ml-auto text-xs text-slate-500 hover:underline">Batalkan Pilihan</button>
                            </div>
                        )}
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 text-left">
                                    <th className="px-4 py-3 w-10">
                                        <input type="checkbox" checked={selectedIds.length === filteredPetugas.length && filteredPetugas.length > 0} onChange={toggleAll} className="rounded" />
                                    </th>
                                    {['Petugas', 'NIP', 'Dinas', 'Jabatan', 'Telepon', 'Beban Kerja', 'Status', 'Aksi'].map(h => (
                                        <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan={8} className="text-center py-16 text-slate-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Memuat data petugas...</span>
                                        </div>
                                    </td></tr>
                                ) : filteredPetugas.length === 0 ? (
                                    <tr><td colSpan={8} className="text-center py-16 text-slate-400">
                                        <span className="material-symbols-outlined text-4xl block mb-2">search_off</span>Tidak ada petugas ditemukan
                                    </td></tr>
                                ) : filteredPetugas.map(p => (
                                    <tr key={p.id} className={`hover:bg-slate-50 transition-colors ${selectedIds.includes(p.original_id) ? 'bg-blue-50/50' : ''}`}>
                                        <td className="px-4 py-3">
                                            <input type="checkbox" checked={selectedIds.includes(p.original_id)} onChange={() => toggleOne(p.original_id)} className="rounded" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 ${getDinasColor(p.dinas)} rounded-lg flex items-center justify-center shrink-0 overflow-hidden`}>
                                                    {isImageUrl(p.avatar) ? (
                                                        <img src={p.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-white text-xs font-bold">{p.nama.charAt(0)}</span>
                                                    )}
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
                                                <button onClick={() => setDeleteTarget(p)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
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
                    <div className="p-6">
                        {loading ? (
                            <div className="text-center py-16 text-slate-400">
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Memuat data dinas...</span>
                                </div>
                            </div>
                        ) : filteredDinas.length === 0 ? (
                            <div className="text-center py-16 text-slate-400">
                                <span className="material-symbols-outlined text-4xl block mb-2">search_off</span>Tidak ada dinas ditemukan
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {filteredDinas.map(d => (
                                    <div key={d.id} className="border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-shadow bg-white relative group">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-11 h-11 ${d.color} rounded-xl flex items-center justify-center shrink-0`}>
                                                    <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm leading-tight">{d.nama}</p>
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md text-white ${d.color} mt-1 inline-block`}>{d.singkatan}</span>
                                                </div>
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
                                        {/* Hover actions */}
                                        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                            <button onClick={() => openModal(d, 'edit')} className="p-1.5 bg-white text-green-500 hover:bg-green-50 rounded-lg shadow-sm border border-slate-100 transition-colors">
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                            </button>
                                            <button onClick={() => setDeleteTarget(d)} className="p-1.5 bg-white text-red-400 hover:bg-red-50 rounded-lg shadow-sm border border-slate-100 transition-colors">
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {tab === 'petugas' && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                        <p className="text-xs text-slate-500">Menampilkan {filteredPetugas.length} dari {petugasList.length} petugas</p>
                        <div className="flex gap-1">
                            <button className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg">Sebelumnya</button>
                            <button className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg">1</button>
                            <button className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg">Berikutnya</button>
                        </div>
                    </div>
                )}
            </div>

            {/* ===== EDIT/DETAIL/ADD MODAL ===== */}
            {modal !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setModal(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                            <h2 className="font-bold text-slate-800 text-lg">
                                {modalMode === 'detail' ? 'Detail Petugas' : modalMode === 'edit' ? 'Edit Data Petugas' : tab === 'petugas' ? 'Tambah Petugas' : 'Tambah Dinas'}
                            </h2>
                            <button onClick={() => setModal(null)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                            {tab === 'petugas' ? (
                                <>
                                    {modalMode !== 'tambah' && (
                                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                                            <div className={`w-14 h-14 ${getDinasColor(modal.dinas)} rounded-2xl flex items-center justify-center overflow-hidden`}>
                                                {isImageUrl(modal.avatar) ? (
                                                    <img src={modal.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-white text-xl font-bold">{modal.nama?.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{modal.nama}</p>
                                                <p className="text-xs text-slate-400 font-mono">{modal.id}</p>
                                                <StatusBadge status={modal.status || 'Aktif'} />
                                            </div>
                                        </div>
                                    )}
                                    {['nama', 'nip', 'jabatan', 'telp'].map(field => (
                                        <div key={field}>
                                            <label className="text-xs text-slate-500 font-semibold block mb-1.5 capitalize">
                                                {field === 'nip' ? 'NIP' : field === 'telp' ? 'No. Telepon' : field}
                                            </label>
                                            {modalMode === 'detail' ? (
                                                <p className="text-sm text-slate-800 font-medium px-3 py-2 bg-slate-50 rounded-lg">{modal[field] || '-'}</p>
                                            ) : (
                                                <input type="text" value={editData[field] || ''} onChange={e => setEditData({ ...editData, [field]: e.target.value })}
                                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 bg-white" />
                                            )}
                                        </div>
                                    ))}
                                    <div>
                                        <label className="text-xs text-slate-500 font-semibold block mb-1.5">Dinas</label>
                                        {modalMode === 'detail' ? (
                                            <p className="text-sm text-slate-800 font-medium px-3 py-2 bg-slate-50 rounded-lg">{modal.dinas_nama || '-'}</p>
                                        ) : (
                                            <select value={editData.dinas || ''} onChange={e => setEditData({ ...editData, dinas: e.target.value })}
                                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 bg-white">
                                                {dinasList.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
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
                                    {modalMode === 'edit' && (
                                        <div>
                                            <label className="text-xs text-slate-500 font-semibold block mb-1.5">Status</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['Aktif', 'Nonaktif'].map(s => (
                                                    <button key={s} type="button" onClick={() => setEditData({ ...editData, status: s })}
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
                                    {['nama', 'singkatan'].map(field => (
                                        <div key={field}>
                                            <label className="text-xs text-slate-500 font-semibold block mb-1.5 capitalize">{field === 'nama' ? 'Nama Dinas' : 'Singkatan'}</label>
                                            <input type="text" value={editData[field] || ''} onChange={e => setEditData({ ...editData, [field]: e.target.value })}
                                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 bg-white" />
                                        </div>
                                    ))}
                                    {modalMode === 'tambah' && (
                                        <div>
                                            <label className="text-xs text-slate-500 font-semibold block mb-1.5 capitalize">Kategori Bawaan</label>
                                            <input type="text" value={editData.kategori || ''} onChange={e => setEditData({ ...editData, kategori: e.target.value })}
                                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 bg-white" />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
                            <button disabled={isSaving} onClick={() => setModal(null)} className="px-5 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-white transition-colors font-semibold bg-transparent">
                                {modalMode === 'detail' ? 'Tutup' : 'Batal'}
                            </button>
                            {modalMode !== 'detail' && (
                                <button disabled={isSaving} onClick={handleSave} className="px-5 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold">
                                    {isSaving ? 'Menyimpan...' : modalMode === 'tambah' ? 'Tambahkan' : 'Simpan'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ===== PREMIUM RED KUSTOM DELETE CONFIRMATION MODAL ===== */}
            {deleteTarget !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-5 border-b border-red-50 bg-red-50/10">
                            <div>
                                <h2 className="font-bold text-red-600 text-lg">Konfirmasi Hapus {tab === 'petugas' ? 'Petugas' : 'Dinas'}</h2>
                                <p className="text-xs text-red-500 mt-0.5">{tab === 'petugas' ? 'Petugas' : 'Dinas'} ID: {deleteTarget.id}</p>
                            </div>
                            <button onClick={() => setDeleteTarget(null)} className="p-2 hover:bg-red-50 rounded-xl text-red-400 hover:text-red-600"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <div className="px-6 py-8 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500 border border-red-100">
                                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-800 mb-2 px-2">
                                Apakah Anda yakin ingin menghapus {tab === 'petugas' ? 'petugas' : 'dinas'} <span className="text-red-600 font-bold">{deleteTarget.nama}</span>?
                            </p>
                            <p className="text-xs text-slate-500 max-w-xs px-2 leading-relaxed">
                                {tab === 'petugas' 
                                    ? 'Tindakan ini tidak dapat dibatalkan dan seluruh penugasan kerja petugas ini di database akan dihapus secara permanen.'
                                    : 'Tindakan ini tidak dapat dibatalkan dan seluruh kategori terkait dinas ini di database akan terpengaruh.'}
                            </p>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                            <button disabled={isDeleting} onClick={() => setDeleteTarget(null)} className="px-5 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-white transition-colors font-semibold bg-transparent">
                                Batal
                            </button>
                            <button disabled={isDeleting} onClick={handleDelete} className="px-5 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold shadow-sm shadow-red-100">
                                {isDeleting ? 'Menghapus...' : `Ya, Hapus ${tab === 'petugas' ? 'Petugas' : 'Dinas'}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== PREMIUM RED KUSTOM BULK DELETE CONFIRMATION MODAL ===== */}
            {showBulkDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowBulkDeleteModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-5 border-b border-red-50 bg-red-50/10">
                            <div>
                                <h2 className="font-bold text-red-600 text-lg">Konfirmasi Hapus Masal</h2>
                                <p className="text-xs text-red-500 mt-0.5">{selectedIds.length} Petugas Terpilih</p>
                            </div>
                            <button onClick={() => setShowBulkDeleteModal(false)} className="p-2 hover:bg-red-50 rounded-xl text-red-400 hover:text-red-600"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <div className="px-6 py-6 space-y-4">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-3 text-red-500 border border-red-100">
                                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                                </div>
                                <p className="text-sm font-semibold text-slate-800 mb-2 px-2">
                                    Apakah Anda yakin ingin menghapus <span className="text-red-600 font-bold">{selectedIds.length} petugas</span> terpilih?
                                </p>
                            </div>

                            <div className="max-h-36 overflow-y-auto border border-slate-100 rounded-xl p-3 bg-slate-50 flex flex-wrap gap-1.5 justify-center">
                                {selectedIds.map(id => {
                                    const p = petugasList.find(x => x.original_id === id);
                                    return p ? (
                                        <span key={id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-sm">
                                            {p.nama}
                                        </span>
                                    ) : null;
                                })}
                            </div>

                            <p className="text-xs text-slate-500 text-center leading-relaxed px-4">
                                Tindakan ini tidak dapat dibatalkan dan seluruh data pekerjaan serta akun petugas terpilih akan dihapus secara permanen dari sistem.
                            </p>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                            <button disabled={isDeleting} onClick={() => setShowBulkDeleteModal(false)} className="px-5 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-white transition-colors font-semibold bg-transparent">
                                Batal
                            </button>
                            <button disabled={isDeleting} onClick={handleBulkDeleteConfirm} className="px-5 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold shadow-sm shadow-red-100">
                                {isDeleting ? 'Menghapus...' : `Ya, Hapus ${selectedIds.length} Petugas`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== SUCCESS ACCOUNT CREATION MODAL ===== */}
            {successAccount !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSuccessAccount(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-5 border-b border-green-50 bg-green-50/10">
                            <div>
                                <h2 className="font-bold text-green-700 text-lg">Akun Otomatis Terbuat!</h2>
                                <p className="text-xs text-green-600 mt-0.5">Petugas: {successAccount.nama}</p>
                            </div>
                            <button onClick={() => setSuccessAccount(null)} className="p-2 hover:bg-green-50 rounded-xl text-green-400 hover:text-green-600"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <div className="px-6 py-6 space-y-4">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-3 text-green-500 border border-green-100">
                                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                </div>
                                <p className="text-sm font-semibold text-slate-800 mb-1">
                                    Kredensial login petugas berhasil digenerate:
                                </p>
                            </div>

                            <div className="border border-slate-100 rounded-xl p-4 bg-slate-50 space-y-2.5 font-mono text-sm">
                                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                                    <span className="text-slate-400">Username</span>
                                    <span className="font-semibold text-slate-800 select-all">{successAccount.username}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Password</span>
                                    <span className="font-semibold text-slate-800 select-all">{successAccount.password}</span>
                                </div>
                            </div>

                            <p className="text-xs text-slate-500 text-center leading-relaxed px-4">
                                Petugas dapat login menggunakan NIP atau Username di atas, dengan password default <span className="font-bold text-slate-700">{successAccount.password}</span>.
                            </p>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                            <button onClick={() => {
                                const text = `Kredensial Petugas Baru:\nNama: ${successAccount.nama}\nUsername: ${successAccount.username}\nPassword: ${successAccount.password}`;
                                navigator.clipboard.writeText(text);
                                alert("Kredensial disalin ke clipboard!");
                            }} className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-xl transition-colors font-semibold flex items-center gap-1.5 bg-transparent">
                                <span className="material-symbols-outlined text-base">content_copy</span>
                                Salin Kredensial
                            </button>
                            <button onClick={() => setSuccessAccount(null)} className="px-5 py-2 text-sm bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold">
                                Selesai
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
