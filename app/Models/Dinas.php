<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Dinas extends Model {
    protected $table = 'dinas';
    protected $primaryKey = 'id_dinas';
    protected $guarded = [];

    public function users() {
        return $this->hasMany(User::class, 'id_dinas', 'id_dinas');
    }

    public function kategoris() {
        return $this->hasMany(Kategori::class, 'id_dinas', 'id_dinas');
    }
}
