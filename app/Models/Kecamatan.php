<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Kecamatan extends Model {
    protected $table = 'kecamatans';
    protected $primaryKey = 'id_kecamatan';
    protected $guarded = [];

    protected $fillable = [
        'nama_kecamatan',
        'id_kabupaten'
    ];

    public function kabupaten() {
        return $this->belongsTo(Kabupaten::class, 'id_kabupaten', 'id_kabupaten');
    }

    public function kelurahans() {
        return $this->hasMany(Kelurahan::class, 'id_kecamatan', 'id_kecamatan');
    }

    public static function findUnique($namaKecamatan, $idKabupaten)
    {
        return self::where('nama_kecamatan', $namaKecamatan)
                   ->where('id_kabupaten', $idKabupaten)
                   ->first();
    }
}
