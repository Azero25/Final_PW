<?php

namespace Database\Factories;

use App\Models\Pengaduan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Pengaduan>
 */
class PengaduanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statusOptions = ['Laporan Diterima', 'Verifikasi', 'Sedang Diproses', 'Selesai'];
        $status = $this->faker->randomElement($statusOptions);
        
        $timeline = [
            [
                'tanggal' => now()->subDays(3)->format('d M Y, H:i'),
                'status' => 'Laporan Diterima',
                'keterangan' => 'Laporan Anda telah berhasil diterima dan sedang menunggu verifikasi.',
                'icon' => 'check_circle',
                'color' => 'text-green-500'
            ]
        ];

        if ($status !== 'Laporan Diterima') {
            $timeline[] = [
                'tanggal' => now()->subDays(2)->format('d M Y, H:i'),
                'status' => 'Verifikasi',
                'keterangan' => 'Laporan telah diverifikasi oleh tim admin dan diteruskan ke dinas terkait.',
                'icon' => 'verified',
                'color' => 'text-blue-500'
            ];
        }

        if (in_array($status, ['Sedang Diproses', 'Selesai'])) {
            $timeline[] = [
                'tanggal' => now()->subDays(1)->format('d M Y, H:i'),
                'status' => 'Sedang Diproses',
                'keterangan' => 'Petugas lapangan telah ditugaskan dan sedang dalam proses penanganan.',
                'icon' => 'engineering',
                'color' => 'text-yellow-500'
            ];
        }

        if ($status === 'Selesai') {
            $timeline[] = [
                'tanggal' => now()->format('d M Y, H:i'),
                'status' => 'Selesai',
                'keterangan' => 'Pekerjaan di lapangan telah selesai.',
                'icon' => 'task_alt',
                'color' => 'text-green-500'
            ];
        }

        return [
            'nomor_tiket' => 'LPW-' . now()->year . '-' . $this->faker->unique()->numerify('######'),
            'nama' => $this->faker->name(),
            'nohp' => $this->faker->phoneNumber(),
            'anonim' => $this->faker->boolean(20),
            'judul' => $this->faker->sentence(6),
            'kategori' => $this->faker->randomElement(['infrastruktur', 'kebersihan', 'kesehatan', 'pendidikan', 'lainnya']),
            'urgensi' => $this->faker->randomElement(['rendah', 'sedang', 'tinggi']),
            'lokasi' => $this->faker->address(),
            'kecamatan' => $this->faker->randomElement(['Gedongtengen', 'Depok', 'Gondokusuman', 'Umbulharjo', 'Jetis']),
            'deskripsi' => $this->faker->paragraph(3),
            'status' => $status,
            'petugas' => $this->faker->name(),
            'dinas' => 'Dinas ' . $this->faker->word(),
            'timeline' => $timeline,
        ];
    }
}
