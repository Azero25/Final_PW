<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Laporan;
use App\Models\Kategori;
use App\Models\Kelurahan;
use App\Models\Kecamatan;
use App\Models\Provinsi;
use App\Models\Dinas;
use App\Models\Petugas;
use App\Models\Jabatan;
use App\Models\User;

class PengaduanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $provinsi = Provinsi::firstOrCreate(['nama_provinsi' => 'Provinsi D.I. Yogyakarta']);
        
        // Define ALL nine Dinas requested by the user
        $dinasPUPR = Dinas::firstOrCreate(
            ['nama_dinas' => 'Dinas Pekerjaan Umum dan Penataan Ruang'],
            ['singkatan' => 'PUPR']
        );
        $dinasDLH = Dinas::firstOrCreate(
            ['nama_dinas' => 'Dinas Lingkungan Hidup'],
            ['singkatan' => 'DLH']
        );
        $dinasKesehatan = Dinas::firstOrCreate(
            ['nama_dinas' => 'Dinas Kesehatan'],
            ['singkatan' => 'Dinas Kesehatan']
        );
        $dinasPerhubungan = Dinas::firstOrCreate(
            ['nama_dinas' => 'Dinas Perhubungan'],
            ['singkatan' => 'Dinas Perhubungan']
        );
        $dinasPerkim = Dinas::firstOrCreate(
            ['nama_dinas' => 'Dinas Perumahan dan Kawasan Permukiman'],
            ['singkatan' => 'Perkim']
        );
        $dinasPendidikan = Dinas::firstOrCreate(
            ['nama_dinas' => 'Dinas Pendidikan'],
            ['singkatan' => 'Dinas Pendidikan']
        );
        $dinasSosial = Dinas::firstOrCreate(
            ['nama_dinas' => 'Dinas Sosial'],
            ['singkatan' => 'Dinsos']
        );
        $dinasSatpolPP = Dinas::firstOrCreate(
            ['nama_dinas' => 'Satuan Polisi Pamong Praja'],
            ['singkatan' => 'Satpol PP']
        );
        $dinasBPBD = Dinas::firstOrCreate(
            ['nama_dinas' => 'Badan Penanggulangan Bencana Daerah'],
            ['singkatan' => 'BPBD']
        );

        // Map categories to all nine Dinas
        $katInfras = Kategori::firstOrCreate(['nama_kategori' => 'infrastruktur'], ['id_dinas' => $dinasPUPR->id_dinas]);
        $katKebersihan = Kategori::firstOrCreate(['nama_kategori' => 'kebersihan'], ['id_dinas' => $dinasDLH->id_dinas]);
        $katKesehatan = Kategori::firstOrCreate(['nama_kategori' => 'kesehatan'], ['id_dinas' => $dinasKesehatan->id_dinas]);
        $katTransportasi = Kategori::firstOrCreate(['nama_kategori' => 'transportasi'], ['id_dinas' => $dinasPerhubungan->id_dinas]);
        $katPerumahan = Kategori::firstOrCreate(['nama_kategori' => 'perumahan'], ['id_dinas' => $dinasPerkim->id_dinas]);
        $katPendidikan = Kategori::firstOrCreate(['nama_kategori' => 'pendidikan'], ['id_dinas' => $dinasPendidikan->id_dinas]);
        $katSosial = Kategori::firstOrCreate(['nama_kategori' => 'sosial'], ['id_dinas' => $dinasSosial->id_dinas]);
        $katKetertiban = Kategori::firstOrCreate(['nama_kategori' => 'ketertiban'], ['id_dinas' => $dinasSatpolPP->id_dinas]);
        $katKedaruratan = Kategori::firstOrCreate(['nama_kategori' => 'kedaruratan'], ['id_dinas' => $dinasBPBD->id_dinas]);
        $katLainnya = Kategori::firstOrCreate(['nama_kategori' => 'lainnya'], ['id_dinas' => $dinasPUPR->id_dinas]);

        // Demo 1: Jalan Berlubang di Malioboro
        $kec1 = Kecamatan::firstOrCreate(['nama_kecamatan' => 'Gedongtengen', 'id_provinsi' => $provinsi->id_provinsi]);
        $kel1 = Kelurahan::firstOrCreate(['nama_kelurahan' => 'Gedongtengen', 'id_kecamatan' => $kec1->id_kecamatan]);
        $jab1 = Jabatan::firstOrCreate(['nama_jabatan' => 'Petugas Lapangan']);
        $pet1 = Petugas::firstOrCreate(
            ['nama_petugas' => 'Bpk. Ahmad Fauzi'],
            [
                'id_jabatan' => $jab1->id_jabatan,
                'id_dinas' => $dinasPUPR->id_dinas,
                'NIP' => '198504122010011002',
                'username' => 'ahmad_fauzi',
                'password' => bcrypt('petugas123')
            ]
        );
        $user1 = User::firstOrCreate(['nama_lengkap' => 'Budi Santoso'], [
            'email' => 'warga@email.com',
            'password' => bcrypt('warga123'),
            'role' => 'warga'
        ]);

        Laporan::create([
            'no_ticket' => 'LPW-2024-001234',
            'judul_laporan' => 'Jalan Berlubang di Jl. Malioboro Km. 3',
            'id_kategori' => $katInfras->id_kategori,
            'id_kelurahan' => $kel1->id_kelurahan,
            'id_user' => $user1->id_user,
            'id_petugas' => $pet1->id_petugas,
            'prioritas' => 'Tinggi',
            'status_laporan' => 'Sedang Diproses',
            'isi_laporan' => 'Terdapat lubang besar di badan jalan yang membahayakan pengendara, khususnya sepeda motor. Lubang berdiameter sekitar 50cm dengan kedalaman 15cm.',
            'timeline_log' => [
                ['tanggal' => '10 Mei 2024, 09:30', 'status' => 'Laporan Diterima', 'keterangan' => 'Laporan Anda telah berhasil diterima dan sedang menunggu verifikasi.', 'icon' => 'check_circle', 'color' => 'text-green-500'],
                ['tanggal' => '11 Mei 2024, 14:00', 'status' => 'Verifikasi', 'keterangan' => 'Laporan telah diverifikasi oleh tim admin dan diteruskan ke dinas terkait.', 'icon' => 'verified', 'color' => 'text-blue-500'],
                ['tanggal' => '13 Mei 2024, 08:00', 'status' => 'Sedang Diproses', 'keterangan' => 'Petugas lapangan telah ditugaskan dan sedang dalam proses penanganan.', 'icon' => 'engineering', 'color' => 'text-yellow-500'],
            ],
            'tanggal_laporan' => '2024-05-10 09:30:00'
        ]);

        // Demo 2: Lampu PJU Mati
        $kec2 = Kecamatan::firstOrCreate(['nama_kecamatan' => 'Depok', 'id_provinsi' => $provinsi->id_provinsi]);
        $kel2 = Kelurahan::firstOrCreate(['nama_kelurahan' => 'Depok', 'id_kecamatan' => $kec2->id_kecamatan]);
        $jab2 = Jabatan::firstOrCreate(['nama_jabatan' => 'Teknisi Dishub']);
        $pet2 = Petugas::firstOrCreate(
            ['nama_petugas' => 'Ibu Sari Dewi'],
            [
                'id_jabatan' => $jab2->id_jabatan,
                'id_dinas' => $dinasPerhubungan->id_dinas,
                'NIP' => '199008202015032001',
                'username' => 'sari_dewi',
                'password' => bcrypt('petugas123')
            ]
        );

        Laporan::create([
            'no_ticket' => 'LPW-2024-005678',
            'judul_laporan' => 'Lampu PJU Mati di Jl. Kaliurang',
            'id_kategori' => $katTransportasi->id_kategori,
            'id_kelurahan' => $kel2->id_kelurahan,
            'id_user' => $user1->id_user,
            'id_petugas' => $pet2->id_petugas,
            'prioritas' => 'Sedang',
            'status_laporan' => 'Selesai',
            'isi_laporan' => 'Lampu penerangan jalan umum di depan nomor 45 Jl. Kaliurang tidak menyala selama 3 hari terakhir, sehingga kawasan tersebut gelap pada malam hari.',
            'timeline_log' => [
                ['tanggal' => '05 Mei 2024, 10:15', 'status' => 'Laporan Diterima', 'keterangan' => 'Laporan Anda telah berhasil diterima dan sedang menunggu verifikasi.', 'icon' => 'check_circle', 'color' => 'text-green-500'],
                ['tanggal' => '06 Mei 2024, 09:00', 'status' => 'Verifikasi', 'keterangan' => 'Laporan telah diverifikasi dan diteruskan ke Dinas Perhubungan.', 'icon' => 'verified', 'color' => 'text-blue-500'],
                ['tanggal' => '07 Mei 2024, 11:30', 'status' => 'Sedang Diproses', 'keterangan' => 'Teknisi sedang melakukan penggantian lampu PJU.', 'icon' => 'engineering', 'color' => 'text-yellow-500'],
                ['tanggal' => '08 Mei 2024, 16:00', 'status' => 'Selesai', 'keterangan' => 'Penggantian lampu PJU telah berhasil diselesaikan. Terima kasih atas laporan Anda!', 'icon' => 'task_alt', 'color' => 'text-green-500'],
            ],
            'tanggal_laporan' => '2024-05-05 10:15:00'
        ]);

        // Generate 18 random records for demo list
        $categoriesList = [$katInfras, $katKebersihan, $katKesehatan, $katTransportasi, $katPerumahan, $katPendidikan, $katSosial, $katKetertiban, $katKedaruratan];
        $kecamatans = ['Gedongtengen', 'Depok', 'Gondokusuman', 'Umbulharjo', 'Jetis'];
        $priorities = ['Rendah', 'Sedang', 'Tinggi'];
        $statuses = ['Laporan Diterima', 'Verifikasi', 'Sedang Diproses', 'Selesai'];

        for ($i = 0; $i < 18; $i++) {
            $kat = $categoriesList[array_rand($categoriesList)];
            $kecName = $kecamatans[array_rand($kecamatans)];
            $priVal = $priorities[array_rand($priorities)];
            $statVal = $statuses[array_rand($statuses)];

            $kec = Kecamatan::firstOrCreate(['nama_kecamatan' => $kecName, 'id_provinsi' => $provinsi->id_provinsi]);
            $kel = Kelurahan::firstOrCreate(['nama_kelurahan' => $kecName . ' Indah', 'id_kecamatan' => $kec->id_kecamatan]);
            
            $timeline = [
                ['tanggal' => now()->subDays(5)->format('d M Y, H:i'), 'status' => 'Laporan Diterima', 'keterangan' => 'Laporan Anda telah berhasil diterima.', 'icon' => 'check_circle', 'color' => 'text-green-500']
            ];
            if ($statVal !== 'Laporan Diterima') {
                $timeline[] = ['tanggal' => now()->subDays(4)->format('d M Y, H:i'), 'status' => 'Verifikasi', 'keterangan' => 'Laporan telah diverifikasi oleh tim admin.', 'icon' => 'verified', 'color' => 'text-blue-500'];
            }
            if (in_array($statVal, ['Sedang Diproses', 'Selesai'])) {
                $timeline[] = ['tanggal' => now()->subDays(3)->format('d M Y, H:i'), 'status' => 'Sedang Diproses', 'keterangan' => 'Laporan sedang dalam proses penanganan oleh petugas lapangan.', 'icon' => 'engineering', 'color' => 'text-yellow-500'];
            }
            if ($statVal === 'Selesai') {
                $timeline[] = ['tanggal' => now()->subDays(1)->format('d M Y, H:i'), 'status' => 'Selesai', 'keterangan' => 'Pekerjaan di lapangan telah selesai.', 'icon' => 'task_alt', 'color' => 'text-green-500'];
            }

            Laporan::create([
                'no_ticket' => 'LPW-2024-' . str_pad($i + 1000, 6, '0', STR_PAD_LEFT),
                'judul_laporan' => 'Keluhan Laporan #' . ($i + 1),
                'id_kategori' => $kat->id_kategori,
                'id_kelurahan' => $kel->id_kelurahan,
                'id_user' => $user1->id_user,
                'prioritas' => $priVal,
                'status_laporan' => $statVal,
                'isi_laporan' => 'Ini adalah isi laporan contoh untuk kategori ' . $kat->nama_kategori . ' di wilayah ' . $kecName . '.',
                'timeline_log' => $timeline,
                'tanggal_laporan' => now()->subDays(5)
            ]);
        }
    }
}
