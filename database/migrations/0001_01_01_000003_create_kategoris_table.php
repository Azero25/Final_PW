<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('kategoris', function (Blueprint $table) {
            $table->id('id_kategori');
            $table->string('nama_kategori');
            $table->text('desc_kategori')->nullable();
            $table->string('icon')->default('construction');
            $table->string('warna_kategori')->default('bg-blue-500');
            $table->boolean('aktif')->default(true);

            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('kategoris');
    }
};
