<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Kategori extends Model {
    protected $table = 'kategoris';
    protected $primaryKey = 'id_kategori';
    protected $guarded = [];

    public function dinas() {
        return $this->belongsToMany(Dinas::class, 'kategori_dinas', 'id_kategori', 'id_dinas');
    }

    public function laporans() {
        return $this->hasMany(Laporan::class, 'id_kategori', 'id_kategori');
    }
}
