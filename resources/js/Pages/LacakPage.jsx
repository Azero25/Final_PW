import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

/**
 * Komponen Halaman Lacak Tiket
 * Memungkinkan warga melacak status pengaduan mereka berdasarkan nomor tiket.
 */
export default function LacakPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [nomorTiket, setNomorTiket] = useState('');
    const [hasilLacak, setHasilLacak] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Fungsi untuk menangani pencarian tiket
    const handleLacak = async (e) => {
        e.preventDefault();
        setError('');
        setHasilLacak(null);

        if (!nomorTiket.trim()) {
            setError('Nomor tiket tidak boleh kosong.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/pengaduans/${nomorTiket.trim().toUpperCase()}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Nomor tiket tidak ditemukan. Pastikan nomor tiket yang Anda masukkan sudah benar.');
                }
                throw new Error('Terjadi kesalahan pada server.');
            }

            const data = await response.json();
            
            // pastikan timeline valid
            if (!data.timeline || !Array.isArray(data.timeline)) {
                data.timeline = [];
            }
            // tambahkan fallback pending step jika sudah tidak Selesai
            if (data.status !== 'Selesai' && data.timeline.length > 0) {
                data.timeline.push({ 
                    tanggal: '-', 
                    status: 'Selesai', 
                    keterangan: 'Menunggu penyelesaian pekerjaan di lapangan.', 
                    icon: 'task_alt', 
                    color: 'text-slate-300', 
                    pending: true 
                });
            }

            setHasilLacak(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
            {/* Navbar Bersama */}
            <Navbar />

            {/* Hero Section */}
            <section className="pt-24 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <div className="max-w-4xl mx-auto px-6 py-16 text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                        <span className="material-symbols-outlined text-base">manage_search</span>
                        Lacak Status Pengaduan
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-4 leading-tight">
                        Pantau Progres <span className="text-primary">Laporan Anda</span>
                    </h1>
                    <p className="text-slate-500 text-lg mb-10 max-w-2xl mx-auto">
                        Masukkan nomor tiket pengaduan Anda untuk melihat status terkini dan riwayat penanganan laporan secara real-time.
                    </p>

                    {/* Form Pencarian Tiket */}
                    <form onSubmit={handleLacak} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
                        <div className="relative flex-grow">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">confirmation_number</span>
                            <input
                                type="text"
                                value={nomorTiket}
                                onChange={(e) => setNomorTiket(e.target.value)}
                                placeholder="Contoh: LPW-2024-001234"
                                className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-primary transition-colors text-base bg-white shadow-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-8 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-[0px_4px_20px_rgba(0,102,204,0.3)] hover:shadow-[0px_6px_24px_rgba(0,102,204,0.4)] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Mencari...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-xl">search</span>
                                    Lacak Sekarang
                                </>
                            )}
                        </button>
                    </form>

                    {/* Pesan Error */}
                    {error && (
                        <div className="mt-4 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl max-w-2xl mx-auto text-left">
                            <span className="material-symbols-outlined text-red-500 flex-shrink-0">error</span>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Contoh Nomor Tiket untuk Demo */}
                    <p className="mt-4 text-sm text-slate-400">
                        Coba tiket demo:{' '}
                        <button onClick={() => setNomorTiket('LPW-2024-001234')} className="text-primary underline hover:text-blue-700 font-medium">LPW-2024-001234</button>
                        {' '}atau{' '}
                        <button onClick={() => setNomorTiket('LPW-2024-005678')} className="text-primary underline hover:text-blue-700 font-medium">LPW-2024-005678</button>
                    </p>
                </div>
            </section>

            {/* Hasil Lacak */}
            {hasilLacak && (
                <section className="max-w-4xl mx-auto px-6 py-12 w-full">
                    {/* Header Status Tiket */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden mb-6">
                        <div className="bg-gradient-to-r from-primary to-blue-600 p-6 text-white">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <p className="text-blue-200 text-sm font-medium mb-1">Nomor Tiket</p>
                                    <h2 className="text-2xl font-bold tracking-wider">{hasilLacak.nomorTiket}</h2>
                                </div>
                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border self-start sm:self-auto ${hasilLacak.statusColor}`}>
                                    <span className="w-2 h-2 rounded-full bg-current"></span>
                                    {hasilLacak.status}
                                </span>
                            </div>
                        </div>

                        {/* Detail Laporan */}
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-slate-800 mb-4">{hasilLacak.judul}</h3>
                            <p className="text-slate-500 text-sm mb-6 leading-relaxed">{hasilLacak.deskripsi}</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Kategori', value: hasilLacak.kategori, icon: 'category' },
                                    { label: 'Kecamatan', value: hasilLacak.kecamatan, icon: 'location_on' },
                                    { label: 'Tanggal Dibuat', value: hasilLacak.tanggalDibuat, icon: 'calendar_today' },
                                    { label: 'Prioritas', value: hasilLacak.prioritas, icon: 'priority_high' },
                                ].map((item) => (
                                    <div key={item.label} className="bg-slate-50 rounded-xl p-4">
                                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                                            <span className="material-symbols-outlined text-base">{item.icon}</span>
                                            <p className="text-xs font-medium uppercase tracking-wide">{item.label}</p>
                                        </div>
                                        <p className="font-semibold text-slate-700 text-sm">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Info Petugas */}
                        <div className="px-6 pb-6">
                            <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-4 border border-blue-100">
                                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                                </div>
                                <div>
                                    <p className="text-xs text-blue-500 font-medium uppercase tracking-wide mb-0.5">Petugas yang Ditugaskan</p>
                                    <p className="font-bold text-slate-800">{hasilLacak.petugas}</p>
                                    <p className="text-xs text-slate-500">{hasilLacak.dinas}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Status */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">timeline</span>
                            Riwayat Penanganan
                        </h3>
                        <div className="relative">
                            {hasilLacak.timeline.map((item, index) => (
                                <div key={index} className="flex gap-5 relative">
                                    {/* Garis vertikal */}
                                    {index < hasilLacak.timeline.length - 1 && (
                                        <div className={`absolute left-5 top-10 bottom-0 w-0.5 ${item.pending ? 'border-l-2 border-dashed border-slate-200' : 'bg-slate-200'}`}></div>
                                    )}
                                    {/* Icon */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${item.pending ? 'bg-slate-100' : 'bg-white border-2 border-slate-200'}`}>
                                        <span className={`material-symbols-outlined text-lg ${item.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                                    </div>
                                    {/* Konten */}
                                    <div className={`pb-8 flex-grow ${item.pending ? 'opacity-40' : ''}`}>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                                            <p className="font-bold text-slate-800">{item.status}</p>
                                            <span className="hidden sm:block text-slate-300">•</span>
                                            <p className="text-xs text-slate-400">{item.tanggal}</p>
                                        </div>
                                        <p className="text-sm text-slate-500 leading-relaxed">{item.keterangan}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Info Section (tampil saat belum ada hasil) */}
            {!hasilLacak && !isLoading && (
                <section className="max-w-4xl mx-auto px-6 py-12 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: 'confirmation_number', title: 'Cek Nomor Tiket', desc: 'Temukan nomor tiket di email konfirmasi yang dikirim saat Anda membuat laporan.', color: 'text-blue-500', bg: 'bg-blue-50' },
                            { icon: 'timeline', title: 'Pantau Progress', desc: 'Lihat setiap tahap penanganan laporan Anda secara real-time dan transparan.', color: 'text-green-500', bg: 'bg-green-50' },
                            { icon: 'notifications_active', title: 'Notifikasi Update', desc: 'Dapatkan pembaruan status laporan langsung ke email atau nomor HP Anda.', color: 'text-purple-500', bg: 'bg-purple-50' },
                        ].map((item) => (
                            <div key={item.title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow text-center">
                                <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                                    <span className={`material-symbols-outlined text-2xl ${item.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                                </div>
                                <h3 className="font-bold text-slate-800 mb-2">{item.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Footer */}
            <Footer />
        </div>
    );
}
