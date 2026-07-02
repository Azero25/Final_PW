<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable {
    use HasFactory, Notifiable;

    protected $table = 'users';
    protected $primaryKey = 'id_user';
    protected $guarded = [];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array {
        return [
            'password' => 'hashed',
        ];
    }

    public function dinas() {
        return $this->belongsTo(Dinas::class, 'id_dinas', 'id_dinas');
    }

    public function jabatan() {
        return $this->belongsTo(Jabatan::class, 'id_jabatan', 'id_jabatan');
    }

    public function kelurahan() {
        return $this->belongsTo(Kelurahan::class, 'id_kelurahan', 'id_kelurahan');
    }

    public function laporans() {
        return $this->hasMany(Laporan::class, 'id_user', 'id_user');
    }

    public function tugas() {
        return $this->hasMany(Laporan::class, 'id_petugas', 'id_user');
    }
}
