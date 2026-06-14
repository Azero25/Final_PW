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
        Schema::table('users', function (Blueprint $table) {
            $table->string('nik', 16)->nullable()->after('nama_lengkap');
            $table->longText('avatar')->nullable()->after('nik');
            $table->string('desa')->nullable()->after('alamat_lengkap');
            $table->string('kelurahan')->nullable()->after('desa');
            $table->string('kecamatan')->nullable()->after('kelurahan');
            $table->string('kabupaten')->nullable()->after('kecamatan');
            $table->string('provinsi')->nullable()->after('kabupaten');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['nik', 'avatar', 'desa', 'kelurahan', 'kecamatan', 'kabupaten', 'provinsi']);
        });
    }
};
