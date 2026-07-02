<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Jabatan extends Model {
    protected $table = 'jabatans';
    protected $primaryKey = 'id_jabatan';
    protected $guarded = [];

    public function users() {
        return $this->hasMany(User::class, 'id_jabatan', 'id_jabatan');
    }
}
