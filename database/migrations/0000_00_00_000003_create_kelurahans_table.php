<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('kelurahans', function (Blueprint $table) {
            $table->id('id_kelurahan');
            $table->string('nama_kelurahan');
            $table->foreignId('id_kecamatan')->constrained('kecamatans', 'id_kecamatan')->cascadeOnDelete();
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('kelurahans');
    }
};
