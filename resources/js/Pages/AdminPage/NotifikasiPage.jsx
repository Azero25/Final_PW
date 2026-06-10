import React, { useEffect, useState } from 'react';
import AdminLayout from '../../Components/AdminLayout';
import api from '../../axios';

const TIPE_CONFIG = {
    laporan:    { icon: 'assignment',    bg: 'bg-blue-100',    color: 'text-blue-600',   label: 'Laporan Baru',   dot: 'bg-blue-500'   },
    update:     { icon: 'update',        bg: 'bg-green-100',   color: 'text-green-600',  label: 'Update Status',  dot: 'bg-green-500'  },
    pengguna:   { icon: 'person',        bg: 'bg-purple-100',  color: 'text-purple-600', label: 'Pengguna',       dot: 'bg-purple-500' },
    darurat:    { icon: 'emergency',     bg: 'bg-red-100',     color: 'text-red-600',    label: 'Darurat',        dot: 'bg-red-500'    },
    peringatan: { icon: 'warning',       bg: 'bg-yellow-100',  color: 'text-yellow-600', label: 'Peringatan',     dot: 'bg-yellow-500' },
    petugas:    { icon: 'badge',         bg: 'bg-orange-100',  color: 'text-orange-600', label: 'Petugas',        dot: 'bg-orange-500' },
    sistem:     { icon: 'settings',      bg: 'bg-slate-100',   color: 'text-slate-600',  label: 'Sistem',         dot: 'bg-slate-400'  },
};

