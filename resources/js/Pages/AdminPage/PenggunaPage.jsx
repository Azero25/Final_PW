import React, { useEffect, useState } from 'react';
import AdminLayout from '../../Components/AdminLayout';
import api from '../../axios';

const WARNA_AVATAR = [
    'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500',
    'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-red-500',
];

const isImageUrl = (avatar) => {
    return avatar && (avatar.startsWith('/storage') || avatar.startsWith('http') || avatar.startsWith('data:image'));
};

const StatusBadge = ({ status }) => {
    const config = {
        'Aktif':    'bg-green-100 text-green-700 border border-green-200',
        'Nonaktif': 'bg-slate-100 text-slate-500 border border-slate-200',
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config[status] || 'bg-slate-100 text-slate-500'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            {status}
        </span>
    );
};

export default function PenggunaPage() {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    const [penggunaList, setPenggunaList] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch]               = useState('');
    const [filterStatus, setFilterStatus]   = useState('Semua');
    const [currentPage, setCurrentPage]     = useState(1);
    const [itemsPerPage, setItemsPerPage]   = useState(10);
    const [selectedIds, setSelectedIds]     = useState([]);
    const [modalUser, setModalUser]         = useState(null);
    const [modalMode, setModalMode]         = useState('detail'); // 'detail' | 'edit' | 'tambah' | 'delete' | 'bulkStatus' | 'bulkDelete'
    const [editData, setEditData]           = useState({});
    const [isSaving, setIsSaving]           = useState(false);
    const [bulkTargetStatus, setBulkTargetStatus] = useState('Aktif');
    const [showTambahPass, setShowTambahPass] = useState(false);

    const statusList = ['Semua', 'Aktif', 'Nonaktif'];

    // Load users from backend API
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/users');
            if (response.data && response.data.status === 'success') {
                setPenggunaList(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Filter & pencarian
    const filtered = penggunaList.filter((u) => {
        const q = search.toLowerCase();
        const matchSearch  = u.nama.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q);
        const matchStatus  = filterStatus === 'Semua' || u.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const activePage = Math.max(1, Math.min(currentPage, totalPages || 1));

    const toggleAll = () => setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map(u => u.id));
    const toggleOne = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

    const openModal = (user, mode = 'detail') => {
        setModalUser(user);
        setModalMode(mode);
        setEditData({ ...user });
    };

    const openTambah = () => {
        setModalUser({});
        setModalMode('tambah');
        setShowTambahPass(false);
        setEditData({ nama: '', email: '', telp: '', kelurahan: '', status: 'Aktif', role: 'warga', password: '' });
    };

    const openBulkStatusModal = () => {
        setModalUser({ id: 'BULK', nama: `${selectedIds.length} Pengguna` });
        setModalMode('bulkStatus');
        setBulkTargetStatus('Aktif');
    };

    const openBulkDeleteModal = () => {
        setModalUser({ id: 'BULK', nama: `${selectedIds.length} Pengguna` });
        setModalMode('bulkDelete');
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (modalMode === 'tambah') {
                const response = await api.post('/api/users', {
                    nama: editData.nama,
                    email: editData.email,
                    telp: editData.telp,
                    kelurahan: editData.kelurahan,
                    status: editData.status || 'Aktif',
                    role: editData.role || 'warga',
                    password: editData.password
                });
                if (response.data && response.data.status === 'success') {
                    await fetchUsers();
                    setModalUser(null);
                }
            } else if (modalMode === 'edit') {
                const targetId = editData.original_id || editData.id.replace('USR-', '');
                const response = await api.put(`/api/users/${targetId}`, {
                    nama: editData.nama,
                    email: editData.email,
                    telp: editData.telp,
                    kelurahan: editData.kelurahan,
                    role: editData.role || 'warga',
                    status: editData.status,
                    password: editData.password
                });
                if (response.data && response.data.status === 'success') {
                    await fetchUsers();
                    setModalUser(null);
                }
            }
        } catch (error) {
            console.error('Error saving user:', error);
            if (error.response && error.response.data && error.response.data.message) {
                alert(`Gagal menyimpan: ${error.response.data.message}`);
            } else {
                alert('Gagal menyimpan data pengguna.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!modalUser) return;

        setIsSaving(true);
        try {
            const id = modalUser.id;
            const targetId = modalUser.original_id || id.replace('USR-', '');
            const response = await api.delete(`/api/users/${targetId}`);

            if (response.data && response.data.status === 'success') {
                setPenggunaList(prev => prev.filter(u => u.id !== id));
                setSelectedIds(prev => prev.filter(i => i !== id));
                setModalUser(null);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Gagal menghapus pengguna.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleBulkStatusConfirm = async () => {
        setIsSaving(true);
        try {
            for (const id of selectedIds) {
                const user = penggunaList.find(u => u.id === id);
                if (user) {
                    const targetId = user.original_id || id.replace('USR-', '');
                    await api.patch(`/api/users/${targetId}/status`, { status: bulkTargetStatus });
                }
            }
            await fetchUsers();
            setSelectedIds([]);
            setModalUser(null);
        } catch (error) {
            console.error('Error updating bulk status:', error);
            alert('Gagal memperbarui status beberapa pengguna.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleBulkDeleteConfirm = async () => {
        setIsSaving(true);
        try {
            for (const id of selectedIds) {
                const user = penggunaList.find(u => u.id === id);
                if (user) {
                    const targetId = user.original_id || id.replace('USR-', '');
                    await api.delete(`/api/users/${targetId}`);
                }
            }
            await fetchUsers();
            setSelectedIds([]);
            setModalUser(null);
        } catch (error) {
            console.error('Error bulk deleting users:', error);
            alert('Gagal menghapus beberapa pengguna terpilih.');
        } finally {
            setIsSaving(false);
        }
    };

    // Ringkasan
    const ringkasan = [
        { label: 'Total Pengguna',  value: penggunaList.length, color: 'text-blue-600',  bg: 'bg-blue-50',  border: 'border-blue-100',  icon: 'group' },
        { label: 'Aktif',           value: penggunaList.filter(u => u.status === 'Aktif').length,    color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', icon: 'check_circle' },
        { label: 'Nonaktif',        value: penggunaList.filter(u => u.status === 'Nonaktif').length, color: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-200', icon: 'person_off' },
    ];

    return (
        <AdminLayout pageTitle="Manajemen Pengguna" pageSubtitle="Kelola akun warga yang terdaftar di sistem">

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
                    {/* Search */}
                    <div className="relative flex-1 min-w-45">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
                        <input
                            type="text"
                            placeholder="Cari nama, email, atau ID..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
                        />
                    </div>

                    {/* Filter Status */}
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

                    {/* Tombol Tambah */}
                    <button
                        onClick={openTambah}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors ml-auto"
                    >
                        <span className="material-symbols-outlined text-base">person_add</span>
                        Tambah Pengguna
                    </button>
                </div>

                {/* Bulk action bar */}
                {selectedIds.length > 0 && (
                    <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-4 flex-wrap">
                        <span className="text-sm font-semibold text-blue-700">{selectedIds.length} pengguna terpilih</span>

                        <button onClick={openBulkStatusModal} className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">edit</span>
                            Ubah Status Terpilih
                        </button>

                        <button onClick={openBulkDeleteModal} className="text-xs text-red-600 hover:underline font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">delete</span>
                            Hapus Terpilih
                        </button>

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
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Pengguna</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Kontak</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Kelurahan</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Total Laporan</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Bergabung</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-16 text-slate-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Memuat data pengguna...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-16 text-slate-400">
                                        <span className="material-symbols-outlined text-4xl block mb-2">person_search</span>
                                        Tidak ada pengguna ditemukan
                                    </td>
                                </tr>
                            ) : filtered.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage).map((u, idx) => (
                                <tr key={u.id} className={`hover:bg-slate-50 transition-colors ${selectedIds.includes(u.id) ? 'bg-blue-50/40' : ''}`}>
                                    <td className="px-4 py-3">
                                        <input type="checkbox" checked={selectedIds.includes(u.id)} onChange={() => toggleOne(u.id)} className="rounded" />
                                    </td>
                                    {/* Pengguna: Avatar + Nama + ID */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 ${WARNA_AVATAR[idx % WARNA_AVATAR.length]} rounded-full flex items-center justify-center shrink-0 overflow-hidden`}>
                                                {isImageUrl(u.avatar) ? (
                                                    <img src={u.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-white text-sm font-bold">{u.avatar}</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800 text-sm">{u.nama}</p>
                                                <p className="text-xs text-slate-400 font-mono">{u.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    {/* Kontak */}
                                    <td className="px-4 py-3">
                                        <p className="text-slate-700 text-xs">{u.email}</p>
                                        <p className="text-slate-400 text-xs mt-0.5">{u.telp}</p>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 text-xs">{u.kelurahan}</td>
                                    {/* Total Laporan */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-800 font-bold text-sm">{u.totalLaporan}</span>
                                            <span className="text-slate-400 text-xs">laporan</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{u.bergabung}</td>
                                    <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => openModal(u, 'detail')} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Lihat Detail">
                                                <span className="material-symbols-outlined text-base">visibility</span>
                                            </button>
                                            <button onClick={() => openModal(u, 'edit')} className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Edit Pengguna">
                                                <span className="material-symbols-outlined text-base">edit</span>
                                            </button>
                                            <button onClick={() => openModal(u, 'delete')} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus Pengguna">
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
                            Menampilkan {filtered.length > 0 ? (activePage - 1) * itemsPerPage + 1 : 0} - {Math.min(activePage * itemsPerPage, filtered.length)} dari {filtered.length} pengguna
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

            {/* ======== MODAL ======== */}
            {modalUser !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setModalUser(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                            <div>
                                <h2 className={`font-bold text-lg ${modalMode === 'delete' || modalMode === 'bulkDelete' ? 'text-red-600' : 'text-slate-800'}`}>
                                    {modalMode === 'detail' ? 'Detail Pengguna'
                                        : modalMode === 'edit' ? 'Edit Pengguna'
                                        : modalMode === 'delete' ? 'Konfirmasi Hapus Pengguna'
                                        : modalMode === 'bulkStatus' ? 'Ubah Status Terpilih'
                                        : modalMode === 'bulkDelete' ? 'Konfirmasi Hapus Massal'
                                        : 'Tambah Pengguna Baru'}
                                </h2>
                                {modalMode !== 'tambah' && modalMode !== 'bulkStatus' && modalMode !== 'bulkDelete' && modalUser.id && (
                                    <p className="text-xs text-slate-400 font-mono mt-0.5">{modalUser.id}</p>
                                )}
                                {(modalMode === 'bulkStatus' || modalMode === 'bulkDelete') && (
                                    <p className="text-xs text-blue-600 font-semibold mt-0.5">{selectedIds.length} Pengguna Dipilih</p>
                                )}
                            </div>
                            <button onClick={() => setModalUser(null)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5 space-y-4">
                            {modalMode === 'delete' ? (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="material-symbols-outlined text-3xl">warning</span>
                                    </div>
                                    <p className="text-slate-700">Apakah Anda yakin ingin menghapus pengguna <strong>{modalUser.nama}</strong>?</p>
                                    <p className="text-sm text-slate-500 mt-2">Tindakan ini tidak dapat dibatalkan dan semua data terkait pengguna ini akan hilang selamanya.</p>
                                </div>
                            ) : modalMode === 'bulkDelete' ? (
                                <div className="text-center space-y-3">
                                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="material-symbols-outlined text-3xl">warning</span>
                                    </div>
                                    <p className="text-slate-700">Apakah Anda yakin ingin menghapus <strong>{selectedIds.length} pengguna terpilih</strong>?</p>

                                    <div className="max-h-28 overflow-y-auto border border-slate-100 rounded-xl p-3 bg-slate-50 flex flex-wrap gap-1.5 text-left">
                                        {selectedIds.map(id => {
                                            const u = penggunaList.find(x => x.id === id);
                                            return u ? (
                                                <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-700">
                                                    {u.nama}
                                                </span>
                                            ) : null;
                                        })}
                                    </div>

                                    <p className="text-sm text-slate-500">Tindakan ini tidak dapat dibatalkan dan seluruh akun terpilih akan terhapus selamanya dari sistem.</p>
                                </div>
                            ) : modalMode === 'bulkStatus' ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                            <span className="material-symbols-outlined text-xl">group</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">Perubahan Status Massal</p>
                                            <p className="text-xs text-slate-500">Menerapkan status baru ke {selectedIds.length} pengguna sekaligus.</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-slate-500 font-semibold block mb-2">Pilih Status Baru</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['Aktif', 'Nonaktif'].map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => setBulkTargetStatus(s)}
                                                    className={`py-3 rounded-xl text-xs font-semibold border-2 transition-all flex flex-col items-center justify-center gap-1.5
                                                        ${bulkTargetStatus === s
                                                            ? s === 'Aktif' ? 'border-green-500 bg-green-50/50 text-green-700'
                                                              : 'border-slate-500 bg-slate-50 text-slate-700'
                                                            : 'border-slate-100 text-slate-500 hover:border-blue-300 hover:bg-slate-50'}`}
                                                >
                                                    <span className={`w-2.5 h-2.5 rounded-full ${s === 'Aktif' ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-slate-500 font-semibold block mb-1.5">Daftar Pengguna Terpengaruh</label>
                                        <div className="max-h-28 overflow-y-auto border border-slate-100 rounded-xl p-3 bg-slate-50 flex flex-wrap gap-1.5">
                                            {selectedIds.map(id => {
                                                const u = penggunaList.find(x => x.id === id);
                                                return u ? (
                                                    <span key={id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-sm">
                                                        {u.nama}
                                                    </span>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Avatar besar (detail/edit) */}
                                    {modalMode !== 'tambah' && (
                                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                                            <div className={`w-14 h-14 ${WARNA_AVATAR[penggunaList.findIndex(u => u.id === modalUser.id) % WARNA_AVATAR.length] || 'bg-blue-500'} rounded-2xl flex items-center justify-center overflow-hidden`}>
                                                {isImageUrl(modalUser.avatar) ? (
                                                    <img src={modalUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-white text-xl font-bold">{modalUser.avatar}</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{modalUser.nama}</p>
                                                <p className="text-xs text-slate-400 font-mono">{modalUser.id}</p>
                                                <StatusBadge status={modalUser.status} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Form fields */}
                                    {['nama', 'email', 'telp', 'kelurahan'].map((field) => (
                                        <div key={field}>
                                            <label className="text-xs text-slate-500 font-semibold block mb-1.5 capitalize">{field === 'telp' ? 'No. Telepon' : field.charAt(0).toUpperCase() + field.slice(1)}</label>
                                            {modalMode === 'detail' ? (
                                                <p className="text-sm text-slate-800 font-medium px-3 py-2 bg-slate-50 rounded-lg">{modalUser[field] || '-'}</p>
                                            ) : (
                                                <input
                                                    type={field === 'email' ? 'email' : 'text'}
                                                    value={editData[field] || ''}
                                                    onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
                                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
                                                />
                                            )}
                                        </div>
                                    ))}

                                    {/* Role */}
                                    {modalMode === 'tambah' && (
                                        <div>
                                            <label className="text-xs text-slate-500 font-semibold block mb-1.5">Pilih Peran (Role)</label>
                                            <select
                                                value={editData.role || 'warga'}
                                                onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors bg-white font-medium text-slate-850"
                                            >
                                                <option value="warga">Warga (Citizen)</option>
                                                <option value="admin">Admin (Administrator)</option>
                                            </select>
                                        </div>
                                    )}

                                    {modalMode === 'edit' && (
                                        <div>
                                            <label className="text-xs text-slate-500 font-semibold block mb-1.5">Pilih Peran (Role)</label>
                                            <select
                                                value={editData.role || 'warga'}
                                                onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors bg-white font-medium text-slate-850"
                                            >
                                                <option value="warga">Warga (Citizen)</option>
                                                <option value="admin">Admin (Administrator)</option>
                                            </select>
                                        </div>
                                    )}

                                    {/* Password */}
                                    {modalMode === 'tambah' && (
                                        <div>
                                            <label className="text-xs text-slate-500 font-semibold block mb-1.5">Kata Sandi (Password)</label>
                                            <div className="relative">
                                                <input
                                                    type={showTambahPass ? "text" : "password"}
                                                    value={editData.password || ''}
                                                    onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                                                    placeholder="Minimal 8 karakter"
                                                    className="w-full pl-3 pr-10 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors font-medium text-slate-800"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowTambahPass(!showTambahPass)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                                                >
                                                    <span className="material-symbols-outlined text-lg select-none">
                                                        {showTambahPass ? 'visibility_off' : 'visibility'}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {modalMode === 'edit' && (
                                        <div>
                                            <label className="text-xs text-slate-500 font-semibold block mb-1.5">Kata Sandi (Password)</label>
                                            <div className="relative">
                                                <input
                                                    type={showTambahPass ? "text" : "password"}
                                                    value={editData.password || ''}
                                                    onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                                                    placeholder="Minimal 8 karakter"
                                                    className="w-full pl-3 pr-10 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors font-medium text-slate-800"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowTambahPass(!showTambahPass)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                                                >
                                                    <span className="material-symbols-outlined text-lg select-none">
                                                        {showTambahPass ? 'visibility_off' : 'visibility'}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Status (khusus edit) */}
                                    {modalMode === 'edit' && (
                                        <div>
                                            <label className="text-xs text-slate-500 font-semibold block mb-1.5">Status Akun</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['Aktif', 'Nonaktif'].map((s) => (
                                                    <button
                                                        key={s}
                                                        onClick={() => setEditData({ ...editData, status: s })}
                                                        className={`py-2 rounded-xl text-xs font-semibold border-2 transition-all
                                                            ${editData.status === s
                                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                                : 'border-slate-200 text-slate-500 hover:border-blue-300'}`}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Info tambahan (detail) */}
                                    {modalMode === 'detail' && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 bg-blue-50 rounded-xl text-center">
                                                <p className="text-2xl font-bold text-blue-700">{modalUser.totalLaporan}</p>
                                                <p className="text-xs text-blue-500 mt-0.5">Total Laporan</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 rounded-xl text-center">
                                                <p className="text-sm font-bold text-slate-700">{modalUser.bergabung}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">Tanggal Bergabung</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
                            <button disabled={isSaving} onClick={() => setModalUser(null)} className="px-5 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-white transition-colors font-semibold bg-transparent">
                                {modalMode === 'detail' ? 'Tutup' : 'Batal'}
                            </button>

                            {(modalMode === 'tambah' || modalMode === 'edit') && (
                                <button disabled={isSaving} onClick={handleSave} className="px-5 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50">
                                    {isSaving ? 'Menyimpan...' : modalMode === 'tambah' ? 'Tambahkan' : 'Simpan Perubahan'}
                                </button>
                            )}

                            {modalMode === 'delete' && (
                                <button
                                    disabled={isSaving}
                                    onClick={handleDeleteConfirm}
                                    className="px-5 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSaving ? 'Menghapus...' : 'Ya, Hapus Pengguna'}
                                </button>
                            )}

                            {modalMode === 'bulkStatus' && (
                                <button
                                    disabled={isSaving}
                                    onClick={handleBulkStatusConfirm}
                                    className="px-5 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSaving ? 'Memperbarui...' : 'Perbarui Status'}
                                </button>
                            )}

                            {modalMode === 'bulkDelete' && (
                                <button
                                    disabled={isSaving}
                                    onClick={handleBulkDeleteConfirm}
                                    className="px-5 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSaving ? 'Menghapus...' : `Ya, Hapus ${selectedIds.length} Pengguna`}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </AdminLayout>
    );
}
