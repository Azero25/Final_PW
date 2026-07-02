<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Provinsi extends Model {
    protected $table = 'provinsis';
    protected $primaryKey = 'id_provinsi';
    protected $guarded = [];

    protected $fillable = [
        'nama_provinsi'
    ];

    public function kabupatens() {
        return $this->hasMany(Kabupaten::class, 'id_provinsi', 'id_provinsi');
    }
}
