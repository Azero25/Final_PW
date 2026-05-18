<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pengaduans', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_tiket')->unique();
            $table->string('nama')->nullable();
            $table->string('nohp')->nullable();
            $table->boolean('anonim')->default(false);
            $table->string('judul');
            $table->string('kategori');
            $table->string('urgensi');
            $table->string('lokasi');
            $table->string('kecamatan')->nullable();
            $table->text('deskripsi');
            $table->string('status')->default('Laporan Diterima');
            $table->string('petugas')->nullable();
            $table->string('dinas')->nullable();
            $table->json('timeline')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengaduans');
    }
};
