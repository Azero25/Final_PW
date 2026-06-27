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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id('id_notification');
            $table->string('judul');
            $table->text('isi');

            $table->enum('tipe', ['laporan', 'update', 'pengguna', 'darurat'])->default('laporan');
            $table->boolean('dibaca')->default(false);
            $table->string('target_id')->nullable(); // no ticket, user ID, etc.

            $table->enum('target_role', ['admin', 'warga', 'petugas'])->nullable();
            $table->unsignedBigInteger('id_user')->nullable();
            $table->unsignedBigInteger('id_petugas')->nullable();

            $table->timestamps();

            $table->foreign('id_user')->references('id_user')->on('users')->nullOnDelete();
            $table->foreign('id_petugas')->references('id_user')->on('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
