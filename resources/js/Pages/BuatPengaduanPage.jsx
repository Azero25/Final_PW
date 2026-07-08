import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet marker icon issue untuk production build
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Komponen Pembantu untuk Event Klik Peta
function LocationMarker({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

export default function BuatPengaduanPage() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // State Dasar Aplikasi
    const [user, setUser] = useState(null);
    const [isComplete, setIsComplete] = useState(true);
    const [missingFields, setMissingFields] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [kategoris, setKategoris] = useState([]);

    // State Media Lampiran (WebP Converter)
    const [uploadedImages, setUploadedImages] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [convertingCount, setConvertingCount] = useState(0);

    // State Identitas Pengguna (Prefilled)
    const [identitas, setIdentitas] = useState({ nama: '', telepon: '' });

    // State Peta Terintegrasi & Lokasi
    const [lokasiVal, setLokasiVal] = useState('');
    const [mapOpen, setMapOpen] = useState(false);
    const [mapPosition, setMapPosition] = useState({ lat: -7.7956, lng: 110.3695 }); // Default: Yogyakarta
    const [isGeocoding, setIsGeocoding] = useState(false);
    // State Simpan Data Wilayah Administratif dari Geocoding Peta untuk Auto-Creation
    const [mapWilayahData, setMapWilayahData] = useState({ provinsi: '', kabupaten: '', kecamatan: '', kelurahan: '' });

    // State Manajemen ID & Wilayah Cascading Manual
    const [selectedIds, setSelectedIds] = useState({ id_provinsi: null, id_kabupaten: null, id_kecamatan: null, id_kelurahan: null });
    const [suggestions, setSuggestions] = useState({ provinsi: [], kabupaten: [], kecamatan: [], kelurahan: [] });
    const [activeDropdown, setActiveDropdown] = useState(null);

    // Auto-Konversi Gambar ke WebP via Canvas API
    const convertToWebP = (file) => {
        return new Promise((resolve) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                canvas.toBlob(
                    (blob) => {
                        URL.revokeObjectURL(url);
                        const webpFile = new File(
                            [blob],
                            file.name.replace(/\.[^.]+$/, '.webp'),
                            { type: 'image/webp' }
                        );
                        const previewUrl = URL.createObjectURL(blob);
                        resolve({ file: webpFile, previewUrl, originalName: file.name, originalSize: file.size });
                    },
                    'image/webp',
                    0.85
                );
            };
            img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
            img.src = url;
        });
    };

    // Upload & Validation Handler Lampiran Gambar
    const handleImageFiles = async (files) => {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff', 'image/webp'];
        const validFiles = Array.from(files).filter(f => validTypes.includes(f.type) && f.size <= 10 * 1024 * 1024);

        if (validFiles.length === 0) {
            showToast('Format tidak didukung atau file terlalu besar (Maks. 10MB).', 'error');
            return;
        }

        const remaining = 5 - uploadedImages.length;
        if (remaining <= 0) {
            showToast('Maksimal 5 gambar yang dapat diunggah.', 'error');
            return;
        }

        const toProcess = validFiles.slice(0, remaining);
        setConvertingCount(toProcess.length);

        const results = await Promise.all(toProcess.map(convertToWebP));
        const converted = results.filter(Boolean);

        setUploadedImages(prev => [...prev, ...converted]);
        setConvertingCount(0);

        if (converted.length > 0) {
            showToast(`${converted.length} gambar berhasil dikonversi ke WebP!`, 'success');
        }
    };

    const handleFileInputChange = (e) => handleImageFiles(e.target.files);
    const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); handleImageFiles(e.dataTransfer.files); };
    const removeImage = (idx) => {
        setUploadedImages(prev => {
            URL.revokeObjectURL(prev[idx].previewUrl);
            return prev.filter((_, i) => i !== idx);
        });
    };
    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    // Fungsi Konfirmasi Peta & Auto-Lookup ke Database Cascading Anda
    const handleConfirmMap = async () => {
        setIsGeocoding(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${mapPosition.lat}&lon=${mapPosition.lng}`);
            const data = await res.json();

            const displayAddress = data.display_name || `${mapPosition.lat}, ${mapPosition.lng}`;
            setLokasiVal(displayAddress);

            // Ambil data detail wilayah dari OSM Nominatim
            const addr = data.address || {};
            
            // Bersihkan nama wilayah
            const cleanPrefix = (str) => {
                if (!str || typeof str !== 'string') return '';
                return str.replace(/^(kelurahan|desa|kecamatan|kabupaten|kota|provinsi)\s+/i, '').trim();
            };

            const mapProv = cleanPrefix(addr.state || addr.province || addr.region);
            const mapKab = cleanPrefix(addr.city || addr.regency || addr.county || addr.municipality);
            const mapKec = cleanPrefix(addr.district || addr.subdistrict || addr.city_district);
            const mapKel = cleanPrefix(addr.village || addr.suburb || addr.hamlet || addr.neighbourhood || addr.quarter);

            setMapWilayahData({
                provinsi: mapProv,
                kabupaten: mapKab,
                kecamatan: mapKec,
                kelurahan: mapKel
            });

            // Daftar kunci alamat Nominatim yang mungkin menyimpan nama kelurahan/desa
            const addressKeys = ['village', 'suburb', 'hamlet', 'neighbourhood', 'quarter', 'municipality', 'city_district'];
            let foundKelurahan = null;

            for (const key of addressKeys) {
                const name = data.address?.[key];
                if (name && typeof name === 'string' && name.trim()) {
                    // 1. Coba pencarian dengan nama yang dibersihkan (menghapus awalan Kelurahan/Desa)
                    const cleaned = cleanPrefix(name);
                    if (cleaned.length >= 2) {
                        try {
                            const response = await fetch(`/api/wilayah/search-cascading?type=kelurahan&q=${encodeURIComponent(cleaned)}&parent_id=null`);
                            if (response.ok) {
                                const dataWilayah = await response.json();
                                if (dataWilayah && dataWilayah.length > 0) {
                                    foundKelurahan = dataWilayah[0];
                                    break;
                                }
                            }
                        } catch (err) {
                            console.error(`Gagal mencocokkan kelurahan dibersihkan (${cleaned}):`, err);
                        }
                    }

                    // 2. Coba pencarian dengan nama asli dari Nominatim jika belum cocok
                    try {
                        const response = await fetch(`/api/wilayah/search-cascading?type=kelurahan&q=${encodeURIComponent(name.trim())}&parent_id=null`);
                        if (response.ok) {
                            const dataWilayah = await response.json();
                            if (dataWilayah && dataWilayah.length > 0) {
                                foundKelurahan = dataWilayah[0];
                                break;
                            }
                        }
                    } catch (err) {
                        console.error(`Gagal mencocokkan kelurahan asli (${name}):`, err);
                    }
                }
            }

            if (foundKelurahan) {
                setSelectedIds(prev => ({ ...prev, id_kelurahan: foundKelurahan.id_kelurahan }));
                console.log(`Peta tersinkronisasi otomatis dengan Database ID Kelurahan: ${foundKelurahan.id_kelurahan} (${foundKelurahan.nama_kelurahan})`);
            } else {
                setSelectedIds(prev => ({ ...prev, id_kelurahan: null }));
                console.warn("Nama wilayah dari peta belum terdaftar di master data.");
            }
        } catch (e) {
            console.error("Gagal melakukan sinkronisasi koordinat peta:", e);
            setLokasiVal(`${mapPosition.lat}, ${mapPosition.lng}`);
        } finally {
            setIsGeocoding(false);
            setMapOpen(false);
        }
    };

    // Fungsi Pencarian Wilayah Manual Cascading Dropdown
    const handleManualSearch = async (type, query) => {
        setLokasiVal(query);
        setSelectedIds(prev => ({ ...prev, [`id_${type}`]: null }));
        setMapWilayahData({ provinsi: '', kabupaten: '', kecamatan: '', kelurahan: '' });

        let parentId = null;
        if (type === 'kabupaten') parentId = selectedIds.id_provinsi;
        if (type === 'kecamatan') parentId = selectedIds.id_kabupaten;
        if (type === 'kelurahan') parentId = selectedIds.id_kecamatan;

        if (query.trim().length < 2) {
            setSuggestions(prev => ({ ...prev, [type]: [] }));
            return;
        }

        try {
            const response = await fetch(`/api/wilayah/search-cascading?type=${type}&q=${encodeURIComponent(query)}&parent_id=${parentId}`);
            if (response.ok) {
                const data = await response.json();
                setSuggestions(prev => ({ ...prev, [type]: data }));
                setActiveDropdown(type);
            }
        } catch (error) {
            console.error(`Gagal memuat search ${type}:`, error);
        }
    };

    const handleSelectManual = (type, item) => {
        if (type === 'provinsi') {
            setLokasiVal(item.nama_provinsi);
            setSelectedIds({ id_provinsi: item.id_provinsi, id_kabupaten: null, id_kecamatan: null, id_kelurahan: null });
        } else if (type === 'kabupaten') {
            setLokasiVal(`${lokasiVal}, ${item.nama_kabupaten}`);
            setSelectedIds(prev => ({ ...prev, id_kabupaten: item.id_kabupaten, id_kecamatan: null, id_kelurahan: null }));
        } else if (type === 'kecamatan') {
            setLokasiVal(`${lokasiVal}, ${item.nama_kecamatan}`);
            setSelectedIds(prev => ({ ...prev, id_kecamatan: item.id_kecamatan, id_kelurahan: null }));
        } else if (type === 'kelurahan') {
            setLokasiVal(`${lokasiVal}, ${item.nama_kelurahan}`);
            setSelectedIds(prev => ({ ...prev, id_kelurahan: item.id_kelurahan }));
        }
        setActiveDropdown(null);
    };

    // Efek Lifecycle & Autentikasi Pengguna
    useEffect(() => {
        window.scrollTo(0, 0);

        const sesi = sessionStorage.getItem('user');
        if (!sesi) {
            navigate('/login', { state: { from: { pathname: '/buat-pengaduan' } } });
            return;
        }

        const activeUser = JSON.parse(sesi);
        setUser(activeUser);

        const validateProfile = async () => {
            try {
                const res = await fetch('/api/me', {
                    headers: { 'Accept': 'application/json' },
                    credentials: 'include'
                });

                if (!res.ok) {
                    navigate('/login', { state: { from: { pathname: '/buat-pengaduan' } } });
                    return;
                }

                const data = await res.json();
                const serverUser = data.user;

                if (!serverUser) {
                    navigate('/login', { state: { from: { pathname: '/buat-pengaduan' } } });
                    return;
                }

                setIdentitas({
                    nama: serverUser.nama_lengkap || activeUser.nama || '',
                    telepon: serverUser.no_hp || ''
                });

                const missing = [];
                if (!serverUser.nik || String(serverUser.nik).trim().length !== 16 || isNaN(serverUser.nik)) {
                    missing.push('Nomor Induk Kependudukan (NIK - 16 Digit)');
                }
                if (!serverUser.alamat_lengkap || !serverUser.alamat_lengkap.trim()) {
                    missing.push('Alamat Tinggal Lengkap');
                }

                const kelurahanNama = serverUser.kelurahan?.nama_kelurahan;
                const kecamatanNama = serverUser.kelurahan?.kecamatan?.nama_kecamatan;
                const kabupatenNama = serverUser.kelurahan?.kecamatan?.kabupaten?.nama_kabupaten;
                const provinsiNama = serverUser.kelurahan?.kecamatan?.kabupaten?.provinsi?.nama_provinsi;

                if (!kelurahanNama || !kelurahanNama.trim()) missing.push('Desa / Kelurahan');
                if (!kecamatanNama || !kecamatanNama.trim()) missing.push('Kecamatan');
                if (!kabupatenNama || !kabupatenNama.trim()) missing.push('Kabupaten / Kota');
                if (!provinsiNama || !provinsiNama.trim()) missing.push('Provinsi');

                if (missing.length > 0) {
                    setIsComplete(false);
                    setMissingFields(missing);
                } else {
                    setIsComplete(true);
                }
            } catch (err) {
                console.error('Gagal memvalidasi profile data kependudukan:', err);
                setIsComplete(true);
            }
        };

        validateProfile();

        const fetchKategoris = async () => {
            try {
                const res = await fetch('/api/kategoris');
                if (res.ok) {
                    const data = await res.json();
                    setKategoris(data.filter(k => k.aktif));
                }
            } catch (err) {
                console.error("Gagal memuat kategori aduan:", err);
            }
        };
        fetchKategoris();
    }, [navigate]);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type }), 3000);
    };

    // Submit Handler Form ke API Backend Pengaduan
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const judul = document.getElementById('judul')?.value;
        const kategori = document.getElementById('kategori')?.value;
        const lokasi = lokasiVal || document.getElementById('lokasi')?.value;
        const deskripsi = document.getElementById('deskripsi')?.value;
        const urgensi = document.querySelector('input[name="urgensi"]:checked')?.value || 'sedang';
        const anonim = document.getElementById('anonim')?.checked || false;

        if (!judul || !kategori || !lokasi || !deskripsi) {
            showToast('Semua kolom detail laporan pengaduan wajib diisi!', 'error');
            return;
        }

        setSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('nama', identitas.nama);
            formData.append('nohp', identitas.telepon);
            formData.append('anonim', anonim ? '1' : '0');
            formData.append('judul', judul);
            formData.append('kategori', kategori);
            formData.append('urgensi', urgensi);
            formData.append('lokasi', lokasi); // string alamat tekstual
            formData.append('deskripsi', deskripsi);

            // Sertakan ID Kelurahan kuncian (peta/dropdown) jika tervalidasi ada di database
            if (selectedIds.id_kelurahan) {
                formData.append('id_kelurahan', selectedIds.id_kelurahan);
            }

            // Kirim detail wilayah dari peta untuk auto-creation jika belum ada di database
            if (mapWilayahData.provinsi) formData.append('map_provinsi', mapWilayahData.provinsi);
            if (mapWilayahData.kabupaten) formData.append('map_kabupaten', mapWilayahData.kabupaten);
            if (mapWilayahData.kecamatan) formData.append('map_kecamatan', mapWilayahData.kecamatan);
            if (mapWilayahData.kelurahan) formData.append('map_kelurahan', mapWilayahData.kelurahan);

            uploadedImages.forEach((img, idx) => {
                formData.append(`gambar[${idx}]`, img.file, img.file.name);
            });

            const response = await fetch('/api/pengaduans', {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Terjadi kesalahan saat mengirim pengaduan.');
            }

            showToast('Laporan pengaduan Anda berhasil dikirim ke sistem!', 'success');

            setTimeout(() => {
                const tiket = data.data?.nomor_tiket || data.data?.no_ticket;
                navigate(tiket ? `/lacak?tiket=${tiket}` : '/lacak');
            }, 1500);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col antialiased">
            <Navbar />

            {toast.show && (
                <div className={`fixed top-24 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl transition-all duration-300 border
                    ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}
                >
                    <span className="material-symbols-outlined text-2xl shrink-0">
                        {toast.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    <p className="text-sm font-semibold">{toast.message}</p>
                </div>
            )}

            <main className="grow pt-32 pb-24 px-6 md:px-margin max-w-4xl mx-auto w-full flex flex-col gap-8">
                {!isComplete ? (
                    <div className="bg-white rounded-3xl border border-red-100 shadow-[0px_15px_50px_rgba(239,68,68,0.06)] p-8 md:p-12 text-center max-w-2xl mx-auto my-8 relative overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-red-500 to-amber-500"></div>
                        <div className="w-20 h-20 bg-red-50 border border-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>person_alert</span>
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Profil Anda Belum Lengkap!</h2>
                        <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                            Berdasarkan kebijakan sistem kependudukan LaporWarga, Anda wajib melengkapi informasi profil diri Anda terlebih dahulu sebelum dapat mengirimkan laporan pengaduan.
                        </p>
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 my-6 text-left">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm">warning</span>
                                Data Berikut Wajib Dilengkapi:
                            </h4>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {missingFields.map((field, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                                        <span className="w-2 h-2 bg-red-500 rounded-full shrink-0 animate-pulse"></span>
                                        {field}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                            <Link to="/" className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors text-sm">
                                Kembali ke Beranda
                            </Link>
                            <Link to="/profile" className="px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-[0px_5px_25px_rgba(37,99,235,0.2)] transition-all text-sm flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-lg">manage_accounts</span>
                                Lengkapi Profil Sekarang
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="text-center space-y-4">
                            <h1 className="font-h1 text-4xl md:text-5xl font-bold text-on-surface">Buat Laporan Baru</h1>
                            <p className="font-body-lg text-lg text-on-surface-variant max-w-2xl mx-auto">Sampaikan pengaduan Anda dengan jelas dan lengkap untuk tindak lanjut yang cepat.</p>
                        </div>

                        <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,102,204,0.05)] p-8 md:p-10 border border-surface-container-low relative overflow-hidden">
                            <form onSubmit={handleFormSubmit} className="space-y-8 relative z-10">
                                {/* Section Identitas */}
                                <div className="space-y-4">
                                    <h2 className="font-h3 text-2xl font-semibold text-on-surface border-b border-surface-variant pb-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-600">contact_mail</span>
                                        Identitas Pelapor
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 flex flex-col justify-end">
                                            <label className="font-label-bold text-sm font-semibold text-on-surface-variant" htmlFor="nama">Nama Lengkap</label>
                                            <input className="w-full bg-[#F1F5F9] border border-outline-variant focus:border-primary-container rounded-lg px-4 py-3 font-body-md text-on-surface outline-none cursor-not-allowed" id="nama" type="text" value={identitas.nama} disabled />
                                        </div>
                                        <div className="space-y-2 flex flex-col justify-end">
                                            <label className="font-label-bold text-sm font-semibold text-on-surface-variant" htmlFor="nohp">Nomor HP / WhatsApp</label>
                                            <input className="w-full bg-[#F1F5F9] border border-outline-variant focus:border-primary-container rounded-lg px-4 py-3 font-body-md text-on-surface outline-none cursor-not-allowed" id="nohp" type="tel" value={identitas.telepon} disabled />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 pt-2">
                                        <input className="w-5 h-5 rounded border-outline-variant text-primary-container focus:ring-primary-container cursor-pointer" id="anonim" type="checkbox" />
                                        <label className="font-body-md text-on-surface-variant cursor-pointer select-none" htmlFor="anonim">Lapor sebagai Anonim (Identitas dirahasiakan)</label>
                                    </div>
                                </div>

                                {/* Section Detail Aduan */}
                                <div className="space-y-4 pt-4">
                                    <h2 className="font-h3 text-2xl font-semibold text-on-surface border-b border-surface-variant pb-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-600">article</span>
                                        Detail Laporan
                                    </h2>
                                    <div className="space-y-2">
                                        <label className="font-label-bold text-sm font-semibold text-on-surface-variant" htmlFor="judul">Judul Laporan</label>
                                        <input className="w-full bg-[#F1F5F9] border border-outline-variant focus:border-primary-container rounded-lg px-4 py-3 font-body-md text-on-surface outline-none" id="judul" placeholder="Singkat, padat, dan jelas (Maks. 50 karakter)" type="text" maxLength={50} required />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="font-label-bold text-sm font-semibold text-on-surface-variant" htmlFor="kategori">Kategori Pengaduan</label>
                                            <div className="relative">
                                                <select className="w-full bg-[#F1F5F9] border border-outline-variant focus:border-primary-container rounded-lg px-4 py-3 font-body-md text-on-surface appearance-none focus:ring-2 focus:ring-primary-container/20 transition-colors outline-none cursor-pointer" id="kategori" defaultValue="" required>
                                                    <option disabled value="">Pilih Kategori</option>
                                                    {kategoris.map(k => (
                                                        <option key={k.original_id} value={k.nama.toLowerCase()}>{k.nama}</option>
                                                    ))}
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

                                    {/* Input Lokasi Terintegrasi dengan Peta & Dropdown Cascading */}
                                    <div className="space-y-2 relative">
                                        <label className="font-label-bold text-sm font-semibold text-on-surface-variant" htmlFor="lokasi">Lokasi Kejadian (Cari Wilayah Manual / Gunakan Peta)</label>
                                        <div className="flex gap-2">
                                            <div className="relative grow">
                                                <input
                                                    className="w-full bg-[#F1F5F9] border border-outline-variant focus:border-primary-container rounded-lg px-4 py-3 font-body-md text-on-surface outline-none"
                                                    id="lokasi"
                                                    placeholder="Ketik wilayah kependudukan untuk menyaring data..."
                                                    type="text"
                                                    value={lokasiVal}
                                                    onChange={(e) => handleManualSearch('kelurahan', e.target.value)}
                                                    onBlur={() => setTimeout(() => setActiveDropdown(null), 200)}
                                                    required
                                                />
                                                {/* Dropdown Hasil Pencarian Wilayah Manual */}
                                                {activeDropdown === 'kelurahan' && suggestions.kelurahan.length > 0 && (
                                                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                                        {suggestions.kelurahan.map((item, index) => (
                                                            <div
                                                                key={index}
                                                                onMouseDown={() => handleSelectManual('kelurahan', item)}
                                                                className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-sm text-slate-700 font-medium border-b border-slate-50 transition-colors"
                                                            >
                                                                {item.nama_kelurahan}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => setMapOpen(true)}
                                                className="bg-surface-container text-on-surface-variant px-4 rounded-lg border border-outline-variant hover:bg-surface-variant transition-colors flex items-center justify-center cursor-pointer active:scale-95"
                                                type="button"
                                                title="Pilih Lokasi di Peta"
                                            >
                                                <span className="material-symbols-outlined">location_on</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="font-label-bold text-sm font-semibold text-on-surface-variant" htmlFor="deskripsi">Deskripsi Lengkap</label>
                                        <textarea className="w-full bg-[#F1F5F9] border border-outline-variant focus:border-primary-container rounded-lg px-4 py-3 font-body-md text-on-surface resize-y outline-none" id="deskripsi" placeholder="Ceritakan kronologi atau detail masalah secara jelas..." rows="5" required></textarea>
                                    </div>
                                </div>

                                {/* Section Media Lampiran */}
                                <div className="space-y-4 pt-4">
                                    <h2 className="font-h3 text-2xl font-semibold text-on-surface border-b border-surface-variant pb-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-600">attach_file</span>
                                        Bukti Lampiran
                                        <span className="ml-auto text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <span className="material-symbols-outlined text-xs" style={{ fontSize: '14px' }}>auto_awesome</span>
                                            Auto-konversi ke WebP
                                        </span>
                                    </h2>

                                    <input ref={fileInputRef} type="file" id="gambar-input" accept="image/jpeg,image/png,image/gif,image/bmp,image/tiff,image/webp" multiple className="hidden" onChange={handleFileInputChange} />

                                    <div
                                        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer group
                                            ${isDragging ? 'border-blue-500 bg-blue-50 scale-[1.01]' : uploadedImages.length >= 5 ? 'border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed' : 'border-outline-variant bg-[#F1F5F9] hover:bg-blue-50/50 hover:border-primary-container/50'}`}
                                        onClick={() => uploadedImages.length < 5 && fileInputRef.current?.click()}
                                        onDragOver={(e) => { e.preventDefault(); if (uploadedImages.length < 5) setIsDragging(true); }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={handleDrop}
                                    >
                                        {convertingCount > 0 ? (
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="relative w-14 h-14">
                                                    <svg className="animate-spin w-14 h-14 text-blue-500" viewBox="0 0 24 24" fill="none">
                                                        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                                        <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                    <span className="absolute inset-0 flex items-center justify-center material-symbols-outlined text-blue-500 text-xl">autorenew</span>
                                                </div>
                                                <p className="font-semibold text-blue-600 text-sm">Mengkonversi {convertingCount} gambar ke WebP...</p>
                                            </div>
                                        ) : (
                                            <>
                                                <span className={`material-symbols-outlined text-4xl mb-2 transition-colors ${isDragging ? 'text-blue-500' : 'text-outline group-hover:text-primary-container'}`}>cloud_upload</span>
                                                <p className={`font-label-bold text-sm font-semibold transition-colors ${isDragging ? 'text-blue-600' : 'text-on-surface group-hover:text-primary-container'}`}>
                                                    {uploadedImages.length >= 5 ? 'Batas maksimal 5 gambar tercapai' : 'Klik atau seret foto ke sini'}
                                                </p>
                                                <p className="font-body-sm text-xs text-on-surface-variant mt-1">
                                                    JPG, PNG, GIF, BMP, TIFF (Maks. 10MB) • Otomatis dikonversi ke <span className="font-bold text-blue-500">WebP</span>
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1">{uploadedImages.length}/5 gambar diunggah</p>
                                            </>
                                        )}
                                    </div>

                                    {uploadedImages.length > 0 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-2">
                                            {uploadedImages.map((img, idx) => (
                                                <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white aspect-square animate-in fade-in zoom-in-95 duration-150">
                                                    <img src={img.previewUrl} alt={img.file.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                                                        <p className="text-white text-[10px] font-semibold truncate leading-tight">{img.file.name}</p>
                                                        <p className="text-slate-300 text-[9px]">
                                                            <span className="line-through">{formatSize(img.originalSize)}</span>
                                                            {' → '}
                                                            <span className="text-green-300 font-bold">{formatSize(img.file.size)}</span>
                                                        </p>
                                                    </div>
                                                    <div className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shadow">WebP</div>
                                                    <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(idx); }} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow hover:bg-red-600 cursor-pointer">
                                                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {uploadedImages.length > 0 && (
                                        <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                                            <span className="material-symbols-outlined text-base" style={{ fontSize: '16px' }}>check_circle</span>
                                            <span>
                                                <strong>{uploadedImages.length} gambar</strong> telah dikonversi ke format WebP • Penghematan: <strong>{formatSize(uploadedImages.reduce((a, i) => a + i.originalSize - i.file.size, 0))}</strong>
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Submit & Form Actions */}
                                <div className="pt-8 flex flex-col-reverse md:flex-row justify-end gap-4 border-t border-surface-variant mt-4">
                                    <Link to="/" className="px-6 py-3 rounded-lg border border-primary-container text-primary-container font-semibold hover:bg-primary-container/5 transition-colors text-center">
                                        Batal
                                    </Link>
                                    <button type="submit" disabled={submitting} className="px-8 py-3 rounded-lg bg-primary-container text-white font-semibold hover:opacity-90 shadow-[0px_10px_30px_rgba(0,102,204,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                                        {submitting ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                <span>Mengirim Laporan...</span>
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

            {/* Modal Peta Leaflet Full Overlay */}
            {mapOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-slate-100">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">map</span>
                                Pilih Titik Lokasi Kejadian
                            </h3>
                            <button type="button" onClick={() => setMapOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="h-100 w-full bg-slate-100 relative">
                            <MapContainer center={[mapPosition.lat, mapPosition.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <LocationMarker position={mapPosition} setPosition={setMapPosition} />
                            </MapContainer>
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-400 bg-white px-4 py-2 rounded-full shadow-md text-xs font-bold text-slate-600 pointer-events-none">
                                Klik di area peta untuk memindahkan pin lokasi
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
                            <div className="grow">
                                <p className="text-xs text-slate-500 font-medium">Koordinat Terpilih:</p>
                                <p className="font-mono text-sm font-bold text-slate-700">{mapPosition.lat.toFixed(6)}, {mapPosition.lng.toFixed(6)}</p>
                            </div>
                            <button type="button" onClick={handleConfirmMap} disabled={isGeocoding} className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-md">
                                {isGeocoding ? 'Menyusun Alamat...' : 'Gunakan Lokasi Ini'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
