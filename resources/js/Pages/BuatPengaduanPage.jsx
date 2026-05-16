import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../Components/Navbar';

export default function BuatPengaduanPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
            {/* Navbar Bersama */}
            <Navbar />

            {/* Main Content */}
            <main className="flex-grow pt-32 pb-24 px-6 md:px-margin max-w-4xl mx-auto w-full flex flex-col gap-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="font-h1 text-4xl md:text-5xl font-bold text-on-surface">Buat Laporan Baru</h1>
                    <p className="font-body-lg text-lg text-on-surface-variant max-w-2xl mx-auto">Sampaikan pengaduan Anda dengan jelas dan lengkap untuk tindak lanjut yang cepat.</p>
                </div>

                {/* Form Card */}
                <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,102,204,0.05)] p-8 md:p-10 border border-surface-container-low relative overflow-hidden">
                  
                    
                    <form className="space-y-8 relative z-10">
                        {/* Identitas Section */}
                        <div className="space-y-4">
                            <h2 className="font-h3 text-2xl font-semibold text-on-surface border-b border-surface-variant pb-2">Identitas Pelapor</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 flex flex-col justify-end">
                                    <label className="font-label-bold text-sm font-semibold text-on-surface-variant" htmlFor="nama">Nama Lengkap</label>
                                    <input className="w-full bg-[#F1F5F9] border border-outline-variant focus:border-primary-container rounded-lg px-4 py-3 font-body-md text-on-surface focus:ring-2 focus:ring-primary-container/20 transition-colors outline-none" id="nama" placeholder="Masukkan nama Anda" type="text" />
                                </div>
                                <div className="space-y-2 flex flex-col justify-end">
                                    <label className="font-label-bold text-sm font-semibold text-on-surface-variant" htmlFor="nohp">Nomor HP / WhatsApp</label>
                                    <input className="w-full bg-[#F1F5F9] border border-outline-variant focus:border-primary-container rounded-lg px-4 py-3 font-body-md text-on-surface focus:ring-2 focus:ring-primary-container/20 transition-colors outline-none" id="nohp" placeholder="08xxxxxxxxxx" type="tel" />
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 pt-2">
                                <input className="w-5 h-5 rounded border-outline-variant text-primary-container focus:ring-primary-container cursor-pointer" id="anonim" type="checkbox" />
                                <label className="font-body-md text-on-surface-variant cursor-pointer select-none" htmlFor="anonim">Lapor sebagai Anonim (Identitas dirahasiakan)</label>
                            </div>
                        </div>

                        {/* Detail Laporan Section */}
                        <div className="space-y-4 pt-4">
                            <h2 className="font-h3 text-2xl font-semibold text-on-surface border-b border-surface-variant pb-2">Detail Laporan</h2>
                            
                            <div className="space-y-2">
                                <label className="font-label-bold text-sm font-semibold text-on-surface-variant" htmlFor="judul">Judul Laporan</label>
                                <input className="w-full bg-[#F1F5F9] border border-outline-variant focus:border-primary-container rounded-lg px-4 py-3 font-body-md text-on-surface focus:ring-2 focus:ring-primary-container/20 transition-colors outline-none" id="judul" placeholder="Singkat, padat, dan jelas (Maks. 50 karakter)" type="text" />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="font-label-bold text-sm font-semibold text-on-surface-variant" htmlFor="kategori">Kategori Pengaduan</label>
                                    <div className="relative">
                                        <select className="w-full bg-[#F1F5F9] border border-outline-variant focus:border-primary-container rounded-lg px-4 py-3 font-body-md text-on-surface appearance-none focus:ring-2 focus:ring-primary-container/20 transition-colors outline-none cursor-pointer" id="kategori" defaultValue="">
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
                                    <input className="flex-grow bg-[#F1F5F9] border border-outline-variant focus:border-primary-container rounded-lg px-4 py-3 font-body-md text-on-surface focus:ring-2 focus:ring-primary-container/20 transition-colors outline-none" id="lokasi" placeholder="Alamat lengkap atau detail lokasi" type="text" />
                                    <button className="bg-surface-container text-on-surface-variant px-4 rounded-lg border border-outline-variant hover:bg-surface-variant transition-colors flex items-center justify-center" type="button" title="Pilih Lokasi di Peta">
                                        <span className="material-symbols-outlined">location_on</span>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="font-label-bold text-sm font-semibold text-on-surface-variant" htmlFor="deskripsi">Deskripsi Lengkap</label>
                                <textarea className="w-full bg-[#F1F5F9] border border-outline-variant focus:border-primary-container rounded-lg px-4 py-3 font-body-md text-on-surface focus:ring-2 focus:ring-primary-container/20 transition-colors resize-y outline-none" id="deskripsi" placeholder="Ceritakan kronologi atau detail masalah secara jelas..." rows="5"></textarea>
                            </div>
                        </div>

                        {/* Bukti Lampiran Section */}
                        <div className="space-y-4 pt-4">
                            <h2 className="font-h3 text-2xl font-semibold text-on-surface border-b border-surface-variant pb-2">Bukti Lampiran</h2>
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
                            <button className="px-8 py-3 rounded-lg bg-primary-container text-white font-label-bold font-semibold hover:opacity-90 shadow-[0px_10px_30px_rgba(0,102,204,0.2)] transition-all flex items-center justify-center gap-2" type="submit">
                                <span>Kirim Pengaduan</span>
                                <span className="material-symbols-outlined text-sm">send</span>
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 dark:bg-black text-blue-400 font-public-sans text-xs text-slate-400 w-full border-t border-slate-800 mt-auto">
                <div className="w-full py-12 px-6 flex flex-col justify-center items-center max-w-7xl mx-auto gap-2">
                    <span className="text-white font-bold text-lg flex items-center gap-2">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
                        LaporWarga
                    </span>
                    <p className="text-center">© 2024 Pemerintah Daerah. Terintegrasi Smart City Indonesia.</p>
                </div>
            </footer>
        </div>
    );
}
