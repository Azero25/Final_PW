<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Provinsi;
use App\Models\Kabupaten;
use App\Models\Kecamatan;
use App\Models\Kelurahan;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $provinsi = Provinsi::firstOrCreate(['nama_provinsi' => 'D.I. Yogyakarta']);
        $kabupaten = Kabupaten::firstOrCreate(['nama_kabupaten' => 'Kota Yogyakarta', 'id_provinsi' => $provinsi->id_provinsi]);

        // Admin Address
        $kecAdmin = Kecamatan::firstOrCreate(['nama_kecamatan' => 'Umbulharjo', 'id_kabupaten' => $kabupaten->id_kabupaten]);
        $kelAdmin = Kelurahan::firstOrCreate(['nama_kelurahan' => 'Muja Muju', 'id_kecamatan' => $kecAdmin->id_kecamatan]);

        User::updateOrCreate(
            ['email' => 'admin@lapor.go.id'],
            [
                'nama_lengkap' => 'Admin Utama',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'nik' => '3471010101010001',
                'no_hp' => '089876543210',
                'alamat_lengkap' => 'Kantor Balaikota Yogyakarta, Jl. Kenari No. 56',
                'id_kelurahan' => $kelAdmin->id_kelurahan,
            ]
        );

        // Warga Address
        $kecWarga = Kecamatan::firstOrCreate(['nama_kecamatan' => 'Gedongtengen', 'id_kabupaten' => $kabupaten->id_kabupaten]);
        $kelWarga = Kelurahan::firstOrCreate(['nama_kelurahan' => 'Sosromenduran', 'id_kecamatan' => $kecWarga->id_kecamatan]);

        User::updateOrCreate(
            ['email' => 'warga@email.com'],
            [
                'nama_lengkap' => 'Budi Santoso',
                'password' => Hash::make('warga123'),
                'role' => 'warga',
                'nik' => '3471020304950001',
                'no_hp' => '081234567890',
                'alamat_lengkap' => 'Jl. Malioboro No. 12',
                'id_kelurahan' => $kelWarga->id_kelurahan,
            ]
        );
    }
}
