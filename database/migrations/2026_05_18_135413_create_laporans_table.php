<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('laporans', function (Blueprint $table) {
            $table->string('no_ticket')->primary();
            $table->string('judul_laporan');
            $table->text('isi_laporan')->nullable();
            $table->dateTime('tanggal_laporan')->useCurrent();
            $table->enum('prioritas', ['Rendah', 'Sedang', 'Tinggi'])->default('Sedang');
            $table->enum('status_laporan', ['Menunggu', 'Verifikasi', 'Diterima', 'Ditolak', 'Sedang Diproses', 'Selesai'])->default('Menunggu');
            $table->string('bukti_foto')->nullable();
            $table->unsignedBigInteger('id_kategori')->nullable();
            $table->unsignedBigInteger('id_kelurahan')->nullable();
            $table->unsignedBigInteger('id_user')->nullable(); // Pelapor
            $table->unsignedBigInteger('id_petugas')->nullable(); // Petugas pengerja
            $table->timestamps();

            $table->foreign('id_kategori')->references('id_kategori')->on('kategoris')->nullOnDelete();
            $table->foreign('id_kelurahan')->references('id_kelurahan')->on('kelurahans')->nullOnDelete();
            $table->foreign('id_user')->references('id_user')->on('users')->nullOnDelete();
            $table->foreign('id_petugas')->references('id_user')->on('users')->nullOnDelete();
        });
    }
    public function down(): void {
        Schema::dropIfExists('laporans');
    }
};
