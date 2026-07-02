<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('provinsis', function (Blueprint $table) {
            $table->id('id_provinsi');
            $table->string('nama_provinsi')->unique();
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('provinsis');
    }
};
