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
        Schema::create('kabupatens', function (Blueprint $table) {
            $table->id('id_kabupaten');
            $table->string('nama_kabupaten');
            $table->unsignedBigInteger('id_provinsi');
            $table->timestamps();

            $table->unique(['nama_kabupaten', 'id_provinsi']);
            $table->foreign('id_provinsi')->references('id_provinsi')->on('provinsis')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kabupatens');
    }
};
