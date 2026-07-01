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
        Schema::create('laporan_timelines', function (Blueprint $table) {
            $table->id();
            $table->string('no_ticket');
            $table->string('status');
            $table->text('keterangan');
            $table->string('icon');
            $table->string('color');
            $table->timestamps();

            $table->foreign('no_ticket')->references('no_ticket')->on('laporans')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('laporan_timelines');
    }
};
