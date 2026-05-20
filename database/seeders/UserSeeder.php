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
        \App\Models\User::create([
            'nama_lengkap' => 'Admin Utama',
            'email' => 'admin@lapor.go.id',
            'password' => \Illuminate\Support\Facades\Hash::make('admin123'),
            'role' => 'admin',
        ]);

        \App\Models\User::create([
            'nama_lengkap' => 'Budi Santoso',
            'email' => 'warga@email.com',
            'password' => \Illuminate\Support\Facades\Hash::make('warga123'),
            'role' => 'warga',
        ]);
    }
}
