<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('laporans', function (Blueprint $table) {
            $table->string('no_ticket')->primary();
            $table->string('judul_laporan');
            $table->foreignId('id_kategori')->nullable()->constrained('kategoris', 'id_kategori')->nullOnDelete();
            $table->foreignId('id_kelurahan')->nullable()->constrained('kelurahans', 'id_kelurahan')->nullOnDelete();
            $table->foreignId('id_user')->nullable()->constrained('users', 'id_user')->nullOnDelete();
            $table->foreignId('id_petugas')->nullable()->constrained('petugas', 'id_petugas')->nullOnDelete();
            $table->dateTime('tanggal_laporan')->useCurrent();
            $table->enum('prioritas', ['Rendah', 'Sedang', 'Tinggi'])->default('Sedang');
            $table->enum('status_laporan', ['Laporan Diterima', 'Verifikasi', 'Sedang Diproses', 'Selesai', 'Ditolak'])->default('Laporan Diterima');
            $table->text('isi_laporan')->nullable();
            $table->string('bukti_foto')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('laporans');
    }
};
