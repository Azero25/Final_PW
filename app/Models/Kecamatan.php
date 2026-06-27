<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Kecamatan extends Model {
    protected $table = 'kecamatans';
    protected $primaryKey = 'id_kecamatan';
    protected $guarded = [];

    public function kabupaten() {
        return $this->belongsTo(Kabupaten::class, 'id_kabupaten', 'id_kabupaten');
    }

    public function kelurahans() {
        return $this->hasMany(Kelurahan::class, 'id_kecamatan', 'id_kecamatan');
    }
}
