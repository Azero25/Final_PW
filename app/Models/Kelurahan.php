<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Kelurahan extends Model {
    protected $table = 'kelurahans';
    protected $primaryKey = 'id_kelurahan';
    protected $guarded = [];
}
