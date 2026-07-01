<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('dinas', function (Blueprint $table) {
            $table->id('id_dinas');
            $table->string('nama_dinas');
            $table->string('singkatan')->nullable();
            $table->string('warna_dinas')->default('bg-slate-600');
            $table->unsignedBigInteger('id_kategori');
            $table->timestamps();

            $table->foreign('id_kategori')->references('id_kategori')->on('kategoris')->cascadeOnDelete();
        });
    }
    public function down(): void {
        Schema::dropIfExists('dinas');
    }
};
