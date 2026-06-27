<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('kelurahans', function (Blueprint $table) {
            $table->id('id_kelurahan');
            $table->string('nama_kelurahan');
            $table->unsignedBigInteger('id_kecamatan');

            $table->timestamps();
            $table->foreign('id_kecamatan')->references('id_kecamatan')->on('kecamatans')->cascadeOnDelete();
        });
    }
    public function down(): void {
        Schema::dropIfExists('kelurahans');
    }
};
