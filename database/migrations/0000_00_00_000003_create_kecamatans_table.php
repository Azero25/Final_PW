<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('kecamatans', function (Blueprint $table) {
            $table->id('id_kecamatan');
            $table->string('nama_kecamatan');
            $table->unsignedBigInteger('id_kabupaten');
            $table->timestamps();

            $table->unique(['nama_kecamatan', 'id_kabupaten']);
            $table->foreign('id_kabupaten')->references('id_kabupaten')->on('kabupatens')->cascadeOnDelete();
        });
    }
    public function down(): void {
        Schema::dropIfExists('kecamatans');
    }
};
