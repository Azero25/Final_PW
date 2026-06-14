<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\User::updateOrCreate(
            ['email' => 'admin@lapor.go.id'],
            [
                'nama_lengkap' => 'Admin Utama',
                'password' => \Illuminate\Support\Facades\Hash::make('admin123'),
                'role' => 'admin',
                'nik' => '3471010101010001',
                'no_hp' => '089876543210',
                'alamat_lengkap' => 'Kantor Balaikota Yogyakarta, Jl. Kenari No. 56',
                'desa' => 'Muja Muju',
                'kelurahan' => 'Muja Muju',
                'kecamatan' => 'Umbulharjo',
                'kabupaten' => 'Kota Yogyakarta',
                'provinsi' => 'DI Yogyakarta',
            ]
        );

        \App\Models\User::updateOrCreate(
            ['email' => 'warga@email.com'],
            [
                'nama_lengkap' => 'Budi Santoso',
                'password' => \Illuminate\Support\Facades\Hash::make('warga123'),
                'role' => 'warga',
                'nik' => '3471020304950001',
                'no_hp' => '081234567890',
                'alamat_lengkap' => 'Jl. Malioboro No. 12',
                'desa' => 'Sosromenduran',
                'kelurahan' => 'Sosromenduran',
                'kecamatan' => 'Gedongtengen',
                'kabupaten' => 'Kota Yogyakarta',
                'provinsi' => 'DI Yogyakarta',
            ]
        );
    }
}
