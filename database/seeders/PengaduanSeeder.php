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
use App\Models\LaporanTimeline;
use Carbon\Carbon;

class PengaduanSeeder extends Seeder
{
    /**
     * Helper untuk membuat entri metadata log timeline secara dinamis berdasarkan no_ticket
     */
    private function seedLogEntry(string $noTicket, string $status, $createdAt = null)
    {
        $meta = [
            'Diterima'        => ['keterangan' => 'Laporan Anda telah berhasil diterima dan sedang menunggu verifikasi.', 'icon' => 'check_circle', 'color' => 'text-green-500'],
            'Verifikasi'       => ['keterangan' => 'Laporan sedang diverifikasi oleh admin.', 'icon' => 'verified', 'color' => 'text-blue-500'],
            'Sedang Diproses'  => ['keterangan' => 'Laporan sedang ditangani oleh petugas di lapangan.', 'icon' => 'engineering', 'color' => 'text-yellow-500'],
            'Selesai'          => ['keterangan' => 'Laporan telah selesai ditangani.', 'icon' => 'task_alt', 'color' => 'text-green-500'],
            'Ditolak'          => ['keterangan' => 'Laporan ditolak. Tidak memenuhi kriteria pengaduan.', 'icon' => 'cancel', 'color' => 'text-red-500'],
        ];

        $m = $meta[$status] ?? ['keterangan' => 'Status laporan diperbarui.', 'icon' => 'info', 'color' => 'text-slate-500'];

        LaporanTimeline::create([
            'no_ticket'  => $noTicket,
            'status'     => $status === 'Diterima' ? 'Laporan Diterima' : $status,
            'keterangan' => $m['keterangan'],
            'icon'       => $m['icon'],
            'color'      => $m['color'],
            'created_at' => $createdAt ?? now(),
            'updated_at' => $createdAt ?? now(),
        ]);
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Bersihkan data lama untuk menghindari penumpukan data duplikat
        LaporanTimeline::query()->delete();
        Laporan::query()->delete();
        User::where('role', 'petugas')->delete();

        // --- Wilayah Setup ---
        $provinsi  = Provinsi::firstOrCreate(['nama_provinsi' => 'D.I. Yogyakarta']);
        $kabupaten = Kabupaten::firstOrCreate(
            ['nama_kabupaten' => 'Kota Yogyakarta', 'id_provinsi' => $provinsi->id_provinsi]
        );

        // --- 1. Dinas Setup ---
        $dinasPUPR        = Dinas::firstOrCreate(['nama_dinas' => 'Dinas Pekerjaan Umum dan Penataan Ruang'], ['singkatan' => 'PUPR', 'warna_dinas' => 'bg-blue-600']);
        $dinasDLH         = Dinas::firstOrCreate(['nama_dinas' => 'Dinas Lingkungan Hidup'],                  ['singkatan' => 'DLH',      'warna_dinas' => 'bg-green-600']);
        $dinasKesehatan   = Dinas::firstOrCreate(['nama_dinas' => 'Dinas Kesehatan'],                         ['singkatan' => 'Dinkes',   'warna_dinas' => 'bg-red-600']);
        $dinasPerhubungan = Dinas::firstOrCreate(['nama_dinas' => 'Dinas Perhubungan'],                       ['singkatan' => 'Dishub',   'warna_dinas' => 'bg-yellow-600']);
        $dinasPerkim      = Dinas::firstOrCreate(['nama_dinas' => 'Dinas Perumahan dan Kawasan Permukiman'],  ['singkatan' => 'Perkim',   'warna_dinas' => 'bg-pink-600']);
        $dinasPendidikan  = Dinas::firstOrCreate(['nama_dinas' => 'Dinas Pendidikan'],                        ['singkatan' => 'Disdik',   'warna_dinas' => 'bg-indigo-600']);
        $dinasSosial      = Dinas::firstOrCreate(['nama_dinas' => 'Dinas Sosial'],                            ['singkatan' => 'Dinsos',   'warna_dinas' => 'bg-purple-600']);
        $dinasSatpolPP    = Dinas::firstOrCreate(['nama_dinas' => 'Satuan Polisi Pamong Praja'],              ['singkatan' => 'Satpol PP','warna_dinas' => 'bg-orange-600']);
        $dinasBPBD        = Dinas::firstOrCreate(['nama_dinas' => 'Badan Penanggulangan Bencana Daerah'],    ['singkatan' => 'BPBD',     'warna_dinas' => 'bg-slate-600']);

        // --- 2. Kategori Setup ---
        $katInfras = Kategori::firstOrCreate(['nama_kategori' => 'Infrastruktur'], ['icon' => 'construction', 'warna_kategori' => 'bg-blue-500']);
        $katInfras->dinas()->sync([$dinasPUPR->id_dinas, $dinasPerkim->id_dinas]);

        $katKebersihan = Kategori::firstOrCreate(['nama_kategori' => 'Kebersihan'], ['icon' => 'delete_sweep', 'warna_kategori' => 'bg-green-500']);
        $katKebersihan->dinas()->sync([$dinasDLH->id_dinas]);

        $katKesehatan = Kategori::firstOrCreate(['nama_kategori' => 'Kesehatan'], ['icon' => 'local_hospital', 'warna_kategori' => 'bg-red-500']);
        $katKesehatan->dinas()->sync([$dinasKesehatan->id_dinas]);

        $katTransportasi = Kategori::firstOrCreate(['nama_kategori' => 'Transportasi'], ['icon' => 'traffic', 'warna_kategori' => 'bg-yellow-500']);
        $katTransportasi->dinas()->sync([$dinasPerhubungan->id_dinas, $dinasSatpolPP->id_dinas]);

        $katPerumahan = Kategori::firstOrCreate(['nama_kategori' => 'Perumahan'], ['icon' => 'home', 'warna_kategori' => 'bg-pink-500']);
        $katPerumahan->dinas()->sync([$dinasPerkim->id_dinas]);

        $katPendidikan = Kategori::firstOrCreate(['nama_kategori' => 'Pendidikan'], ['icon' => 'school', 'warna_kategori' => 'bg-indigo-500']);
        $katPendidikan->dinas()->sync([$dinasPendidikan->id_dinas]);

        $katSosial = Kategori::firstOrCreate(['nama_kategori' => 'Sosial'], ['icon' => 'diversity_3', 'warna_kategori' => 'bg-purple-500']);
        $katSosial->dinas()->sync([$dinasSosial->id_dinas]);

        $katKetertiban = Kategori::firstOrCreate(['nama_kategori' => 'Ketertiban'], ['icon' => 'gavel', 'warna_kategori' => 'bg-orange-500']);
        $katKetertiban->dinas()->sync([$dinasSatpolPP->id_dinas]);

        $katKedaruratan = Kategori::firstOrCreate(['nama_kategori' => 'Kedaruratan'], ['icon' => 'emergency', 'warna_kategori' => 'bg-rose-500']);
        $katKedaruratan->dinas()->sync([$dinasBPBD->id_dinas, $dinasKesehatan->id_dinas, $dinasSatpolPP->id_dinas]);

        $katLainnya = Kategori::firstOrCreate(['nama_kategori' => 'Lainnya'], ['icon' => 'category', 'warna_kategori' => 'bg-slate-500']);
        $katLainnya->dinas()->sync([$dinasPUPR->id_dinas]);

        $dinasList = [
            $dinasPUPR, $dinasDLH, $dinasKesehatan, $dinasPerhubungan,
            $dinasPerkim, $dinasPendidikan, $dinasSosial, $dinasSatpolPP, $dinasBPBD,
        ];

        // --- Jabatan Setup ---
        $jabatanDefault   = Jabatan::firstOrCreate(['nama_jabatan' => 'Staff Lapangan'],   ['level_jabatan' => 3]);
        $jabatanLapangan  = Jabatan::firstOrCreate(['nama_jabatan' => 'Petugas Lapangan'], ['level_jabatan' => 3]);
        $jabatanTeknisi   = Jabatan::firstOrCreate(['nama_jabatan' => 'Teknisi Dishub'],   ['level_jabatan' => 2]);

        // --- Seed Petugas ---
        $indonesianNames = [
            ['Ahmad Wijaya', 'ahmadwijaya'], ['Budi Setiawan', 'budisetiawan'], ['Chandra Kusuma', 'chandrakusuma'], ['Dedi Pratama', 'dedipratama'],
            ['Andi Mulyono', 'andimulyono'], ['Bambang Cahyono', 'bambangcahyono'], ['Edi Darsono', 'edidarsono'], ['Farhan Siregar', 'farhansiregar'],
            ['Siti Aminah', 'sitiaminah'], ['Dewi Sartika', 'dewisartika'], ['Rini Astuti', 'riniastuti'], ['Mega Utami', 'megautami'],
            ['Rudi Hermawan', 'rudihermawan'], ['Toni Sucipto', 'tonisucipto'], ['Heri Kartiko', 'herikartiko'], ['Agus Rahardjo', 'agusrahardjo'],
            ['Eka Ramdani', 'ekaramdani'], ['Ferry Rotinsulu', 'ferryrotinsulu'], ['Gilang Dirga', 'gilangdirga'], ['Haris Maulana', 'harismaulana'],
            ['Omesh Ananda', 'omeshananda'], ['Panji Petualang', 'panjipetualang'], ['Qori Sandioriva', 'qorisandioriva'], ['Raffi Ahmad', 'raffiahmad'],
            ['Zaskia Mecca', 'zaskiamecca'], ['Anang Hermansyah', 'ananghermansyah'], ['Ashanty Siddik', 'ashantysiddik'], ['Atta Halilintar', 'attahalilintar'],
            ['Gading Marten', 'gadingmarten'], ['Gisella Anastasia', 'gisellaanastasia'], ['Rojali Saputra', 'rojalisaputra'], ['Soleh Solihun', 'solehsolihun'],
            ['Bintang Emon', 'bintangemon'], ['Kiky Saputri', 'kikysaputri'], ['Marshel Widianto', 'marshelwidianto'], ['Gilang Bhaskara', 'gilangbhaskara'],
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

        // --- Seed Warga ---
        $user1 = User::firstOrCreate(
            ['email' => 'warga@email.com'],
            [
                'nama_lengkap' => 'Budi Santoso',
                'password'     => bcrypt('warga123'),
                'role'         => 'warga',
            ]
        );

        // --- Demo Laporan 1: Jalan Berlubang (Sedang Diproses) ---
        $kec1 = Kecamatan::firstOrCreate(['nama_kecamatan' => 'Gedongtengen', 'id_kabupaten' => $kabupaten->id_kabupaten]);
        $kel1 = Kelurahan::firstOrCreate(['nama_kelurahan' => 'Gedongtengen', 'id_kecamatan' => $kec1->id_kecamatan]);
        $pet1 = User::where('email', 'ahmadwijaya@petugas.go.id')->first();

        $laporan1 = Laporan::create([
            'no_ticket'       => 'LPW-2024-001234',
            'judul_laporan'   => 'Jalan Berlubang di Jl. Malioboro Km. 3',
            'id_kategori'     => $katInfras->id_kategori,
            'id_kelurahan'    => $kel1->id_kelurahan,
            'id_user'         => $user1->id_user,
            'id_petugas'      => $pet1?->id_user,
            'prioritas'       => 'Tinggi',
            'status_laporan'  => 'Sedang Diproses',
            'isi_laporan'     => 'Terdapat lubang besar di badan jalan yang membahayakan pengendara, khususnya sepeda motor. Lubang berdiameter sekitar 50cm dengan kedalaman 15cm.',
            'tanggal_laporan' => '2024-05-10 09:30:00',
        ]);

        // Buat alur log sekuensial berdasarkan string no_ticket Laporan 1
        $t1 = Carbon::parse($laporan1->tanggal_laporan);
        $this->seedLogEntry($laporan1->no_ticket, 'Diterima', $t1);
        $this->seedLogEntry($laporan1->no_ticket, 'Verifikasi', $t1->copy()->addHours(2));
        $this->seedLogEntry($laporan1->no_ticket, 'Sedang Diproses', $t1->copy()->addHours(5));

        // --- Demo Laporan 2: Lampu PJU Mati (Selesai) ---
        $kec2 = Kecamatan::firstOrCreate(['nama_kecamatan' => 'Depok', 'id_kabupaten' => $kabupaten->id_kabupaten]);
        $kel2 = Kelurahan::firstOrCreate(['nama_kelurahan' => 'Depok', 'id_kecamatan' => $kec2->id_kecamatan]);
        // Perbaikan typo query bawaan: bersihkan parameter 'where' gaib
        $pet2 = User::where('email', 'rudihermawan@petugas.go.id')->first() ?? User::where('id_dinas', $dinasPerhubungan->id_dinas)->first();

        $laporan2 = Laporan::create([
            'no_ticket'       => 'LPW-2024-005678',
            'judul_laporan'   => 'Lampu PJU Mati di Jl. Kaliurang',
            'id_kategori'     => $katTransportasi->id_kategori,
            'id_kelurahan'    => $kel2->id_kelurahan,
            'id_user'         => $user1->id_user,
            'id_petugas'      => $pet2?->id_user,
            'prioritas'       => 'Sedang',
            'status_laporan'  => 'Selesai',
            'isi_laporan'     => 'Lampu penerangan jalan umum di depan nomor 45 Jl. Kaliurang tidak menyala selama 3 hari terakhir, sehingga kawasan tersebut gelap pada malam hari.',
            'tanggal_laporan' => '2024-05-05 10:15:00',
        ]);

        // Buat alur log sekuensial berdasarkan string no_ticket Laporan 2
        $t2 = Carbon::parse($laporan2->tanggal_laporan);
        $this->seedLogEntry($laporan2->no_ticket, 'Diterima', $t2);
        $this->seedLogEntry($laporan2->no_ticket, 'Verifikasi', $t2->copy()->addDays(1));
        $this->seedLogEntry($laporan2->no_ticket, 'Sedang Diproses', $t2->copy()->addDays(2));
        $this->seedLogEntry($laporan2->no_ticket, 'Selesai', $t2->copy()->addDays(4));

        // --- Generate 18 Laporan Acak Ber-Timeline ---
        $categoriesList = [
            $katInfras, $katKebersihan, $katKesehatan, $katTransportasi,
            $katPerumahan, $katPendidikan, $katSosial, $katKetertiban, $katKedaruratan,
        ];
        $kecamatanNames = ['Gedongtengen', 'Depok', 'Gondokusuman', 'Umbulharjo', 'Jetis'];
        $priorities     = ['Rendah', 'Sedang', 'Tinggi'];
        $statuses       = ['Diterima', 'Verifikasi', 'Sedang Diproses', 'Selesai', 'Ditolak'];

        for ($i = 0; $i < 18; $i++) {
            $kat     = $categoriesList[array_rand($categoriesList)];
            $kecName = $kecamatanNames[array_rand($kecamatanNames)];
            $priVal  = $priorities[array_rand($priorities)];
            $statVal = $statuses[array_rand($statuses)];

            $kec = Kecamatan::firstOrCreate(['nama_kecamatan' => $kecName, 'id_kabupaten' => $kabupaten->id_kabupaten]);
            $kel = Kelurahan::firstOrCreate(['nama_kelurahan' => $kecName . ' Selatan', 'id_kecamatan' => $kec->id_kecamatan]);

            $backDays = rand(2, 40);
            $tanggalLaporan = now()->subDays($backDays)->subHours(rand(1, 12));

            $laporanAcak = Laporan::create([
                'no_ticket'       => 'LPW-2024-' . str_pad($i + 1000, 6, '0', STR_PAD_LEFT),
                'judul_laporan'   => 'Keluhan Laporan Demo #' . ($i + 1),
                'id_kategori'     => $kat->id_kategori,
                'id_kelurahan'    => $kel->id_kelurahan,
                'id_user'         => $user1->id_user,
                'prioritas'       => $priVal,
                'status_laporan'  => $statVal,
                'isi_laporan'     => 'Ini adalah isi laporan contoh untuk kategori ' . $kat->nama_kategori . ' di wilayah ' . $kecName . '.',
                'tanggal_laporan' => $tanggalLaporan,
            ]);

            $tLog = Carbon::parse($laporanAcak->tanggal_laporan);
            
            // Log awal pembuatan laporan acak dikaitkan via no_ticket
            $this->seedLogEntry($laporanAcak->no_ticket, 'Diterima', $tLog);

            if ($statVal === 'Verifikasi') {
                $this->seedLogEntry($laporanAcak->no_ticket, 'Verifikasi', $tLog->copy()->addDays(1));
            } 
            elseif ($statVal === 'Sedang Diproses') {
                $this->seedLogEntry($laporanAcak->no_ticket, 'Verifikasi', $tLog->copy()->addDays(1));
                $this->seedLogEntry($laporanAcak->no_ticket, 'Sedang Diproses', $tLog->copy()->addDays(2));
            } 
            elseif ($statVal === 'Selesai') {
                $this->seedLogEntry($laporanAcak->no_ticket, 'Verifikasi', $tLog->copy()->addDays(1));
                $this->seedLogEntry($laporanAcak->no_ticket, 'Sedang Diproses', $tLog->copy()->addDays(2));
                $this->seedLogEntry($laporanAcak->no_ticket, 'Selesai', $tLog->copy()->addDays(4));
            } 
            elseif ($statVal === 'Ditolak') {
                $this->seedLogEntry($laporanAcak->no_ticket, 'Verifikasi', $tLog->copy()->addDays(1));
                $this->seedLogEntry($laporanAcak->no_ticket, 'Ditolak', $tLog->copy()->addDays(1)->addHours(4));
            }
        }
    }
}