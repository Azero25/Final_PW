<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Laporan;
use App\Models\Kategori;
use App\Models\Kabupaten;
use App\Models\Kelurahan;
use App\Models\Kecamatan;
use App\Models\Provinsi;
use App\Models\Dinas;
use App\Models\Jabatan;
use App\Models\User;

class PengaduanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Laporan::query()->delete();
        User::where('role', 'petugas')->delete();

        // --- Wilayah Setup ---
        $provinsi  = Provinsi::firstOrCreate(['nama_provinsi' => 'D.I. Yogyakarta']);
        $kabupaten = Kabupaten::firstOrCreate(
            ['nama_kabupaten' => 'Kota Yogyakarta', 'id_provinsi' => $provinsi->id_provinsi]
        );

        // --- Dinas Setup ---
        $dinasPUPR        = Dinas::firstOrCreate(['nama_dinas' => 'Dinas Pekerjaan Umum dan Penataan Ruang'], ['singkatan' => 'PUPR', 'warna_dinas' => 'bg-blue-600']);
        $dinasDLH         = Dinas::firstOrCreate(['nama_dinas' => 'Dinas Lingkungan Hidup'],                  ['singkatan' => 'DLH',      'warna_dinas' => 'bg-green-600']);
        $dinasKesehatan   = Dinas::firstOrCreate(['nama_dinas' => 'Dinas Kesehatan'],                         ['singkatan' => 'Dinkes',   'warna_dinas' => 'bg-red-600']);
        $dinasPerhubungan = Dinas::firstOrCreate(['nama_dinas' => 'Dinas Perhubungan'],                       ['singkatan' => 'Dishub',   'warna_dinas' => 'bg-yellow-600']);
        $dinasPerkim      = Dinas::firstOrCreate(['nama_dinas' => 'Dinas Perumahan dan Kawasan Permukiman'],  ['singkatan' => 'Perkim',   'warna_dinas' => 'bg-pink-600']);
        $dinasPendidikan  = Dinas::firstOrCreate(['nama_dinas' => 'Dinas Pendidikan'],                        ['singkatan' => 'Disdik',   'warna_dinas' => 'bg-indigo-600']);
        $dinasSosial      = Dinas::firstOrCreate(['nama_dinas' => 'Dinas Sosial'],                            ['singkatan' => 'Dinsos',   'warna_dinas' => 'bg-purple-600']);
        $dinasSatpolPP    = Dinas::firstOrCreate(['nama_dinas' => 'Satuan Polisi Pamong Praja'],              ['singkatan' => 'Satpol PP','warna_dinas' => 'bg-orange-600']);
        $dinasBPBD        = Dinas::firstOrCreate(['nama_dinas' => 'Badan Penanggulangan Bencana Daerah'],    ['singkatan' => 'BPBD',     'warna_dinas' => 'bg-slate-600']);

        $dinasList = [
            $dinasPUPR, $dinasDLH, $dinasKesehatan, $dinasPerhubungan,
            $dinasPerkim, $dinasPendidikan, $dinasSosial, $dinasSatpolPP, $dinasBPBD,
        ];

        // --- Jabatan Setup (level_jabatan is required) ---
        $jabatanDefault   = Jabatan::firstOrCreate(['nama_jabatan' => 'Staff Lapangan'],   ['level_jabatan' => 'Staff']);
        $jabatanLapangan  = Jabatan::firstOrCreate(['nama_jabatan' => 'Petugas Lapangan'], ['level_jabatan' => 'Staff']);
        $jabatanTeknisi   = Jabatan::firstOrCreate(['nama_jabatan' => 'Teknisi Dishub'],   ['level_jabatan' => 'Teknisi']);

        // --- Seed Petugas (stored as Users with role=petugas) ---
        $indonesianNames = [
            // PUPR
            ['Ahmad Wijaya',       'ahmadwijaya'],
            ['Budi Setiawan',      'budisetiawan'],
            ['Chandra Kusuma',     'chandrakusuma'],
            ['Dedi Pratama',       'dedipratama'],
            // DLH
            ['Andi Mulyono',       'andimulyono'],
            ['Bambang Cahyono',    'bambangcahyono'],
            ['Edi Darsono',        'edidarsono'],
            ['Farhan Siregar',     'farhansiregar'],
            // Kesehatan
            ['Siti Aminah',        'sitiaminah'],
            ['Dewi Sartika',       'dewisartika'],
            ['Rini Astuti',        'riniastuti'],
            ['Mega Utami',         'megautami'],
            // Perhubungan
            ['Rudi Hermawan',      'rudihermawan'],
            ['Toni Sucipto',       'tonisucipto'],
            ['Heri Kartiko',       'herikartiko'],
            ['Agus Rahardjo',      'agusrahardjo'],
            // Perkim
            ['Eka Ramdani',        'ekaramdani'],
            ['Ferry Rotinsulu',    'ferryrotinsulu'],
            ['Gilang Dirga',       'gilangdirga'],
            ['Haris Maulana',      'harismaulana'],
            // Pendidikan
            ['Omesh Ananda',       'omeshananda'],
            ['Panji Petualang',    'panjipetualang'],
            ['Qori Sandioriva',    'qorisandioriva'],
            ['Raffi Ahmad',        'raffiahmad'],
            // Sosial
            ['Zaskia Mecca',       'zaskiamecca'],
            ['Anang Hermansyah',   'ananghermansyah'],
            ['Ashanty Siddik',     'ashantysiddik'],
            ['Atta Halilintar',    'attahalilintar'],
            // Satpol PP
            ['Gading Marten',      'gadingmarten'],
            ['Gisella Anastasia',  'gisellaanastasia'],
            ['Rojali Saputra',     'rojalisaputra'],
            ['Soleh Solihun',      'solehsolihun'],
            // BPBD
            ['Bintang Emon',       'bintangemon'],
            ['Kiky Saputri',       'kikysaputri'],
            ['Marshel Widianto',   'marshelwidianto'],
            ['Gilang Bhaskara',    'gilangbhaskara'],
        ];

        foreach ($dinasList as $index => $d) {
            for ($k = 1; $k <= 4; $k++) {
                $nameIndex   = ($index * 4) + ($k - 1);
                $petugasData = $indonesianNames[$nameIndex];
                $email       = $petugasData[1] . '@petugas.go.id';

                User::firstOrCreate(
                    ['email' => $email],
                    [
                        'nama_lengkap'  => $petugasData[0],
                        'nip'           => '19' . str_pad(mt_rand(700101, 990101), 6, '0') . str_pad(mt_rand(201001, 202301), 6, '0') . str_pad($index + 1, 2, '0', STR_PAD_LEFT) . str_pad($k, 3, '0', STR_PAD_LEFT),
                        'password'      => bcrypt('petugas123'),
                        'no_hp'         => '0812' . mt_rand(10000000, 99999999),
                        'id_dinas'      => $d->id_dinas,
                        'id_jabatan'    => $jabatanDefault->id_jabatan,
                        'role'          => 'petugas',
                        'count_laporan' => 0,
                        'status'        => 'Aktif',
                    ]
                );
            }
        }

        // --- Kategori Setup (warna_kategori is the correct column name) ---
        $katInfras      = Kategori::firstOrCreate(['nama_kategori' => 'infrastruktur'], ['id_dinas' => $dinasPUPR->id_dinas,        'icon' => 'construction',   'warna_kategori' => 'bg-blue-500']);
        $katKebersihan  = Kategori::firstOrCreate(['nama_kategori' => 'kebersihan'],    ['id_dinas' => $dinasDLH->id_dinas,          'icon' => 'delete_sweep',   'warna_kategori' => 'bg-green-500']);
        $katKesehatan   = Kategori::firstOrCreate(['nama_kategori' => 'kesehatan'],     ['id_dinas' => $dinasKesehatan->id_dinas,    'icon' => 'local_hospital', 'warna_kategori' => 'bg-red-500']);
        $katTransportasi= Kategori::firstOrCreate(['nama_kategori' => 'transportasi'],  ['id_dinas' => $dinasPerhubungan->id_dinas,  'icon' => 'traffic',        'warna_kategori' => 'bg-yellow-500']);
        $katPerumahan   = Kategori::firstOrCreate(['nama_kategori' => 'perumahan'],     ['id_dinas' => $dinasPerkim->id_dinas,       'icon' => 'home',           'warna_kategori' => 'bg-pink-500']);
        $katPendidikan  = Kategori::firstOrCreate(['nama_kategori' => 'pendidikan'],    ['id_dinas' => $dinasPendidikan->id_dinas,   'icon' => 'school',         'warna_kategori' => 'bg-indigo-500']);
        $katSosial      = Kategori::firstOrCreate(['nama_kategori' => 'sosial'],        ['id_dinas' => $dinasSosial->id_dinas,       'icon' => 'diversity_3',    'warna_kategori' => 'bg-purple-500']);
        $katKetertiban  = Kategori::firstOrCreate(['nama_kategori' => 'ketertiban'],    ['id_dinas' => $dinasSatpolPP->id_dinas,     'icon' => 'gavel',          'warna_kategori' => 'bg-orange-500']);
        $katKedaruratan = Kategori::firstOrCreate(['nama_kategori' => 'kedaruratan'],   ['id_dinas' => $dinasBPBD->id_dinas,         'icon' => 'emergency',      'warna_kategori' => 'bg-rose-500']);
        $katLainnya     = Kategori::firstOrCreate(['nama_kategori' => 'lainnya'],       ['id_dinas' => $dinasPUPR->id_dinas,         'icon' => 'category',       'warna_kategori' => 'bg-slate-500']);

        // --- Demo Laporan 1: Jalan Berlubang ---
        $kec1 = Kecamatan::firstOrCreate(['nama_kecamatan' => 'Gedongtengen', 'id_kabupaten' => $kabupaten->id_kabupaten]);
        $kel1 = Kelurahan::firstOrCreate(['nama_kelurahan' => 'Gedongtengen', 'id_kecamatan' => $kec1->id_kecamatan]);

        $pet1 = User::firstOrCreate(
            ['email' => 'ahmadfauzi@petugas.go.id'],
            [
                'nama_lengkap'  => 'Bpk. Ahmad Fauzi',
                'id_jabatan'    => $jabatanLapangan->id_jabatan,
                'id_dinas'      => $dinasPUPR->id_dinas,
                'nip'           => '198504122010011002',
                'password'      => bcrypt('petugas123'),
                'role'          => 'petugas',
                'count_laporan' => 1,
                'status'        => 'Aktif',
            ]
        );

        $user1 = User::firstOrCreate(
            ['email' => 'warga@email.com'],
            [
                'nama_lengkap' => 'Budi Santoso',
                'password'     => bcrypt('warga123'),
                'role'         => 'warga',
            ]
        );

        Laporan::create([
            'no_ticket'       => 'LPW-2024-001234',
            'judul_laporan'   => 'Jalan Berlubang di Jl. Malioboro Km. 3',
            'id_kategori'     => $katInfras->id_kategori,
            'id_kelurahan'    => $kel1->id_kelurahan,
            'id_user'         => $user1->id_user,
            'id_petugas'      => $pet1->id_user,
            'prioritas'       => 'Tinggi',
            'status_laporan'  => 'Sedang Diproses',
            'isi_laporan'     => 'Terdapat lubang besar di badan jalan yang membahayakan pengendara, khususnya sepeda motor. Lubang berdiameter sekitar 50cm dengan kedalaman 15cm.',
            'tanggal_laporan' => '2024-05-10 09:30:00',
        ]);

        // --- Demo Laporan 2: Lampu PJU Mati ---
        $kec2 = Kecamatan::firstOrCreate(['nama_kecamatan' => 'Depok', 'id_kabupaten' => $kabupaten->id_kabupaten]);
        $kel2 = Kelurahan::firstOrCreate(['nama_kelurahan' => 'Depok', 'id_kecamatan' => $kec2->id_kecamatan]);

        $pet2 = User::firstOrCreate(
            ['email' => 'saridewi@petugas.go.id'],
            [
                'nama_lengkap'  => 'Ibu Sari Dewi',
                'id_jabatan'    => $jabatanTeknisi->id_jabatan,
                'id_dinas'      => $dinasPerhubungan->id_dinas,
                'nip'           => '199008202015032001',
                'password'      => bcrypt('petugas123'),
                'role'          => 'petugas',
                'count_laporan' => 1,
                'status'        => 'Aktif',
            ]
        );

        Laporan::create([
            'no_ticket'       => 'LPW-2024-005678',
            'judul_laporan'   => 'Lampu PJU Mati di Jl. Kaliurang',
            'id_kategori'     => $katTransportasi->id_kategori,
            'id_kelurahan'    => $kel2->id_kelurahan,
            'id_user'         => $user1->id_user,
            'id_petugas'      => $pet2->id_user,
            'prioritas'       => 'Sedang',
            'status_laporan'  => 'Selesai',
            'isi_laporan'     => 'Lampu penerangan jalan umum di depan nomor 45 Jl. Kaliurang tidak menyala selama 3 hari terakhir, sehingga kawasan tersebut gelap pada malam hari.',
            'tanggal_laporan' => '2024-05-05 10:15:00',
        ]);

        // --- Generate 18 laporan acak ---
        $categoriesList = [
            $katInfras, $katKebersihan, $katKesehatan, $katTransportasi,
            $katPerumahan, $katPendidikan, $katSosial, $katKetertiban, $katKedaruratan,
        ];
        $kecamatanNames = ['Gedongtengen', 'Depok', 'Gondokusuman', 'Umbulharjo', 'Jetis'];
        $priorities     = ['Rendah', 'Sedang', 'Tinggi'];
        // Status harus sesuai enum migration: Menunggu|Verifikasi|Diterima|Ditolak|Sedang Diproses|Selesai
        $statuses       = ['Menunggu', 'Verifikasi', 'Diterima', 'Sedang Diproses', 'Selesai'];

        for ($i = 0; $i < 18; $i++) {
            $kat     = $categoriesList[array_rand($categoriesList)];
            $kecName = $kecamatanNames[array_rand($kecamatanNames)];
            $priVal  = $priorities[array_rand($priorities)];
            $statVal = $statuses[array_rand($statuses)];

            $kec = Kecamatan::firstOrCreate(['nama_kecamatan' => $kecName, 'id_kabupaten' => $kabupaten->id_kabupaten]);
            $kel = Kelurahan::firstOrCreate(['nama_kelurahan' => $kecName . ' Selatan', 'id_kecamatan' => $kec->id_kecamatan]);

            Laporan::create([
                'no_ticket'       => 'LPW-2024-' . str_pad($i + 1000, 6, '0', STR_PAD_LEFT),
                'judul_laporan'   => 'Keluhan Laporan Demo #' . ($i + 1),
                'id_kategori'     => $kat->id_kategori,
                'id_kelurahan'    => $kel->id_kelurahan,
                'id_user'         => $user1->id_user,
                'prioritas'       => $priVal,
                'status_laporan'  => $statVal,
                'isi_laporan'     => 'Ini adalah isi laporan contoh untuk kategori ' . $kat->nama_kategori . ' di wilayah ' . $kecName . '.',
                'tanggal_laporan' => now()->subDays(rand(1, 30)),
            ]);
        }
    }
}
