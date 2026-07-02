import React, { useEffect, useState } from 'react';
import AdminLayout from '../../Components/AdminLayout';
import api from '../../axios';

export default function KategoriPage() {
    const [kategoris, setKategoris] = useState([]);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [modal, setModal] = useState(null);
    const [modalMode, setModalMode] = useState('detail');
    const [editData, setEditData] = useState({});
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchKategoris = async () => {
        try {
            const response = await api.get('/api/kategoris');
            setKategoris(response.data);
        } catch (error) {
            console.error("Gagal mengambil data kategori:", error);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        const loadData = async () => {
            setLoading(true);
            try {
                await fetchKategoris();
            } catch (error) {
                console.error("Gagal memuat data kategori:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const ICONS = ['construction','delete','lightbulb','water_drop','gavel','park','stadium','emergency','report','traffic','local_hospital','school'];
    const WARNA = ['bg-blue-500','bg-green-500','bg-yellow-500','bg-cyan-500','bg-orange-500','bg-emerald-500','bg-purple-500','bg-red-500','bg-pink-500','bg-indigo-500'];

    // Filter pencarian berdasarkan nama kategori atau dinas yang terikat dari backend
    const filtered = kategoris.filter(k => {
        const matchesNama = k.nama.toLowerCase().includes(search.toLowerCase());
        const matchesDinas = Array.isArray(k.dinas)
            ? k.dinas.some(d => d.toLowerCase().includes(search.toLowerCase()))
            : k.dinas?.toLowerCase().includes(search.toLowerCase());

        return matchesNama || matchesDinas;
    });

    const openModal = (k, mode = 'detail') => {
        setModal(k);
        setModalMode(mode);
        setEditData({ ...k });
    };

    const openTambah = () => {
        setModal({});
        setModalMode('tambah');
        setEditData({ nama: '', icon: 'construction', warna: 'bg-blue-500', deskripsi: '', aktif: true });
    };

    const handleSave = async () => {
        try {
            const payload = {
                nama: editData.nama,
                deskripsi: editData.deskripsi,
                icon: editData.icon,
                warna: editData.warna,
                aktif: editData.aktif,
            };

            if (modalMode === 'tambah') {
                const response = await api.post('/api/kategoris', payload);
                if (response.data.status === 'success') {
                    setKategoris(prev => [...prev, response.data.data]);
                }
            } else if (modalMode === 'edit') {
                const response = await api.put(`/api/kategoris/${editData.original_id}`, payload);
                if (response.data.status === 'success') {
                    setKategoris(prev => prev.map(k => k.original_id === editData.original_id ? response.data.data : k));
                }
            }
            setModal(null);
        } catch (error) {
            console.error("Gagal menyimpan kategori:", error);
        }
    };

    const handleDelete = (k) => { setDeleteTarget(k); };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api.delete(`/api/kategoris/${deleteTarget.original_id}`);
            setKategoris(prev => prev.filter(k => k.original_id !== deleteTarget.original_id));
            setDeleteTarget(null);
        } catch (error) {
            console.error("Gagal menghapus kategori:", error);
        }
    };

    const ringkasan = [
        { label: 'Total Kategori', value: kategoris.length,                                     bg: 'bg-blue-50',   color: 'text-blue-600',   border: 'border-blue-100',   icon: 'category' },
        { label: 'Aktif',          value: kategoris.filter(k => k.aktif).length,          bg: 'bg-green-50',  color: 'text-green-600',  border: 'border-green-100',  icon: 'check_circle' },
        { label: 'Nonaktif',       value: kategoris.filter(k => !k.aktif).length,         bg: 'bg-slate-100', color: 'text-slate-500',  border: 'border-slate-200',  icon: 'do_not_disturb_on' },
        { label: 'Total Laporan',  value: kategoris.reduce((s, k) => s + (k.totalLaporan || 0), 0), bg: 'bg-purple-50', color: 'text-purple-600', border: 'border-purple-100', icon: 'assignment' },
    ];

    return (
        <AdminLayout pageTitle="Kategori Laporan" pageSubtitle="Kelola kategori dan sub-kategori pengaduan">

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

            {/* Toolbar */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-45">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
                        <input type="text" placeholder="Cari kategori atau dinas pengampu..." value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400" />
                    </div>
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                        {[{ v: 'grid', icon: 'grid_view' }, { v: 'list', icon: 'view_list' }].map(({ v, icon }) => (
                            <button key={v} onClick={() => setViewMode(v)}
                                className={`p-2 rounded-lg transition-all ${viewMode === v ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                <span className="material-symbols-outlined text-base">{icon}</span>
                            </button>
                        ))}
                    </div>
                    <button onClick={openTambah} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                        <span className="material-symbols-outlined text-base">add</span>Tambah Kategori
                    </button>
                </div>

                {/* ===== GRID VIEW ===== */}
                {viewMode === 'grid' && (
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        {loading ? (
                            <div className="col-span-4 text-center py-16 text-slate-400">
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Memuat data kategori...</span>
                                </div>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="col-span-4 text-center py-16 text-slate-400">
                                <span className="material-symbols-outlined text-4xl block mb-2">search_off</span>Kategori tidak ditemukan
                            </div>
                        ) : (
                            filtered.map(k => (
                                <div key={k.id} className={`relative border rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between ${k.aktif ? 'border-slate-100 bg-white' : 'border-slate-200 bg-slate-50 opacity-70'}`}
                                    onClick={() => openModal(k, 'detail')}>
                                    <div>
                                        <span className={`absolute top-4 right-4 text-xs font-semibold px-2 py-0.5 rounded-full ${k.aktif ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                                            {k.aktif ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                        <div className={`w-12 h-12 ${k.warna} rounded-2xl flex items-center justify-center mb-4`}>
                                            <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{k.icon}</span>
                                        </div>
                                        <h3 className="font-bold text-slate-800 mb-1">{k.nama}</h3>
                                        <p className="text-xs text-slate-400 mb-3 line-clamp-2">{k.deskripsi}</p>

                                        {/* TAMPILAN DINAS DI GRID (Tetap ditampilkan sebagai pembacaan data/read-only) */}
                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {Array.isArray(k.dinas) && k.dinas.length > 0 ? k.dinas.map((d, idx) => (
                                                <span key={idx} className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-medium border border-slate-200">
                                                    <span className="material-symbols-outlined text-[10px]">account_balance</span>{d}
                                                </span>
                                            )) : typeof k.dinas === 'string' && k.dinas ? (
                                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-medium border border-slate-200">
                                                    <span className="material-symbols-outlined text-[10px]">account_balance</span>{k.dinas}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-slate-400 italic">Belum diampu dinas manapun</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                                        <span className="text-xs font-bold text-blue-600">{k.totalLaporan || 0} laporan</span>
                                    </div>
                                    <div className="absolute bottom-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                        <button onClick={() => openModal(k, 'edit')} className="p-1.5 bg-white text-green-500 hover:bg-green-50 rounded-lg shadow-sm border border-slate-100 transition-colors">
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                        </button>
                                        <button onClick={() => handleDelete(k)} className="p-1.5 bg-white text-red-400 hover:bg-red-50 rounded-lg shadow-sm border border-slate-100 transition-colors">
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* ===== LIST VIEW ===== */}
                {viewMode === 'list' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 text-left">
                                    {['Kategori', 'Dinas Pengampu', 'Deskripsi', 'Total Laporan', 'Status', 'Aksi'].map(h => (
                                        <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-16 text-slate-400">
                                            <div className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>Memuat data kategori...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-16 text-slate-400">
                                        <span className="material-symbols-outlined text-4xl block mb-2">search_off</span>Kategori tidak ditemukan
                                    </td></tr>
                                ) : filtered.map(k => (
                                    <tr key={k.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 ${k.warna} rounded-xl flex items-center justify-center shrink-0`}>
                                                    <span className="material-symbols-outlined text-white text-base" style={{ fontVariationSettings: "'FILL' 1" }}>{k.icon}</span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800">{k.nama}</p>
                                                    <p className="text-xs text-slate-400 font-mono">{k.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 text-xs max-w-50">
                                            <div className="flex flex-wrap gap-1">
                                                {Array.isArray(k.dinas) && k.dinas.length > 0 ? k.dinas.map((d, idx) => (
                                                    <span key={idx} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px] font-medium border border-slate-100">{d}</span>
                                                )) : typeof k.dinas === 'string' && k.dinas ? (
                                                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px] font-medium border border-slate-100">{k.dinas}</span>
                                                ) : <span className="text-slate-400 italic text-[11px]">Belum diampu</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 text-xs max-w-55 truncate">{k.deskripsi}</td>
                                        <td className="px-4 py-3">
                                            <span className="font-bold text-blue-700">{k.totalLaporan || 0}</span>
                                            <span className="text-slate-400 text-xs ml-1">laporan</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${k.aktif ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>{k.aktif ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                <button onClick={() => openModal(k, 'detail')} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><span className="material-symbols-outlined text-base">visibility</span></button>
                                                <button onClick={() => openModal(k, 'edit')} className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors"><span className="material-symbols-outlined text-base">edit</span></button>
                                                <button onClick={() => handleDelete(k)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><span className="material-symbols-outlined text-base">delete</span></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ===== MODAL DETAIL / EDIT / TAMBAH ===== */}
            {modal !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setModal(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                            <h2 className="font-bold text-slate-800 text-lg">
                                {modalMode === 'detail' ? 'Detail Kategori' : modalMode === 'edit' ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                            </h2>
                            <button onClick={() => setModal(null)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><span className="material-symbols-outlined">close</span></button>
                        </div>

                        {/* Scrollable Container Form */}
                        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
                            {modalMode !== 'detail' && (
                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                                    <div className={`w-14 h-14 ${editData.warna || 'bg-blue-500'} rounded-2xl flex items-center justify-center`}>
                                        <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>{editData.icon || 'category'}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Preview tampilan</p>
                                        <p className="font-bold text-slate-800">{editData.nama || 'Nama Kategori'}</p>
                                    </div>
                                </div>
                            )}

                            {modalMode === 'detail' && (
                                <div className={`flex items-center gap-4 p-5 ${modal.warna} rounded-2xl`}>
                                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>{modal.icon}</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-lg">{modal.nama}</p>
                                        <p className="text-white/70 text-xs">{modal.id}</p>
                                    </div>
                                </div>
                            )}

                            {modalMode !== 'detail' ? (
                                <>
                                    <div>
                                        <label className="text-xs text-slate-500 font-semibold block mb-1.5">Nama Kategori</label>
                                        <input type="text" value={editData.nama || ''} onChange={e => setEditData({ ...editData, nama: e.target.value })}
                                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-400" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 font-semibold block mb-1.5">Deskripsi</label>
                                        <textarea rows={3} value={editData.deskripsi || ''} onChange={e => setEditData({ ...editData, deskripsi: e.target.value })}
                                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-400 resize-none" />
                                    </div>

                                    <div>
                                        <label className="text-xs text-slate-500 font-semibold block mb-2">Pilih Ikon</label>
                                        <div className="flex flex-wrap gap-2">
                                            {ICONS.map(ic => (
                                                <button key={ic} onClick={() => setEditData({ ...editData, icon: ic })}
                                                    className={`w-9 h-9 rounded-xl flex items-center justify-center border-2 transition-all ${editData.icon === ic ? 'border-blue-500 bg-blue-50 scale-105' : 'border-slate-200 hover:border-blue-300'}`}>
                                                    <span className="material-symbols-outlined text-slate-600 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>{ic}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 font-semibold block mb-2">Pilih Warna</label>
                                        <div className="flex flex-wrap gap-2">
                                            {WARNA.map(w => (
                                                <button key={w} onClick={() => setEditData({ ...editData, warna: w })}
                                                    className={`w-8 h-8 ${w} rounded-xl transition-all ${editData.warna === w ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 font-semibold block mb-1.5">Status Aktif</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[true, false].map(v => (
                                                <button key={String(v)} onClick={() => setEditData({ ...editData, aktif: v })}
                                                    className={`py-2 rounded-xl text-sm font-semibold border-2 transition-all ${editData.aktif === v ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                                                    {v ? 'Aktif' : 'Nonaktif'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex flex-col gap-1 py-2 border-b border-slate-100 text-sm">
                                        <span className="text-slate-400">Dinas Pengampu Saat Ini</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {Array.isArray(modal.dinas) && modal.dinas.length > 0 ? modal.dinas.map((d, i) => (
                                                <span key={i} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs border border-blue-100 font-medium">{d}</span>
                                            )) : typeof modal.dinas === 'string' && modal.dinas ? (
                                                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs border border-blue-100 font-medium">{modal.dinas}</span>
                                            ) : <span className="text-xs text-slate-400 italic">Belum dipetakan oleh Dinas manapun</span>}
                                        </div>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                                        <span className="text-slate-400">Total Laporan Masuk</span><span className="font-bold text-blue-700">{modal.totalLaporan || 0}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-slate-100 text-sm">
                                        <span className="text-slate-400">Status</span>
                                        <span className={`font-semibold ${modal.aktif ? 'text-green-600' : 'text-slate-500'}`}>{modal.aktif ? 'Aktif' : 'Nonaktif'}</span>
                                    </div>
                                    <div className="py-2 text-sm">
                                        <p className="text-slate-400 mb-1">Deskripsi Kategori</p>
                                        <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">{modal.deskripsi || 'Tidak ada deskripsi.'}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 shrink-0 bg-slate-50/50">
                            <button onClick={() => setModal(null)} className="px-5 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-white transition-colors font-semibold bg-transparent">
                                {modalMode === 'detail' ? 'Tutup' : 'Batal'}
                            </button>
                            {modalMode !== 'detail' && (
                                <button onClick={handleSave} className="px-5 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-sm transition-colors">
                                    {modalMode === 'tambah' ? 'Tambahkan' : 'Simpan'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ===== DELETE CONFIRM MODAL ===== */}
            {deleteTarget !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>delete_forever</span>
                            </div>
                            <h3 className="font-bold text-slate-800 text-lg mb-2">Hapus Kategori?</h3>
                            <p className="text-sm text-slate-500 leading-relaxed mb-6">
                                Apakah Anda yakin ingin menghapus kategori <span className="font-semibold text-slate-700">"{deleteTarget.nama}"</span>? Tindakan ini tidak dapat dibatalkan.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button onClick={() => setDeleteTarget(null)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex-1 bg-transparent">
                                    Batal
                                </button>
                                <button onClick={confirmDelete} className="px-5 py-2.5 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex-1 shadow-lg shadow-red-600/20">
                                    Ya, Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
