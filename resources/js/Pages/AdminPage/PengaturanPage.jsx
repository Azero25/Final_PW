import React, { useEffect, useState } from 'react';
import AdminLayout from '../../Components/AdminLayout';

export default function PengaturanPage() {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    const [activeTab, setActiveTab] = useState('umum');

    // State pengaturan umum
    const [umum, setUmum] = useState({
        namaAplikasi: 'LaporWarga',
        deskripsi: 'Platform pengaduan warga Kota Yogyakarta',
        email: 'admin@lapor.go.id',
        telepon: '(0274) 123456',
        alamat: 'Jl. Malioboro No. 1, Yogyakarta',
        website: 'https://laporwarga.jogjakota.go.id',
        timezone: 'Asia/Jakarta',
        bahasa: 'id',
    });

    // State notifikasi
    const [notifSettings, setNotifSettings] = useState({
        emailAdmin: true,
        emailPetugas: true,
        emailWarga: false,
        laporanBaru: true,
        updateStatus: true,
        deadlineIngatkan: true,
        laporanDarurat: true,
        ringkasanHarian: false,
        ringkasanMingguan: true,
    });

    // State keamanan
    const [keamanan, setKeamanan] = useState({
        passwordLama: '',
        passwordBaru: '',
        konfirmasiPassword: '',
        otpLogin: false,
        sessionTimeout: '60',
        maxLoginGagal: '5',
    });

    // State tampilan
    const [tampilan, setTampilan] = useState({
        tema: 'light',
        warnaPrimer: 'blue',
        itemPerHalaman: '10',
        animasi: true,
        kompakMode: false,
    });

    const [saved, setSaved] = useState(false);
    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const tabs = [
        { id: 'umum',      label: 'Umum',       icon: 'settings' },
        { id: 'notifikasi',label: 'Notifikasi',  icon: 'notifications' },
        { id: 'keamanan',  label: 'Keamanan',    icon: 'security' },
        { id: 'tampilan',  label: 'Tampilan',    icon: 'palette' },
        { id: 'backup',    label: 'Backup',      icon: 'backup' },
    ];

    const Toggle = ({ checked, onChange }) => (
        <button onClick={() => onChange(!checked)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    );

    const Field = ({ label, hint, children }) => (
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-6 py-4 border-b border-slate-100 last:border-0">
            <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
            </div>
            <div className="shrink-0">{children}</div>
        </div>
    );

    const InputText = ({ value, onChange, type = 'text', placeholder = '' }) => (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            className="w-full sm:w-56 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors" />
    );

    const Select = ({ value, onChange, options }) => (
        <select value={value} onChange={e => onChange(e.target.value)}
            className="w-full sm:w-44 px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-400">
            {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
    );

    return (
        <AdminLayout pageTitle="Pengaturan" pageSubtitle="Konfigurasi sistem LaporWarga">

            {/* Mobile: Tab horizontal scroll / Desktop: Sidebar tab */}
            <div className="flex flex-col gap-6 w-full">

                {/* Tab chips (mobile: scroll horizontal, desktop: sidebar vertikal) */}
                <div className="sm:hidden">
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {tabs.map(t => (
                            <button key={t.id} onClick={() => setActiveTab(t.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap shrink-0 transition-all
                                    ${activeTab === t.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>
                                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: activeTab === t.id ? "'FILL' 1" : "'FILL' 0" }}>{t.icon}</span>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-6">
                    {/* Sidebar tab (desktop only) */}
                    <div className="hidden sm:block w-52 shrink-0">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2 space-y-1">
                            {tabs.map(t => (
                                <button key={t.id} onClick={() => setActiveTab(t.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                                        ${activeTab === t.id ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
                                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: activeTab === t.id ? "'FILL' 1" : "'FILL' 0" }}>{t.icon}</span>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Konten Tab */}
                    <div className="flex-1 min-w-0">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

                            {/* Header */}
                            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <h2 className="font-bold text-slate-800 truncate">{tabs.find(t => t.id === activeTab)?.label}</h2>
                                    <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">Perubahan disimpan secara lokal</p>
                                </div>
                                <button onClick={handleSave}
                                    className={`flex items-center gap-1.5 px-3 sm:px-5 py-2 rounded-xl text-sm font-semibold transition-all shrink-0
                                        ${saved ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                                    <span className="material-symbols-outlined text-base">{saved ? 'check_circle' : 'save'}</span>
                                    <span className="hidden sm:inline">{saved ? 'Tersimpan!' : 'Simpan Perubahan'}</span>
                                    <span className="sm:hidden">{saved ? 'OK' : 'Simpan'}</span>
                                </button>
                            </div>

                            <div className="px-4 sm:px-6 py-2">

                            {/* ===== TAB UMUM ===== */}
                            {activeTab === 'umum' && (
                                <div>
                                    <Field label="Nama Aplikasi" hint="Nama yang ditampilkan di seluruh sistem">
                                        <InputText value={umum.namaAplikasi} onChange={v => setUmum({ ...umum, namaAplikasi: v })} />
                                    </Field>
                                    <Field label="Deskripsi" hint="Deskripsi singkat aplikasi">
                                        <InputText value={umum.deskripsi} onChange={v => setUmum({ ...umum, deskripsi: v })} />
                                    </Field>
                                    <Field label="Email Resmi" hint="Alamat email admin utama">
                                        <InputText type="email" value={umum.email} onChange={v => setUmum({ ...umum, email: v })} />
                                    </Field>
                                    <Field label="Telepon" hint="Nomor telepon kantor">
                                        <InputText value={umum.telepon} onChange={v => setUmum({ ...umum, telepon: v })} />
                                    </Field>
                                    <Field label="Alamat Kantor" hint="Alamat fisik instansi">
                                        <InputText value={umum.alamat} onChange={v => setUmum({ ...umum, alamat: v })} />
                                    </Field>
                                    <Field label="Website" hint="URL website resmi">
                                        <InputText value={umum.website} onChange={v => setUmum({ ...umum, website: v })} />
                                    </Field>
                                    <Field label="Zona Waktu" hint="Zona waktu yang digunakan sistem">
                                        <Select value={umum.timezone} onChange={v => setUmum({ ...umum, timezone: v })} options={[
                                            { v: 'Asia/Jakarta', l: 'WIB (UTC+7)' },
                                            { v: 'Asia/Makassar', l: 'WITA (UTC+8)' },
                                            { v: 'Asia/Jayapura', l: 'WIT (UTC+9)' },
                                        ]} />
                                    </Field>
                                    <Field label="Bahasa" hint="Bahasa antarmuka sistem">
                                        <Select value={umum.bahasa} onChange={v => setUmum({ ...umum, bahasa: v })} options={[
                                            { v: 'id', l: 'Bahasa Indonesia' },
                                            { v: 'en', l: 'English' },
                                        ]} />
                                    </Field>
                                </div>
                            )}

                            {/* ===== TAB NOTIFIKASI ===== */}
                            {activeTab === 'notifikasi' && (
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-4 pb-2">Penerima Email</p>
                                    <Field label="Kirim email ke Admin" hint="Notifikasi dikirim ke akun admin aktif">
                                        <Toggle checked={notifSettings.emailAdmin} onChange={v => setNotifSettings({ ...notifSettings, emailAdmin: v })} />
                                    </Field>
                                    <Field label="Kirim email ke Petugas" hint="Petugas mendapat notifikasi penugasan">
                                        <Toggle checked={notifSettings.emailPetugas} onChange={v => setNotifSettings({ ...notifSettings, emailPetugas: v })} />
                                    </Field>
                                    <Field label="Kirim email ke Warga" hint="Warga mendapat update status laporan mereka">
                                        <Toggle checked={notifSettings.emailWarga} onChange={v => setNotifSettings({ ...notifSettings, emailWarga: v })} />
                                    </Field>

                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-6 pb-2">Pemicu Notifikasi</p>
                                    <Field label="Laporan baru masuk" hint="Notifikasi saat ada laporan baru">
                                        <Toggle checked={notifSettings.laporanBaru} onChange={v => setNotifSettings({ ...notifSettings, laporanBaru: v })} />
                                    </Field>
                                    <Field label="Perubahan status laporan" hint="Notifikasi saat status diperbarui">
                                        <Toggle checked={notifSettings.updateStatus} onChange={v => setNotifSettings({ ...notifSettings, updateStatus: v })} />
                                    </Field>
                                    <Field label="Pengingat deadline" hint="Ingatkan petugas sebelum batas waktu">
                                        <Toggle checked={notifSettings.deadlineIngatkan} onChange={v => setNotifSettings({ ...notifSettings, deadlineIngatkan: v })} />
                                    </Field>
                                    <Field label="Laporan darurat / prioritas tinggi" hint="Notifikasi langsung untuk laporan mendesak">
                                        <Toggle checked={notifSettings.laporanDarurat} onChange={v => setNotifSettings({ ...notifSettings, laporanDarurat: v })} />
                                    </Field>

                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-6 pb-2">Ringkasan Berkala</p>
                                    <Field label="Ringkasan harian" hint="Email ringkasan aktivitas setiap pagi">
                                        <Toggle checked={notifSettings.ringkasanHarian} onChange={v => setNotifSettings({ ...notifSettings, ringkasanHarian: v })} />
                                    </Field>
                                    <Field label="Ringkasan mingguan" hint="Email laporan mingguan setiap Senin">
                                        <Toggle checked={notifSettings.ringkasanMingguan} onChange={v => setNotifSettings({ ...notifSettings, ringkasanMingguan: v })} />
                                    </Field>
                                </div>
                            )}

                            {/* ===== TAB KEAMANAN ===== */}
                            {activeTab === 'keamanan' && (
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-4 pb-2">Ganti Password Admin</p>
                                    <Field label="Password Lama" hint="Masukkan password saat ini untuk verifikasi">
                                        <InputText type="password" value={keamanan.passwordLama} onChange={v => setKeamanan({ ...keamanan, passwordLama: v })} placeholder="••••••••" />
                                    </Field>
                                    <Field label="Password Baru" hint="Minimal 8 karakter, kombinasi huruf & angka">
                                        <InputText type="password" value={keamanan.passwordBaru} onChange={v => setKeamanan({ ...keamanan, passwordBaru: v })} placeholder="••••••••" />
                                    </Field>
                                    <Field label="Konfirmasi Password" hint="Ulangi password baru untuk konfirmasi">
                                        <InputText type="password" value={keamanan.konfirmasiPassword} onChange={v => setKeamanan({ ...keamanan, konfirmasiPassword: v })} placeholder="••••••••" />
                                    </Field>

                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-6 pb-2">Kebijakan Keamanan</p>
                                    <Field label="Verifikasi OTP saat login" hint="Kirim kode OTP ke email saat login">
                                        <Toggle checked={keamanan.otpLogin} onChange={v => setKeamanan({ ...keamanan, otpLogin: v })} />
                                    </Field>
                                    <Field label="Timeout sesi (menit)" hint="Otomatis keluar jika tidak aktif">
                                        <Select value={keamanan.sessionTimeout} onChange={v => setKeamanan({ ...keamanan, sessionTimeout: v })} options={[
                                            { v: '30', l: '30 menit' },
                                            { v: '60', l: '1 jam' },
                                            { v: '120', l: '2 jam' },
                                            { v: '480', l: '8 jam' },
                                        ]} />
                                    </Field>
                                    <Field label="Maks. percobaan login gagal" hint="Akun terkunci setelah melebihi batas">
                                        <Select value={keamanan.maxLoginGagal} onChange={v => setKeamanan({ ...keamanan, maxLoginGagal: v })} options={[
                                            { v: '3', l: '3 kali' },
                                            { v: '5', l: '5 kali' },
                                            { v: '10', l: '10 kali' },
                                        ]} />
                                    </Field>

                                    {/* Zona bahaya */}
                                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                                        <p className="text-sm font-bold text-red-700 flex items-center gap-2 mb-1">
                                            <span className="material-symbols-outlined text-base">warning</span>Zona Berbahaya
                                        </p>
                                        <p className="text-xs text-red-500 mb-3">Tindakan di bawah ini tidak dapat dibatalkan.</p>
                                        <div className="flex flex-wrap gap-2">
                                            <button className="px-4 py-2 text-xs font-semibold text-red-600 border border-red-300 rounded-xl hover:bg-red-100 transition-colors">
                                                Reset Semua Pengaturan
                                            </button>
                                            <button className="px-4 py-2 text-xs font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors">
                                                Hapus Semua Data Demo
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ===== TAB TAMPILAN ===== */}
                            {activeTab === 'tampilan' && (
                                <div>
                                    <Field label="Tema" hint="Mode tampilan antarmuka admin">
                                        <div className="flex gap-2">
                                            {[{ v: 'light', icon: 'light_mode', l: 'Terang' }, { v: 'dark', icon: 'dark_mode', l: 'Gelap' }].map(t => (
                                                <button key={t.v} onClick={() => setTampilan({ ...tampilan, tema: t.v })}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all
                                                        ${tampilan.tema === t.v ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-blue-300'}`}>
                                                    <span className="material-symbols-outlined text-base">{t.icon}</span>{t.l}
                                                </button>
                                            ))}
                                        </div>
                                    </Field>
                                    <Field label="Warna Primer" hint="Warna aksen utama antarmuka">
                                        <div className="flex gap-2">
                                            {[
                                                { v: 'blue', cls: 'bg-blue-500' }, { v: 'indigo', cls: 'bg-indigo-500' },
                                                { v: 'purple', cls: 'bg-purple-500' }, { v: 'green', cls: 'bg-green-500' },
                                                { v: 'orange', cls: 'bg-orange-500' },
                                            ].map(w => (
                                                <button key={w.v} onClick={() => setTampilan({ ...tampilan, warnaPrimer: w.v })}
                                                    className={`w-8 h-8 ${w.cls} rounded-full transition-all ${tampilan.warnaPrimer === w.v ? 'ring-2 ring-offset-2 ring-blue-400 scale-110' : 'hover:scale-105'}`} />
                                            ))}
                                        </div>
                                    </Field>
                                    <Field label="Item per halaman" hint="Jumlah baris per halaman pada tabel">
                                        <Select value={tampilan.itemPerHalaman} onChange={v => setTampilan({ ...tampilan, itemPerHalaman: v })} options={[
                                            { v: '10', l: '10 item' }, { v: '25', l: '25 item' },
                                            { v: '50', l: '50 item' }, { v: '100', l: '100 item' },
                                        ]} />
                                    </Field>
                                    <Field label="Animasi antarmuka" hint="Aktifkan animasi dan transisi UI">
                                        <Toggle checked={tampilan.animasi} onChange={v => setTampilan({ ...tampilan, animasi: v })} />
                                    </Field>
                                    <Field label="Mode kompak" hint="Kurangi spasi untuk memuat lebih banyak konten">
                                        <Toggle checked={tampilan.kompakMode} onChange={v => setTampilan({ ...tampilan, kompakMode: v })} />
                                    </Field>
                                </div>
                            )}

                            {/* ===== TAB BACKUP ===== */}
                            {activeTab === 'backup' && (
                                <div className="space-y-4 py-4">
                                    {/* Info backup terakhir */}
                                    <div className="p-5 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-green-600 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_done</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-green-800">Backup Terakhir Berhasil</p>
                                            <p className="text-xs text-green-600 mt-0.5">16 Mei 2024, 00:00 WIB — Ukuran: 48.2 MB</p>
                                        </div>
                                    </div>

                                    {/* Aksi backup */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[
                                            { icon: 'backup', label: 'Backup Sekarang', desc: 'Buat salinan database saat ini', color: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100' },
                                            { icon: 'download', label: 'Unduh Backup', desc: 'Unduh file backup terakhir (.sql)', color: 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100' },
                                            { icon: 'restore', label: 'Pulihkan Backup', desc: 'Kembalikan data dari file backup', color: 'text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100' },
                                            { icon: 'schedule', label: 'Jadwal Otomatis', desc: 'Atur backup terjadwal setiap hari', color: 'text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100' },
                                        ].map(b => (
                                            <button key={b.label} className={`flex items-center gap-4 p-4 border rounded-2xl text-left transition-colors ${b.color}`}>
                                                <span className="material-symbols-outlined text-2xl shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>{b.icon}</span>
                                                <div>
                                                    <p className="font-semibold text-sm">{b.label}</p>
                                                    <p className="text-xs opacity-70 mt-0.5">{b.desc}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Riwayat backup */}
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Riwayat Backup</p>
                                        <div className="border border-slate-100 rounded-2xl overflow-hidden">
                                            {[
                                                { tgl: '16 Mei 2024, 00:00', ukuran: '48.2 MB', status: 'Sukses' },
                                                { tgl: '15 Mei 2024, 00:00', ukuran: '47.8 MB', status: 'Sukses' },
                                                { tgl: '14 Mei 2024, 00:00', ukuran: '47.1 MB', status: 'Sukses' },
                                                { tgl: '13 Mei 2024, 00:00', ukuran: '46.9 MB', status: 'Gagal'  },
                                            ].map((b, i) => (
                                                <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`material-symbols-outlined text-base ${b.status === 'Sukses' ? 'text-green-500' : 'text-red-400'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                                            {b.status === 'Sukses' ? 'check_circle' : 'cancel'}
                                                        </span>
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-700">{b.tgl}</p>
                                                            <p className="text-xs text-slate-400">{b.ukuran}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${b.status === 'Sukses' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>{b.status}</span>
                                                        {b.status === 'Sukses' && (
                                                            <button className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                                                <span className="material-symbols-outlined text-base">download</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                </div> {/* end flex gap-6 */}
            </div> {/* end flex flex-col */}

        </AdminLayout>
    );
}
