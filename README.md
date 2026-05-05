# 📢 Sistem Pengaduan Masyarakat Tersentralisasi

Aplikasi **Sistem Pengaduan Masyarakat Tersentralisasi** adalah platform berbasis web yang memungkinkan masyarakat untuk menyampaikan pengaduan secara terstruktur, cepat, dan transparan. Sistem ini dirancang untuk mempermudah proses pelaporan, pengelolaan, serta tindak lanjut pengaduan oleh pihak berwenang.

---

## 📝 Deskripsi

Sistem ini menyediakan layanan digital bagi masyarakat untuk:

- Mengirim laporan/pengaduan secara online
- Melihat status pengaduan secara real-time
- Mendapatkan respon dari pihak terkait

Di sisi admin, sistem ini memungkinkan:

- Mengelola data pengaduan
- Memverifikasi laporan
- Memberikan tanggapan atau solusi
- Monitoring seluruh aktivitas pengaduan secara terpusat

---

## 🚀 Fitur Utama

### 👤 User (Masyarakat)
- Registrasi & Login
- Mengirim pengaduan
- Upload bukti (gambar/dokumen)
- Melihat riwayat pengaduan
- Tracking status (diproses / selesai)

### 🛠️ Admin
- Dashboard monitoring
- Verifikasi pengaduan
- Kelola data pengguna
- Update status pengaduan
- Memberikan tanggapan

---

## 🧰 Tech Stack

Project ini dibangun menggunakan:

- **Backend:** Laravel  
- **Frontend:** Blade (Laravel View)  
- **Styling:** TailwindCSS  
- **Database:** MySQL / MariaDB  
- **Build Tool:** Vite  

---

## 📂 Struktur Folder (Sederhana)
```
├── app/
├── database/
├── public/
├── resources/
│   ├── views/
│   ├── css/
│   └── js/
├── routes/
│   ├── web.php
│   └── api.php
└── ...
```


---

## ⚙️ Instalasi

Ikuti langkah berikut untuk menjalankan project:

### 1. Clone Repository
```bash
git clone https://github.com/Azero25/sistem-pengaduan.git
cd sistem-pengaduan
```

### 2. Install Dependency
```bash
composer install
npm install
```

### 3. Setup Environment
```bash
cp .env.example .env
php artisan key:generate
```

### 4. Konfigurasi Database
```bash
DB_DATABASE=nama_database
DB_USERNAME=root
DB_PASSWORD=
```

### 5. Migrasi Database
```bash
php artisan migrate
```

### 6. Jalankan Project
```bash
php artisan serve
npm run dev
```

Akses di : 
```bash
http://127.0.0.1:8000
```
