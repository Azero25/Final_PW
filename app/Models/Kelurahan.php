<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Kelurahan extends Model {
    protected $table = 'kelurahans';
    protected $primaryKey = 'id_kelurahan';
    protected $guarded = [];

    public function kecamatan() {
        return $this->belongsTo(Kecamatan::class, 'id_kecamatan', 'id_kecamatan');
    }

    public function users() {
        return $this->hasMany(User::class, 'id_kelurahan', 'id_kelurahan');
    }

    public function laporans() {
        return $this->hasMany(Laporan::class, 'id_kelurahan', 'id_kelurahan');
    }
}
