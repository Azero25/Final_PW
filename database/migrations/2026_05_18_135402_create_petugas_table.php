<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('petugas', function (Blueprint $table) {
            $table->id('id_petugas');
            $table->string('NIP')->unique();
            $table->string('nama_petugas');
            $table->string('username')->unique();
            $table->string('password');
            $table->string('no_hp')->nullable();
            $table->foreignId('id_dinas')->nullable()->constrained('dinas', 'id_dinas')->nullOnDelete();
            $table->foreignId('id_jabatan')->nullable()->constrained('jabatans', 'id_jabatan')->nullOnDelete();
            $table->integer('beban_kerja')->default(0);
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('petugas');
    }
};
