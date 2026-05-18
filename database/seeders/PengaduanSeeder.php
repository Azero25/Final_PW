<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PengaduanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Data khusus untuk demo sesuai yang ada di LacakPage.jsx
        \App\Models\Pengaduan::create([
            'nomor_tiket' => 'LPW-2024-001234',
            'judul' => 'Jalan Berlubang di Jl. Malioboro Km. 3',
            'kategori' => 'infrastruktur',
            'kecamatan' => 'Gedongtengen', // Using kecamatan to lokasi to align with UI initially, but let's use it as lokasi
            'lokasi' => 'Gedongtengen',
            'urgensi' => 'tinggi',
            'petugas' => 'Bpk. Ahmad Fauzi',
            'dinas' => 'Dinas Pekerjaan Umum Kota Yogyakarta',
            'deskripsi' => 'Terdapat lubang besar di badan jalan yang membahayakan pengendara, khususnya sepeda motor. Lubang berdiameter sekitar 50cm dengan kedalaman 15cm.',
            'status' => 'Sedang Diproses',
            'timeline' => [
                ['tanggal' => '10 Mei 2024, 09:30', 'status' => 'Laporan Diterima', 'keterangan' => 'Laporan Anda telah berhasil diterima dan sedang menunggu verifikasi.', 'icon' => 'check_circle', 'color' => 'text-green-500'],
                ['tanggal' => '11 Mei 2024, 14:00', 'status' => 'Verifikasi', 'keterangan' => 'Laporan telah diverifikasi oleh tim admin dan diteruskan ke dinas terkait.', 'icon' => 'verified', 'color' => 'text-blue-500'],
                ['tanggal' => '13 Mei 2024, 08:00', 'status' => 'Sedang Diproses', 'keterangan' => 'Petugas lapangan telah ditugaskan dan sedang dalam proses penanganan.', 'icon' => 'engineering', 'color' => 'text-yellow-500'],
            ],
            'created_at' => '2024-05-10 09:30:00'
        ]);

        \App\Models\Pengaduan::create([
            'nomor_tiket' => 'LPW-2024-005678',
            'judul' => 'Lampu PJU Mati di Jl. Kaliurang',
            'kategori' => 'pendidikan', // fallback or mapping
            'lokasi' => 'Depok',
            'urgensi' => 'sedang',
            'petugas' => 'Ibu Sari Dewi',
            'dinas' => 'Dinas Perhubungan Kota Yogyakarta',
            'deskripsi' => 'Lampu penerangan jalan umum di depan nomor 45 Jl. Kaliurang tidak menyala selama 3 hari terakhir, sehingga kawasan tersebut gelap pada malam hari.',
            'status' => 'Selesai',
            'timeline' => [
                ['tanggal' => '5 Mei 2024, 10:15', 'status' => 'Laporan Diterima', 'keterangan' => 'Laporan Anda telah berhasil diterima dan sedang menunggu verifikasi.', 'icon' => 'check_circle', 'color' => 'text-green-500'],
                ['tanggal' => '6 Mei 2024, 09:00', 'status' => 'Verifikasi', 'keterangan' => 'Laporan telah diverifikasi dan diteruskan ke Dinas Perhubungan.', 'icon' => 'verified', 'color' => 'text-blue-500'],
                ['tanggal' => '7 Mei 2024, 11:30', 'status' => 'Sedang Diproses', 'keterangan' => 'Teknisi sedang melakukan penggantian lampu PJU.', 'icon' => 'engineering', 'color' => 'text-yellow-500'],
                ['tanggal' => '8 Mei 2024, 16:00', 'status' => 'Selesai', 'keterangan' => 'Penggantian lampu PJU telah berhasil diselesaikan. Terima kasih atas laporan Anda!', 'icon' => 'task_alt', 'color' => 'text-green-500'],
            ],
            'created_at' => '2024-05-05 10:15:00'
        ]);

        // Generate 18 random records
        \App\Models\Pengaduan::factory(18)->create();
    }
}
