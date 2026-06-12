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
        Schema::table('notifications', function (Blueprint $table) {
            $table->string('target_role')->nullable(); // admin, petugas, warga
            $table->unsignedBigInteger('id_user')->nullable();
            $table->unsignedBigInteger('id_petugas')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropColumn(['target_role', 'id_user', 'id_petugas']);
        });
    }
};
