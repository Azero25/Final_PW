<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Laporan extends Model {
    protected $table = 'laporans';
    protected $primaryKey = 'no_ticket';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $guarded = [];
    protected $casts = [
        'timeline_log' => 'array',
    ];
}
