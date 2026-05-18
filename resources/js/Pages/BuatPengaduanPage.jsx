import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

export default function BuatPengaduanPage() {
    const navigate = useNavigate();
    
    // State dasar
    const [user, setUser] = useState(null);
    const [isComplete, setIsComplete] = useState(true);
    const [missingFields, setMissingFields] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // State untuk form identitas otomatis (prefilled jika ada)
    const [identitas, setIdentitas] = useState({ nama: '', telepon: '' });

    useEffect(() => {
        window.scrollTo(0, 0);
        
        const sesi = sessionStorage.getItem('user');
        if (!sesi) {
            navigate('/login');
            return;
        }

        const activeUser = JSON.parse(sesi);
        setUser(activeUser);

        // Ambil data profil dari localStorage
        const storedProfileKey = `profile_${activeUser.email}`;
        const storedProfile = localStorage.getItem(storedProfileKey);

        if (!storedProfile) {
            // Jika data profil belum pernah diinisialisasi sama sekali
            setIsComplete(false);
            setMissingFields([
                'Nomor Induk Kependudukan (NIK)',
                'Alamat Tinggal Lengkap',
                'Desa / Kelurahan',
                'Kecamatan',
                'Kabupaten',
                'Provinsi'
            ]);
            return;
        }

        const profile = JSON.parse(storedProfile);
        const missing = [];

        // Prefill nama dan telepon di form buat pengaduan
        setIdentitas({
            nama: profile.nama || activeUser.nama || '',
            telepon: profile.telepon || ''
        });

        // Validasi kelengkapan data sesuai permintaan user
        if (!profile.nik || profile.nik.trim().length !== 16 || isNaN(profile.nik)) {
            missing.push('Nomor Induk Kependudukan (NIK - 16 Digit)');
        }
        if (!profile.alamat || !profile.alamat.trim()) {
            missing.push('Alamat Tinggal Lengkap');
        }
        if (!profile.desa || !profile.desa.trim()) {
            missing.push('Desa / Kelurahan');
        }
        if (!profile.kecamatan || !profile.kecamatan.trim()) {
            missing.push('Kecamatan');
        }
        if (!profile.kabupaten || !profile.kabupaten.trim()) {
            missing.push('Kabupaten / Kota');
        }
        if (!profile.provinsi || !profile.provinsi.trim()) {
            missing.push('Provinsi');
        }

        if (missing.length > 0) {
            setIsComplete(false);
            setMissingFields(missing);
        } else {
            setIsComplete(true);
        }
    }, [navigate]);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type }), 3000);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        // Validasi input pengaduan
        const judul = document.getElementById('judul')?.value;
        const kategori = document.getElementById('kategori')?.value;
        const lokasi = document.getElementById('lokasi')?.value;
        const deskripsi = document.getElementById('deskripsi')?.value;

        if (!judul || !kategori || !lokasi || !deskripsi) {
            showToast('Semua kolom detail laporan pengaduan wajib diisi!', 'error');
            return;
        }

        setSubmitting(true);

        // Simulasi pengiriman data
        setTimeout(() => {
            setSubmitting(false);
            showToast('Laporan pengaduan Anda berhasil dikirim ke sistem!', 'success');
            
            // Redirect ke halaman lacak laporan setelah delay
            setTimeout(() => {
                navigate('/lacak');
            }, 1500);
        }, 1500);
    };

    return (
        <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col antialiased">
            {/* Navbar Bersama */}
            <Navbar />

            {/* Custom Toast Notification */}
            {toast.show && (
                <div className={`fixed top-24 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl transition-all duration-300 border
                    ${toast.type === 'success' 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                >
                    <span className="material-symbols-outlined text-2xl flex-shrink-0">
                        {toast.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    <p className="text-sm font-semibold">{toast.message}</p>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-grow pt-32 pb-24 px-6 md:px-margin max-w-4xl mx-auto w-full flex flex-col gap-8">
                
                {!isComplete ? (
                    /* ===== TAMPILAN ALERT BLOKING: PROFIL BELUM LENGKAP ===== */
                    <div className="bg-white rounded-3xl border border-red-100 shadow-[0px_15px_50px_rgba(239,68,68,0.06)] p-8 md:p-12 text-center max-w-2xl mx-auto my-8 relative overflow-hidden animate-in fade-in zoom-in duration-300">
                        {/* Red Top Stripe Banner */}
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 to-amber-500"></div>
                        
                        {/* Icon */}
                        <div className="w-20 h-20 bg-red-50 border border-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>person_alert</span>
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Profil Anda Belum Lengkap!</h2>
                        <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                            Berdasarkan kebijakan sistem kependudukan LaporWarga, Anda wajib melengkapi informasi profil diri Anda terlebih dahulu sebelum dapat mengirimkan laporan pengaduan.
                        </p>

                        {/* Checklist Data Kosong */}
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 my-6 text-left">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm">warning</span>
                                Data Berikut Wajib Dilengkapi:
                            </h4>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {missingFields.map((field, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                                        <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 animate-pulse"></span>
                                        {field}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                            <Link 
                                to="/" 
                                className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors text-sm"
                            >
                                Kembali ke Beranda
                            </Link>
                            <Link 
                                to="/profile" 
                                className="px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-[0px_5px_25px_rgba(37,99,235,0.2)] transition-all text-sm flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">manage_accounts</span>
                                Lengkapi Profil Sekarang
                            </Link>
                        </div>
                    </div>
                ) : (
                    /* ===== TAMPILAN NORMAL: FORM PEMBUATAN LAPORAN ===== */
                    <>
                        {/* Header */}
                        <div className="text-center space-y-4">
                            <h1 className="font-h1 text-4xl md:text-5xl font-bold text-on-surface">Buat Laporan Baru</h1>
                            <p className="font-body-lg text-lg text-on-surface-variant max-w-2xl mx-auto">Sampaikan pengaduan Anda dengan jelas dan lengkap untuk tindak lanjut yang cepat.</p>
                        </div>

                        {/* Form Card */}
                        <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,102,204,0.05)] p-8 md:p-10 border border-surface-container-low relative overflow-hidden">
                            <form onSubmit={handleFormSubmit} className="space-y-8 relative z-10">
                                {/* Identitas Section */}
                                <div className="space-y-4">
                                    <h2 className="font-h3 text-2xl font-semibold text-on-surface border-b border-surface-variant pb-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-600">contact_mail</span>
                                        Identitas Pelapor
                                    </h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 flex flex-col justify-end">
                                            <label className="font-label-bold text-sm font-semibold text-on-surface-variant" htmlFor="nama">Nama Lengkap</label>
                                            <input 
                                                className="w-full bg-[#F1F5F9] border border-outline-variant focus:border-primary-container rounded-lg px-4 py-3 font-body-md text-on-surface focus:ring-2 focus:ring-primary-container/20 transition-colors outline-none cursor-not-allowed" 
                                                id="nama" 
                                                type="text" 
                                                value={identitas.nama}
                                                disabled
                                                title="Nama terkunci berdasarkan data profil resmi Anda"
                                            />
                                        </div>
                                        <div className="space-y-2 flex flex-col justify-end">
                                            <label className="font-label-bold text-sm font-semibold text-on-surface-variant" htmlFor="nohp">Nomor HP / WhatsApp</label>
                                            <input 
                                                className="w-full bg-[#F1F5F9] border border-outline-variant focus:border-primary-container rounded-lg px-4 py-3 font-body-md text-on-surface focus:ring-2 focus:ring-primary-container/20 transition-colors outline-none cursor-not-allowed" 
                                                id="nohp" 
                                                type="tel" 
                                                value={identitas.telepon}
                                                disabled
                                                title="Nomor HP terkunci berdasarkan data profil resmi Anda"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 pt-2">
                                        <input className="w-5 h-5 rounded border-outline-variant text-primary-container focus:ring-primary-container cursor-pointer" id="anonim" type="checkbox" />
                                        <label className="font-body-md text-on-surface-variant cursor-pointer select-none" htmlFor="anonim">Lapor sebagai Anonim (Identitas dirahasiakan)</label>
                                    </div>
                                </div>

                                {/* Detail Laporan Section */}
                                <div className="space-y-4 pt-4">
                                    <h2 className="font-h3 text-2xl font-semibold text-on-surface border-b border-surface-variant pb-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-600">article</span>
                                        Detail Laporan
                                    </h2>
                                    
                                    <div className="space-y-2">
                                        <label className="font-label-bold text-sm font-semibold text-on-surface-variant" htmlFor="judul">Judul Laporan</label>
                                        <input className="w-full bg-[#F1F5F9] border border-outline-variant focus:border-primary-container rounded-lg px-4 py-3 font-body-md text-on-surface focus:ring-2 focus:ring-primary-container/20 transition-colors outline-none" id="judul" placeholder="Singkat, padat, dan jelas (Maks. 50 karakter)" type="text" maxLength={50} required />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="font-label-bold text-sm font-semibold text-on-surface-variant" htmlFor="kategori">Kategori Pengaduan</label>
                                            <div className="relative">
                                                <select className="w-full bg-[#F1F5F9] border border-outline-variant focus:border-primary-container rounded-lg px-4 py-3 font-body-md text-on-surface appearance-none focus:ring-2 focus:ring-primary-container/20 transition-colors outline-none cursor-pointer" id="kategori" defaultValue="" required>
                                                    <option disabled value="">Pilih Kategori</option>
                                                    <option value="infrastruktur">Infrastruktur &amp; Jalan</option>
                                                    <option value="kebersihan">Kebersihan &amp; Lingkungan</option>
                                                    <option value="kesehatan">Kesehatan</option>
                                                    <option value="pendidikan">Pendidikan</option>
                                                    <option value="lainnya">Lainnya</option>
                                                </select>
                                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="font-label-bold text-sm font-semibold text-on-surface-variant">Tingkat Urgensi</label>
                                            <div className="flex gap-4 pt-2">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input className="w-5 h-5 text-primary-container focus:ring-primary-container border-outline-variant cursor-pointer" name="urgensi" type="radio" value="rendah" />
                                                    <span className="font-body-md text-on-surface select-none">Rendah</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input defaultChecked className="w-5 h-5 text-amber-600 focus:ring-amber-600 border-outline-variant cursor-pointer" name="urgensi" type="radio" value="sedang" />
                                                    <span className="font-body-md text-on-surface select-none">Sedang</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input className="w-5 h-5 text-error focus:ring-error border-outline-variant cursor-pointer" name="urgensi" type="radio" value="tinggi" />
                                                    <span className="font-body-md text-on-surface select-none">Tinggi</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="font-label-bold text-sm font-semibold text-on-surface-variant" htmlFor="lokasi">Lokasi Kejadian</label>
                                        <div className="flex gap-2">
                                            <input className="flex-grow bg-[#F1F5F9] border border-outline-variant focus:border-primary-container rounded-lg px-4 py-3 font-body-md text-on-surface focus:ring-2 focus:ring-primary-container/20 transition-colors outline-none" id="lokasi" placeholder="Alamat lengkap atau detail lokasi" type="text" required />
                                            <button className="bg-surface-container text-on-surface-variant px-4 rounded-lg border border-outline-variant hover:bg-surface-variant transition-colors flex items-center justify-center" type="button" title="Pilih Lokasi di Peta">
                                                <span className="material-symbols-outlined">location_on</span>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="font-label-bold text-sm font-semibold text-on-surface-variant" htmlFor="deskripsi">Deskripsi Lengkap</label>
                                        <textarea className="w-full bg-[#F1F5F9] border border-outline-variant focus:border-primary-container rounded-lg px-4 py-3 font-body-md text-on-surface focus:ring-2 focus:ring-primary-container/20 transition-colors resize-y outline-none" id="deskripsi" placeholder="Ceritakan kronologi atau detail masalah secara jelas..." rows="5" required></textarea>
                                    </div>
                                </div>

                                {/* Bukti Lampiran Section */}
                                <div className="space-y-4 pt-4">
                                    <h2 className="font-h3 text-2xl font-semibold text-on-surface border-b border-surface-variant pb-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-600">attach_file</span>
                                        Bukti Lampiran
                                    </h2>
                                    <div className="border-2 border-dashed border-outline-variant rounded-xl p-8 flex flex-col items-center justify-center text-center bg-[#F1F5F9] hover:bg-blue-50/50 hover:border-primary-container/50 transition-all cursor-pointer group">
                                        <span className="material-symbols-outlined text-4xl text-outline group-hover:text-primary-container transition-colors mb-2">cloud_upload</span>
                                        <p className="font-label-bold text-sm font-semibold text-on-surface group-hover:text-primary-container transition-colors">Klik atau seret foto ke sini</p>
                                        <p className="font-body-sm text-sm text-on-surface-variant mt-1">Format JPG, PNG, atau PDF (Maks. 5MB per file)</p>
                                    </div>
                                </div>

                                {/* Submit Action */}
                                <div className="pt-8 flex flex-col-reverse md:flex-row justify-end gap-4 border-t border-surface-variant mt-4 pt-6">
                                    <Link to="/" className="px-6 py-3 rounded-lg border border-primary-container text-primary-container font-label-bold text-center font-semibold hover:bg-primary-container/5 transition-colors">
                                        Batal
                                    </Link>
                                    <button 
                                        type="submit" 
                                        disabled={submitting}
                                        className="px-8 py-3 rounded-lg bg-primary-container text-white font-label-bold font-semibold hover:opacity-90 shadow-[0px_10px_30px_rgba(0,102,204,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Mengirim...
                                            </>
                                        ) : (
                                            <>
                                                <span>Kirim Pengaduan</span>
                                                <span className="material-symbols-outlined text-sm">send</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                )}
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
