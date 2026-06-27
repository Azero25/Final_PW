<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kabupaten extends Model {
    protected $table = 'kabupatens';
    protected $primaryKey = 'id_kabupaten';
    protected $guarded = [];

    public function provinsi() {
        return $this->belongsTo(Provinsi::class, 'id_provinsi', 'id_provinsi');
    }

    public function kecamatans() {
        return $this->hasMany(Kecamatan::class, 'id_kabupaten', 'id_kabupaten');
    }
}
