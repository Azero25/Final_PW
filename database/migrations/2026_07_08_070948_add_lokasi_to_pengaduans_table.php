<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('laporans', function (Blueprint $table) {
            // Menambahkan kolom lokasi setelah isi_laporan
            $table->text('lokasi')->nullable()->after('isi_laporan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('laporans', function (Blueprint $table) {
            $table->dropColumn('lokasi');
        });
    }
};
