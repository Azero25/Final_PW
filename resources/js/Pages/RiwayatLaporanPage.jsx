import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import api from '../utils/api'; // Menggunakan instance axios api

export default function RiwayatLaporanPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [laporanList, setLaporanList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('Semua');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;
    
    // State Modal Lacak Detail
    const [selectedLaporan, setSelectedLaporan] = useState(null);
    const [timelineData, setTimelineData] = useState([]);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const statusConfig = {
        'Laporan Diterima': { color: 'bg-blue-50 text-blue-700 border-blue-100', icon: 'assignment', badge: 'bg-blue-500' },
        'Verifikasi': { color: 'bg-yellow-50 text-yellow-700 border-yellow-100', icon: 'pending_actions', badge: 'bg-yellow-500' },
        'Sedang Diproses': { color: 'bg-orange-50 text-orange-700 border-orange-100', icon: 'engineering', badge: 'bg-orange-500' },
        'Selesai': { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: 'task_alt', badge: 'bg-emerald-500' },
        'Ditolak': { color: 'bg-red-50 text-red-700 border-red-100', icon: 'cancel', badge: 'bg-red-500' },
    };

    useEffect(() => {
        window.scrollTo(0, 0);

        const sesi = sessionStorage.getItem('user');
        if (!sesi) {
            navigate('/login');
            return;
        }

        const activeUser = JSON.parse(sesi);
        setUser(activeUser);

        // Fetch user's report history
        const fetchRiwayat = async () => {
            try {
                const response = await fetch('/api/pengaduans');
                if (!response.ok) throw new Error('Gagal mengambil data pengaduan');
                const data = await response.json();
                
                // Cari profil kustom untuk memastikan pencocokan nama
                const storedProfile = localStorage.getItem(`profile_${activeUser.email}`);
                const profileName = storedProfile ? JSON.parse(storedProfile).nama : activeUser.nama;

                // Filter pengaduan berdasarkan nama pembuat
                const userLaporan = data.filter(item => 
                    item.nama?.trim().toLowerCase() === profileName?.trim().toLowerCase() ||
                    item.email?.trim().toLowerCase() === activeUser.email?.trim().toLowerCase()
                );

                // Format data laporan
                const formatted = userLaporan.map(item => ({
                    id: item.nomor_tiket,
                    judul: item.judul,
                    kategori: item.kategori,
                    kecamatan: item.kecamatan || item.lokasi,
                    tanggal: new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                    status: item.status || 'Laporan Diterima',
                    prioritas: item.urgensi === 'tinggi' ? 'Tinggi' : (item.urgensi === 'sedang' ? 'Sedang' : 'Rendah'),
                    deskripsi: item.deskripsi || '',
                    bukti_foto: item.bukti_foto,
                    gambar: Array.isArray(item.gambar) ? item.gambar : (item.gambar ? [item.gambar] : []),
                    petugas: item.petugas || 'Menunggu Penugasan',
                    dinas: item.dinas || 'Dinas Terkait'
                })).sort((a, b) => b.id.localeCompare(a.id)); // Urutkan dari tiket terbaru

                setLaporanList(formatted);
            } catch (err) {
                console.error('Error fetching user history:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRiwayat();
    }, [navigate]);

    // Reset ke halaman pertama jika filter atau search berubah
    useEffect(() => {
        setCurrentPage(1);
    }, [search, filterStatus]);

    // Handle buka detail timeline
    const handleLacakDetail = async (laporan) => {
        setSelectedLaporan(laporan);
        setLoadingDetail(true);
        try {
            const response = await fetch(`/api/pengaduans/${laporan.id}`);
            if (response.ok) {
                const data = await response.json();
                let timeline = data.timeline || [];
                
                // Tambahkan step selesai di akhir jika status belum selesai
                if (data.status !== 'Selesai' && timeline.length > 0) {
                    timeline.push({
                        tanggal: '-',
                        status: 'Selesai',
                        keterangan: 'Menunggu penyelesaian pekerjaan di lapangan.',
                        icon: 'task_alt',
                        color: 'text-slate-300',
                        pending: true
                    });
                }
                setTimelineData(timeline);
            } else {
                // Fallback timeline default jika API khusus tiket error
                setTimelineData([
                    { tanggal: laporan.tanggal, status: 'Laporan Diterima', keterangan: 'Laporan berhasil terkirim dan masuk antrean sistem.', icon: 'assignment', color: 'text-blue-500' },
                    { tanggal: '-', status: 'Verifikasi', keterangan: 'Tim admin sedang memeriksa kelengkapan berkas laporan.', icon: 'pending_actions', color: 'text-slate-300', pending: true }
                ]);
            }
        } catch (e) {
            console.error('Error fetching detail timeline:', e);
        } finally {
            setLoadingDetail(false);
        }
    };

    // Filter list laporan
    const filteredLaporan = laporanList.filter(item => {
        const matchesSearch = item.judul.toLowerCase().includes(search.toLowerCase()) || 
                             item.id.toLowerCase().includes(search.toLowerCase()) ||
                             item.kategori.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = filterStatus === 'Semua' || item.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Kalkulasi pagination
    const totalItems = filteredLaporan.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentItems = filteredLaporan.slice(startIndex, endIndex);

    const statusOptions = ['Semua', 'Laporan Diterima', 'Verifikasi', 'Sedang Diproses', 'Selesai', 'Ditolak'];

    if (loading) {
        return (
            <div className="bg-background min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <svg className="animate-spin h-10 w-10 text-blue-600" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-slate-500 font-medium">Memuat riwayat laporan...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col antialiased">
            <Navbar />

            {/* Banner Header */}
            <div className="w-full h-48 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-500 relative overflow-hidden flex items-end">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]"></div>
                <div className="absolute top-4 right-12 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
                
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 flex items-center gap-4 relative z-10">
                    <span className="material-symbols-outlined text-white/20 text-7xl absolute right-12 bottom-2 select-none pointer-events-none hidden md:block">history</span>
                    <div>
                        <h1 className="text-white text-3xl font-extrabold font-h1 tracking-tight">Riwayat Pengaduan</h1>
                        <p className="text-blue-100 text-sm mt-1 font-medium">Lihat dan pantau seluruh laporan pengaduan yang pernah Anda kirimkan</p>
                    </div>
                </div>
            </div>

            {/* Main Area */}
            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Left Menu / Navigation Sidebar */}
                    <div className="w-full lg:w-1/4 flex-shrink-0">
                        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-2">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-3 mb-2">Akun Saya</p>
                            
                            <Link 
                                to="/profile" 
                                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg text-slate-400">manage_accounts</span>
                                Edit Profil
                            </Link>

                            <Link 
                                to="/profile/riwayat" 
                                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold bg-blue-600 text-white shadow-md shadow-blue-500/10 transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg text-white" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
                                Riwayat Laporan
                            </Link>
                        </div>
                    </div>

                    {/* Right Panel: Riwayat List */}
                    <div className="w-full lg:flex-1">
                        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 md:p-8">
                            
                            {/* Search & Filter Controls */}
                            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
                                {/* Search Bar */}
                                <div className="relative w-full md:max-w-md">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                                    <input 
                                        type="text" 
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Cari berdasarkan judul, kategori, atau tiket..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-2xl text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/10 text-slate-700"
                                    />
                                </div>

                                {/* Status Filter dropdown */}
                                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                    <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Filter Status:</span>
                                    <div className="relative">
                                        <select 
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="appearance-none bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-10 py-2.5 text-sm font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                                        >
                                            {statusOptions.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                                    </div>
                                </div>
                            </div>

                            {/* Reports List */}
                            {currentItems.length > 0 ? (
                                <>
                                    <div className="space-y-4">
                                        {currentItems.map((item) => {
                                            const config = statusConfig[item.status] || { color: 'bg-slate-50 text-slate-700 border-slate-100', icon: 'assignment', badge: 'bg-slate-500' };
                                            return (
                                                <div 
                                                    key={item.id} 
                                                    className="border border-slate-100 rounded-2xl p-5 hover:border-blue-200 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                                                >
                                                    {/* Text Info */}
                                                    <div className="space-y-2 max-w-xl">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100 uppercase tracking-wide">{item.id}</span>
                                                            <span className="text-xs font-semibold text-slate-400">•</span>
                                                            <span className="text-xs text-slate-500 font-medium">{item.tanggal}</span>
                                                        </div>
                                                        
                                                        <h3 className="font-bold text-slate-800 text-base lg:text-lg leading-snug">{item.judul}</h3>
                                                        
                                                        <div className="flex flex-wrap gap-2 text-xs">
                                                            <span className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg border border-slate-100 font-medium capitalize flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-xs">category</span>
                                                                {item.kategori}
                                                            </span>
                                                            <span className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg border border-slate-100 font-medium flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-xs">location_on</span>
                                                                {item.kecamatan}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Status & Actions */}
                                                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-slate-50">
                                                        <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border ${config.color}`}>
                                                            <span className={`w-2 h-2 rounded-full ${config.badge}`}></span>
                                                            {item.status}
                                                        </span>

                                                        <button 
                                                            onClick={() => handleLacakDetail(item)}
                                                            className="px-4 py-2 text-xs font-bold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-100 hover:border-blue-600 rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer active:scale-95"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">timeline</span>
                                                            Pantau Progress
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Pagination Controls */}
                                    {totalPages > 1 && (
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t border-slate-100">
                                            <p className="text-xs text-slate-500 font-medium">
                                                Menampilkan <span className="text-slate-800 font-semibold">{startIndex + 1}</span> - <span className="text-slate-800 font-semibold">{Math.min(endIndex, totalItems)}</span> dari <span className="text-slate-800 font-semibold">{totalItems}</span> laporan
                                            </p>
                                            
                                            <div className="flex items-center gap-1">
                                                {/* Previous button */}
                                                <button
                                                    onClick={() => {
                                                        if (currentPage > 1) {
                                                            setCurrentPage(prev => prev - 1);
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }
                                                    }}
                                                    disabled={currentPage === 1}
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                >
                                                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                                                    Sebelumnya
                                                </button>

                                                {/* Page numbers */}
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => {
                                                            setCurrentPage(pageNum);
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }}
                                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                            currentPage === pageNum
                                                                ? 'bg-blue-600 text-white shadow-sm border border-blue-600'
                                                                : 'border border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                ))}

                                                {/* Next button */}
                                                <button
                                                    onClick={() => {
                                                        if (currentPage < totalPages) {
                                                            setCurrentPage(prev => prev + 1);
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }
                                                    }}
                                                    disabled={currentPage === totalPages}
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                >
                                                    Berikutnya
                                                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                /* Empty state */
                                <div className="text-center py-12 md:py-16 max-w-md mx-auto">
                                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
                                        <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-lg">Belum Ada Riwayat Laporan</h3>
                                    <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                                        Anda belum pernah membuat laporan pengaduan di sistem LaporWarga.
                                    </p>
                                    <Link 
                                        to="/buat-pengaduan" 
                                        className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all text-sm active:scale-95"
                                    >
                                        <span className="material-symbols-outlined text-lg">campaign</span>
                                        Buat Laporan Sekarang
                                    </Link>
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            </main>

            {/* Timeline Progress Tracking Modal */}
            {selectedLaporan && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
                    onClick={() => setSelectedLaporan(null)}
                >
                    <div 
                        className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 max-h-[90vh]"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-5 md:p-6 text-white flex items-center justify-between">
                            <div>
                                <p className="text-xs text-blue-200 font-semibold uppercase tracking-wider">Lacak Status Pengaduan</p>
                                <h3 className="text-lg md:text-xl font-bold tracking-wide mt-1">{selectedLaporan.id}</h3>
                            </div>
                            <button 
                                onClick={() => setSelectedLaporan(null)}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-grow">
                            {/* Short Summary Card */}
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                                <h4 className="font-bold text-slate-800 text-base">{selectedLaporan.judul}</h4>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{selectedLaporan.deskripsi}</p>
                                
                                <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
                                    <div>
                                        <span className="text-slate-400 font-medium">Kategori:</span>
                                        <p className="font-bold text-slate-700 capitalize mt-0.5">{selectedLaporan.kategori}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 font-medium">Lokasi:</span>
                                        <p className="font-bold text-slate-700 mt-0.5">{selectedLaporan.kecamatan}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline Progression */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
                                    <span className="material-symbols-outlined text-blue-600 text-lg">timeline</span>
                                    Riwayat Penanganan
                                </h4>

                                {loadingDetail ? (
                                    <div className="flex flex-col items-center py-6 gap-2">
                                        <svg className="animate-spin h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        <span className="text-xs text-slate-400 font-semibold">Memuat riwayat terbaru...</span>
                                    </div>
                                ) : (
                                    <div className="relative pl-2 mt-4">
                                        {timelineData.map((item, index) => {
                                            const isPending = item.pending;
                                            return (
                                                <div key={index} className="flex gap-4 relative">
                                                    {/* Vertical connection line */}
                                                    {index < timelineData.length - 1 && (
                                                        <div className={`absolute left-[19px] top-9 bottom-0 w-0.5 ${isPending ? 'border-l-2 border-dashed border-slate-200' : 'bg-slate-200'}`}></div>
                                                    )}
                                                    {/* Round icon */}
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${isPending ? 'bg-slate-100 text-slate-300' : 'bg-white border-2 border-blue-500 text-blue-600'}`}>
                                                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                            {item.icon || 'assignment'}
                                                        </span>
                                                    </div>
                                                    {/* Content details */}
                                                    <div className={`pb-6 flex-grow ${isPending ? 'opacity-40' : ''}`}>
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5 mb-1">
                                                            <p className="font-bold text-slate-800 text-sm md:text-base">{item.status}</p>
                                                            <span className="hidden sm:block text-slate-300 text-xs">•</span>
                                                            <p className="text-[10px] md:text-xs text-slate-400 font-medium">{item.tanggal}</p>
                                                        </div>
                                                        <p className="text-xs md:text-sm text-slate-500 leading-relaxed">{item.keterangan}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
                            <button 
                                onClick={() => setSelectedLaporan(null)}
                                className="px-5 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors cursor-pointer text-xs"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
