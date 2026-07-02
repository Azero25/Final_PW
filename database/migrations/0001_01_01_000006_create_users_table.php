<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('users', function (Blueprint $table) {
            $table->id('id_user');
            $table->string('nama_lengkap');
            $table->string('nik', 16)->nullable();
            $table->string('nip')->nullable()->unique();
            $table->longText('avatar')->nullable();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('no_hp')->nullable();
            $table->string('alamat_lengkap')->nullable();

            $table->unsignedBigInteger('id_dinas')->nullable();
            $table->unsignedBigInteger('id_jabatan')->nullable();
            $table->unsignedBigInteger('id_kelurahan')->nullable();

            $table->integer('count_laporan')->default(0);
            $table->dateTime('tanggal_bergabung')->useCurrent();

            $table->enum('role', ['admin', 'warga', 'petugas'])->default('warga');
            $table->enum('status', ['Aktif', 'Nonaktif'])->default('Aktif');

            $table->rememberToken();
            $table->timestamps();

            $table->foreign('id_dinas')->references('id_dinas')->on('dinas')->nullOnDelete();
            $table->foreign('id_jabatan')->references('id_jabatan')->on('jabatans')->nullOnDelete();
            $table->foreign('id_kelurahan')->references('id_kelurahan')->on('kelurahans')->nullOnDelete();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