export default function NotifikasiPage() {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    const [notifs, setNotifs] = useState(() => {
        const stored = localStorage.getItem('admin_notifications');
        return stored ? JSON.parse(stored) : [];
    });

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/api/notifications');
            setNotifs(response.data);
            localStorage.setItem('admin_notifications', JSON.stringify(response.data));
        } catch (error) {
            console.error("Gagal mengambil data notifikasi:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();

        const syncNotifs = () => {
            const stored = localStorage.getItem('admin_notifications');
            if (stored) setNotifs(JSON.parse(stored));
        };
        window.addEventListener('notificationsUpdated', syncNotifs);
        return () => window.removeEventListener('notificationsUpdated', syncNotifs);
    }, []);

    const [filterTipe, setFilterTipe] = useState('Semua');
    const [filterBaca, setFilterBaca] = useState('Semua'); // 'Semua' | 'Belum Dibaca' | 'Sudah Dibaca'
    const [search, setSearch] = useState('');

    // Tandai semua sudah dibaca
    const tandaiSemuaDibaca = async () => {
        try {
            await api.put('/api/notifications/read-all');
            const updated = notifs.map(n => ({ ...n, dibaca: true }));
            setNotifs(updated);
            localStorage.setItem('admin_notifications', JSON.stringify(updated));
            window.dispatchEvent(new Event('notificationsUpdated'));
        } catch (error) {
            console.error("Gagal menandai semua dibaca:", error);
        }
    };

    // Tandai satu
    const tandaiSatu = async (id) => {
        try {
            await api.put(`/api/notifications/${id}/read`);
            const updated = notifs.map(n => n.id === id ? { ...n, dibaca: true } : n);
            setNotifs(updated);
            localStorage.setItem('admin_notifications', JSON.stringify(updated));
            window.dispatchEvent(new Event('notificationsUpdated'));
        } catch (error) {
            console.error("Gagal menandai dibaca:", error);
        }
    };

    // Hapus satu
    const hapusSatu = async (id) => {
        try {
            await api.delete(`/api/notifications/${id}`);
            const updated = notifs.filter(n => n.id !== id);
            setNotifs(updated);
            localStorage.setItem('admin_notifications', JSON.stringify(updated));
            window.dispatchEvent(new Event('notificationsUpdated'));
        } catch (error) {
            console.error("Gagal menghapus notifikasi:", error);
        }
    };

    // Hapus semua yang sudah dibaca
    const hapusDibaca = async () => {
        try {
            await api.delete('/api/notifications/delete-read');
            const updated = notifs.filter(n => !n.dibaca);
            setNotifs(updated);
            localStorage.setItem('admin_notifications', JSON.stringify(updated));
            window.dispatchEvent(new Event('notificationsUpdated'));
        } catch (error) {
            console.error("Gagal menghapus notifikasi dibaca:", error);
        }
    };

    const belumDibaca = notifs.filter(n => !n.dibaca).length;

    const filtered = notifs.filter(n => {
        const matchTipe = filterTipe === 'Semua' || n.tipe === filterTipe;
        const matchBaca = filterBaca === 'Semua' || (filterBaca === 'Belum Dibaca' ? !n.dibaca : n.dibaca);
        const matchQ    = n.judul.toLowerCase().includes(search.toLowerCase()) || n.isi.toLowerCase().includes(search.toLowerCase());
        return matchTipe && matchBaca && matchQ;
    });

    const ringkasan = [
        { label: 'Total',         value: notifs.length,                                         bg: 'bg-blue-50',    color: 'text-blue-600',   border: 'border-blue-100',   icon: 'notifications' },
        { label: 'Belum Dibaca',  value: belumDibaca,                                            bg: 'bg-red-50',     color: 'text-red-600',    border: 'border-red-100',    icon: 'mark_unread_chat_alt' },
        { label: 'Darurat',       value: notifs.filter(n => n.tipe === 'darurat').length,        bg: 'bg-orange-50',  color: 'text-orange-600', border: 'border-orange-100', icon: 'emergency' },
        { label: 'Sistem',        value: notifs.filter(n => n.tipe === 'sistem').length,         bg: 'bg-slate-100',  color: 'text-slate-600',  border: 'border-slate-200',  icon: 'settings' },
    ];

    return (
        <AdminLayout pageTitle="Notifikasi" pageSubtitle="Pusat pemberitahuan aktivitas sistem">

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

            {/* Area Notifikasi */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

                {/* Toolbar */}
                <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 min-w-45">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
                        <input type="text" placeholder="Cari notifikasi..." value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400" />
                    </div>

                    {/* Filter Tipe */}
                    <select value={filterTipe} onChange={e => setFilterTipe(e.target.value)}
                        className="text-sm border border-slate-200 rounded-xl px-3 py-2 text-slate-600 bg-white focus:outline-none focus:border-blue-400">
                        <option value="Semua">Semua Tipe</option>
                        {Object.keys(TIPE_CONFIG).map(t => <option key={t} value={t}>{TIPE_CONFIG[t].label}</option>)}
                    </select>

                    {/* Filter Baca */}
                    <select value={filterBaca} onChange={e => setFilterBaca(e.target.value)}
                        className="text-sm border border-slate-200 rounded-xl px-3 py-2 text-slate-600 bg-white focus:outline-none focus:border-blue-400">
                        {['Semua', 'Belum Dibaca', 'Sudah Dibaca'].map(s => <option key={s}>{s}</option>)}
                    </select>

                    {/* Aksi massal */}
                    <div className="flex gap-2 ml-auto">
                        {belumDibaca > 0 && (
                            <button onClick={tandaiSemuaDibaca}
                                className="flex items-center gap-1.5 px-3 py-2 text-sm text-blue-600 border border-blue-200 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors font-semibold">
                                <span className="material-symbols-outlined text-base">done_all</span>
                                Tandai Semua Dibaca
                            </button>
                        )}
                        <button onClick={hapusDibaca}
                            className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 border border-red-100 bg-red-50 rounded-xl hover:bg-red-100 transition-colors font-semibold">
                            <span className="material-symbols-outlined text-base">delete_sweep</span>
                            Hapus Sudah Dibaca
                        </button>
                    </div>
                </div>

                {/* Filter chip cepat */}
                <div className="px-6 py-3 border-b border-slate-50 flex gap-2 flex-wrap">
                    {['Semua', ...Object.keys(TIPE_CONFIG)].map(t => {
                        const cfg = TIPE_CONFIG[t];
                        const isActive = filterTipe === t;
                        return (
                            <button key={t} onClick={() => setFilterTipe(t)}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border
                                    ${isActive
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'}`}>
                                {cfg && <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>}
                                {cfg ? cfg.label : 'Semua'}
                            </button>
                        );
                    })}
                </div>

                {/* Daftar Notifikasi */}
                <div className="divide-y divide-slate-50">
                    {filtered.length === 0 ? (
                        <div className="text-center py-20 text-slate-400">
                            <span className="material-symbols-outlined text-5xl block mb-3">notifications_off</span>
                            <p className="font-semibold">Tidak ada notifikasi</p>
                            <p className="text-xs mt-1">Coba ubah filter atau kata kunci pencarian</p>
                        </div>
                    ) : filtered.map(n => {
                        const cfg = TIPE_CONFIG[n.tipe] || TIPE_CONFIG.sistem;
                        return (
                            <div key={n.id}
                                className={`flex items-start gap-4 px-6 py-4 transition-colors group ${!n.dibaca ? 'bg-blue-50/40 hover:bg-blue-50' : 'hover:bg-slate-50'}`}>

                                {/* Dot belum dibaca */}
                                <div className="shrink-0 mt-1.5">
                                    {!n.dibaca
                                        ? <span className={`block w-2.5 h-2.5 rounded-full ${cfg.dot}`}></span>
                                        : <span className="block w-2.5 h-2.5 rounded-full bg-transparent"></span>}
                                </div>

                                {/* Icon tipe */}
                                <div className={`w-10 h-10 ${cfg.bg} rounded-xl flex items-center justify-center shrink-0`}>
                                    <span className={`material-symbols-outlined text-xl ${cfg.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
                                </div>

                                {/* Konten */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className={`text-sm font-semibold ${!n.dibaca ? 'text-slate-900' : 'text-slate-700'}`}>{n.judul}</p>
                                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.isi}</p>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <span className="text-xs text-slate-400 whitespace-nowrap">{n.waktu}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                                        {!n.dibaca && (
                                            <button onClick={() => tandaiSatu(n.id)} className="text-xs text-blue-600 hover:underline font-semibold">
                                                Tandai dibaca
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Tombol hapus (muncul saat hover) */}
                                <button onClick={() => hapusSatu(n.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0">
                                    <span className="material-symbols-outlined text-base">close</span>
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs text-slate-500">Menampilkan {filtered.length} dari {notifs.length} notifikasi</p>
                    <div className="flex gap-1">
                        <button className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg">Sebelumnya</button>
                        <button className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg">1</button>
                        <button className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg">Berikutnya</button>
                    </div>
                </div>
            </div>

        </AdminLayout>
    );
}
