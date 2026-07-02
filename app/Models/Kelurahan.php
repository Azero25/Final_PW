<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Kelurahan extends Model {
    protected $table = 'kelurahans';
    protected $primaryKey = 'id_kelurahan';
    protected $guarded = [];

    protected $fillable = [
        'nama_kelurahan',
        'id_kecamatan'
    ];

    public function kecamatan() {
        return $this->belongsTo(Kecamatan::class, 'id_kecamatan', 'id_kecamatan');
    }

    public function users() {
        return $this->hasMany(User::class, 'id_kelurahan', 'id_kelurahan');
    }

    public function laporans() {
        return $this->hasMany(Laporan::class, 'id_kelurahan', 'id_kelurahan');
    }

    public static function findUnique($namaKelurahan, $idKecamatan)
    {
        return self::where('nama_kelurahan', $namaKelurahan)
                   ->where('id_kecamatan', $idKecamatan)
                   ->first();
    }
}
