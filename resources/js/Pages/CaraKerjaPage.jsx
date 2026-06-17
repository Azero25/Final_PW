import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

export default function CaraKerjaPage() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        // Cek status login dari sessionStorage
        try {
            const sesi = sessionStorage.getItem('user');
            if (sesi) setCurrentUser(JSON.parse(sesi));
        } catch (e) {
            setCurrentUser(null);
        }
    }, []);

    return (
        <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
            {/* Navbar Bersama */}
            <Navbar />

            {/* Main Content */}
            <main className="grow pt-32 pb-24 px-6 max-w-5xl mx-auto w-full">
                <div className="text-center mb-16">
                    <span className="inline-block py-1 px-3 rounded-full bg-primary-container/10 text-primary font-label-bold text-sm tracking-widest uppercase mb-4 border border-primary/20">Panduan Lengkap</span>
                    <h1 className="font-h1 text-on-background text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">Alur Pengaduan <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-blue-400">Masyarakat</span></h1>
                    <p className="font-body-lg text-on-surface-variant max-w-3xl mx-auto text-lg leading-relaxed">Kami memastikan setiap laporan yang Anda kirimkan ditangani secara profesional, transparan, dan dapat dilacak setiap saat.</p>
                </div>

                <div className="space-y-12">
                    {/* Step 1 Detail */}
                    <div className="bg-surface rounded-3xl p-8 md:p-10 shadow-[0px_10px_40px_rgba(0,0,0,0.03)] border border-outline-variant/30 flex flex-col md:flex-row gap-8 items-center hover:border-primary/30 transition-colors duration-300">
                        <div className="w-24 h-24 shrink-0 bg-primary-container/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                            <span className="material-symbols-outlined text-5xl">edit_document</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">1</span>
                                <h3 className="font-h3 text-2xl text-on-background">Buat & Tulis Laporan</h3>
                            </div>
                            <p className="font-body-md text-on-surface-variant text-lg leading-relaxed mb-4">
                                Mulai dengan mendaftar atau masuk ke akun Anda. Isi form pengaduan dengan detail masalah yang Anda hadapi. Pastikan Anda menyertakan informasi penting seperti:
                            </p>
                            <ul className="list-disc list-inside text-on-surface-variant space-y-2 font-body-md">
                                <li>Judul laporan yang singkat dan jelas</li>
                                <li>Kronologi dan deskripsi lengkap kejadian</li>
                                <li>Lokasi spesifik kejadian</li>
                                <li>Lampiran bukti berupa foto atau dokumen (opsional namun disarankan)</li>
                            </ul>
                        </div>
                    </div>

                    {/* Step 2 Detail */}
                    <div className="bg-surface rounded-3xl p-8 md:p-10 shadow-[0px_10px_40px_rgba(0,0,0,0.03)] border border-outline-variant/30 flex flex-col md:flex-row gap-8 items-center hover:border-amber-500/30 transition-colors duration-300">
                        <div className="w-24 h-24 shrink-0 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20">
                            <span className="material-symbols-outlined text-5xl">sync</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="bg-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">2</span>
                                <h3 className="font-h3 text-2xl text-on-background">Proses Verifikasi & Tindak Lanjut</h3>
                            </div>
                            <p className="font-body-md text-on-surface-variant text-lg leading-relaxed mb-4">
                                Setelah laporan dikirimkan, tim kami akan segera melakukan verifikasi terhadap keabsahan laporan. Jika valid, laporan akan diteruskan ke instansi terkait untuk diproses.
                            </p>
                            <div className="bg-surface-container p-4 rounded-xl text-on-surface-variant text-sm font-body-md border border-outline-variant/50">
                                <strong className="text-on-background">Transparansi:</strong> Anda dapat melacak status laporan Anda secara real-time di halaman "Lacak", dari status 'Menunggu', 'Diproses', hingga 'Selesai'.
                            </div>
                        </div>
                    </div>

                    {/* Step 3 Detail */}
                    <div className="bg-surface rounded-3xl p-8 md:p-10 shadow-[0px_10px_40px_rgba(0,0,0,0.03)] border border-outline-variant/30 flex flex-col md:flex-row gap-8 items-center hover:border-emerald-500/30 transition-colors duration-300">
                        <div className="w-24 h-24 shrink-0 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                            <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">3</span>
                                <h3 className="font-h3 text-2xl text-on-background">Penyelesaian & Evaluasi</h3>
                            </div>
                            <p className="font-body-md text-on-surface-variant text-lg leading-relaxed mb-4">
                                Setelah instansi terkait menyelesaikan masalah, Anda akan menerima notifikasi bahwa laporan telah diselesaikan beserta lampiran bukti penyelesaian jika ada.
                            </p>
                            <p className="font-body-md text-on-surface-variant text-lg leading-relaxed">
                                Terakhir, berikan ulasan atau penilaian (rating) atas pelayanan dan solusi yang diberikan. Tanggapan Anda sangat berharga untuk meningkatkan kualitas layanan pemerintah daerah ke depannya.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Call to action */}
                <div className="mt-20 text-center bg-primary-container/5 py-12 px-6 rounded-3xl border border-primary/10">
                    {currentUser ? (
                        /* === SUDAH LOGIN: langsung ke buat laporan === */
                        <>
                            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
                                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                                Login sebagai {currentUser.nama}
                            </div>
                            <h2 className="font-h2 text-3xl mb-3 text-on-background">Siap Melaporkan Masalah?</h2>
                            <p className="font-body-md text-on-surface-variant mb-8 max-w-xl mx-auto">
                                Akun Anda sudah aktif. Langsung buat laporan sekarang dan bantu warga sekitar!
                            </p>
                            <button
                                onClick={() => navigate('/buat-pengaduan')}
                                className="px-8 py-4 inline-flex items-center gap-2 bg-primary text-white rounded-xl font-label-bold text-lg hover:bg-primary/90 transition-all shadow-[0px_10px_30px_rgba(0,102,204,0.3)] hover:-translate-y-1"
                            >
                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                                Buat Laporan Sekarang
                            </button>
                        </>
                    ) : (
                        /* === BELUM LOGIN: ajak login atau daftar === */
                        <>
                            <span className="material-symbols-outlined text-5xl text-primary-container mb-4 block">campaign</span>
                            <h2 className="font-h2 text-3xl mb-3 text-on-background">Siap Melaporkan Masalah?</h2>
                            <p className="font-body-md text-on-surface-variant mb-8 max-w-xl mx-auto">
                                Satu laporan dari Anda bisa membawa perubahan besar bagi kenyamanan warga sekitar. Masuk atau buat akun gratis untuk mulai.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    to="/login"
                                    state={{ from: { pathname: '/buat-pengaduan' } }}
                                    className="w-full sm:w-auto px-8 py-4 inline-flex items-center justify-center gap-2 bg-primary text-white rounded-xl font-label-bold text-lg hover:bg-primary/90 transition-all shadow-[0px_10px_30px_rgba(0,102,204,0.3)] hover:-translate-y-1"
                                >
                                    <span className="material-symbols-outlined">login</span>
                                    Masuk &amp; Buat Laporan
                                </Link>
                                <Link
                                    to="/register"
                                    className="w-full sm:w-auto px-8 py-4 inline-flex items-center justify-center gap-2 bg-white text-primary border-2 border-primary rounded-xl font-label-bold text-lg hover:bg-blue-50 transition-all hover:-translate-y-1"
                                >
                                    <span className="material-symbols-outlined">how_to_reg</span>
                                    Daftar Akun Gratis
                                </Link>
                            </div>
                            <p className="text-xs text-on-surface-variant mt-4 opacity-60">Gratis, cepat, dan tanpa biaya apapun.</p>
                        </>
                    )}
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
