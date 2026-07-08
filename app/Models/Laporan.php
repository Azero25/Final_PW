<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Laporan extends Model {
    protected $table = 'laporans';
    protected $primaryKey = 'no_ticket';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $guarded = [];
    protected $casts = [
        'timeline_log' => 'array',
        'tanggal_laporan' => 'datetime',
        'anonim' => 'boolean',
    ];

    public function kategori() {
        return $this->belongsTo(Kategori::class, 'id_kategori', 'id_kategori');
    }

    public function kelurahan() {
        return $this->belongsTo(Kelurahan::class, 'id_kelurahan', 'id_kelurahan');
    }

    public function user() {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }

    public function petugas() {
        return $this->belongsTo(User::class, 'id_petugas', 'id_user');
    }

    public function timelines()
    {
        return $this->hasMany(LaporanTimeline::class, 'no_ticket', 'no_ticket')->orderBy('created_at', 'asc');
    }
}
