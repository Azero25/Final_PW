import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

/**
 * Komponen Halaman Lacak Tiket
 * Memungkinkan warga melacak status pengaduan mereka berdasarkan nomor tiket.
 */
export default function LacakPage() {
    const location = useLocation();
    const [nomorTiket, setNomorTiket] = useState('');
    const [searchBy, setSearchBy] = useState('tiket'); // 'tiket' atau 'judul'
    const [hasilList, setHasilList] = useState(null); // daftar laporan jika cari berdasarkan judul
    const [hasilLacak, setHasilLacak] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [lightboxImg, setLightboxImg] = useState(null); // URL gambar fullscreen

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

    const processLaporanData = (data) => {
        if (!data.timeline || !Array.isArray(data.timeline)) {
            data.timeline = [];
        }
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
    };

    const performSearch = async (query, by = searchBy) => {
        setError('');
        setHasilLacak(null);
        setHasilList(null);

        if (!query || !query.trim()) {
            setError(by === 'tiket' ? 'Nomor tiket tidak boleh kosong.' : 'Judul laporan tidak boleh kosong.');
            return;
        }

        setIsLoading(true);
        try {
            if (by === 'tiket') {
                const response = await fetch(`/api/pengaduans/${query.trim().toUpperCase()}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Nomor tiket tidak ditemukan. Pastikan nomor tiket yang Anda masukkan sudah benar.');
                    }
                    throw new Error('Terjadi kesalahan pada server.');
                }
                const data = await response.json();
                processLaporanData(data);
            } else {
                // Pencarian berdasarkan Judul
                const response = await fetch(`/api/pengaduans?judul=${encodeURIComponent(query.trim())}`);
                if (!response.ok) throw new Error('Terjadi kesalahan pada server.');

                const data = await response.json();
                if (data.length === 0) {
                    throw new Error('Tidak ada laporan ditemukan dengan judul tersebut.');
                } else if (data.length === 1) {
                    processLaporanData(data[0]);
                } else {
                    setHasilList(data);
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        // Cek query string ?tiket=...
        const searchParams = new URLSearchParams(location.search);
        const tiketFromQuery = searchParams.get('tiket');
        if (tiketFromQuery) {
            setSearchBy('tiket');
            setNomorTiket(tiketFromQuery);
            performSearch(tiketFromQuery, 'tiket');
        }
    }, [location.search]);

    const handleLacak = async (e) => {
        e.preventDefault();
        performSearch(nomorTiket);
    };

    return (
        <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
            {/* Navbar Bersama */}
            <Navbar />

            {/* Hero Section */}
            <section className="pt-24 bg-linear-to-br from-blue-50 via-white to-indigo-50">
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
                    <form onSubmit={handleLacak} className="flex flex-col sm:flex-row gap-3 max-w-4xl mx-auto">
                        <div className="relative grow flex shadow-sm rounded-xl overflow-hidden border-2 border-slate-200 focus-within:border-primary transition-colors bg-white">
                            <div className='relative'>
                                <select
                                    value={searchBy}
                                    onChange={(e) => setSearchBy(e.target.value)}
                                    className="appearance-none bg-slate-50 border-r border-slate-200 text-slate-600 px-4 pr-10 py-4 focus:outline-none font-medium cursor-pointer"
                                >
                                    <option value="tiket">Nomor Tiket</option>
                                    <option value="judul">Judul Laporan</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    keyboard_arrow_down
                                </span>
                            </div>
                            <div className="relative grow">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                    {searchBy === 'tiket' ? 'confirmation_number' : 'text_fields'}
                                </span>
                                <input
                                    type="text"
                                    value={nomorTiket}
                                    onChange={(e) => setNomorTiket(e.target.value)}
                                    placeholder={searchBy === 'tiket' ? "Contoh: LPW-2024-001234" : "Contoh: Jalan Berlubang"}
                                    className="w-full pl-12 pr-4 py-4 text-slate-700 placeholder:text-slate-400 focus:outline-none text-base bg-transparent"
                                />
                            </div>
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
                            <span className="material-symbols-outlined text-red-500 shrink-0">error</span>
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
                        <div className="bg-linear-to-r from-primary to-blue-600 p-6 text-white">
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

                            {/* ===== Bukti Lampiran Foto (gallery multi-gambar) ===== */}
                            {(() => {
                                // Normalisasi: gabungkan bukti_foto & gambar array dan hapus duplikat menggunakan Set
                                const imgs = Array.from(new Set([
                                    ...(hasilLacak.gambar && Array.isArray(hasilLacak.gambar) ? hasilLacak.gambar : []),
                                    ...(hasilLacak.bukti_foto ? [hasilLacak.bukti_foto] : [])
                                ])).filter(Boolean);

                                if (imgs.length === 0) return null;

                                return (
                                    <div className="mb-6">
                                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-3 flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-sm">photo_library</span>
                                            Bukti Lampiran Foto
                                            <span className="ml-1 bg-blue-100 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{imgs.length} foto</span>
                                        </p>

                                        {imgs.length === 1 ? (
                                            /* ---- Tampilan 1 gambar ---- */
                                            <div
                                                className="relative rounded-2xl overflow-hidden border border-slate-100 max-w-md shadow-sm group cursor-zoom-in"
                                                onClick={() => setLightboxImg(getImageUrl(imgs[0]))}
                                            >
                                                <img src={getImageUrl(imgs[0])} alt="Bukti Lampiran" className="w-full object-cover max-h-72 group-hover:scale-105 transition-transform duration-300" />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-white text-3xl opacity-0 group-hover:opacity-100 drop-shadow-lg transition-opacity">zoom_in</span>
                                                </div>
                                                <div className="absolute top-2 left-2 bg-blue-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shadow tracking-wide">WebP</div>
                                            </div>
                                        ) : (
                                            /* ---- Grid multi-gambar ---- */
                                            <div className={`grid gap-2 ${
                                                imgs.length === 2 ? 'grid-cols-2' :
                                                imgs.length === 3 ? 'grid-cols-3' :
                                                'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                                            }`}>
                                                {imgs.map((src, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="relative group rounded-xl overflow-hidden border border-slate-100 shadow-sm cursor-zoom-in aspect-square"
                                                        onClick={() => setLightboxImg(getImageUrl(src))}
                                                    >
                                                        <img src={getImageUrl(src)} alt={`Bukti ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-white text-2xl opacity-0 group-hover:opacity-100 drop-shadow-lg transition-opacity">zoom_in</span>
                                                        </div>
                                                        <div className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shadow tracking-wide">WebP</div>
                                                        <div className="absolute bottom-1.5 right-1.5 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded font-medium">{idx + 1}/{imgs.length}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

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
                                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shrink-0">
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
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 ${item.pending ? 'bg-slate-100' : 'bg-white border-2 border-slate-200'}`}>
                                        <span className={`material-symbols-outlined text-lg ${item.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                                    </div>
                                    {/* Konten */}
                                    <div className={`pb-8 grow ${item.pending ? 'opacity-40' : ''}`}>
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

            {/* Lightbox Modal */}
            {lightboxImg && (
                <div
                    className="fixed inset-0 z-200 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                    onClick={() => setLightboxImg(null)}
                >
                    <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
                        <img
                            src={lightboxImg}
                            alt="Bukti Lampiran"
                            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
                        />
                        <button
                            onClick={() => setLightboxImg(null)}
                            className="absolute top-3 right-3 w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium">
                            Klik di luar untuk menutup
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <Footer />
        </div>
    );
}
