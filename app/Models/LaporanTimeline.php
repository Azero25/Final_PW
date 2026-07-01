<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LaporanTimeline extends Model
{
    use HasFactory;

    protected $table = 'laporan_timelines';

    protected $fillable = ['no_ticket', 'status', 'keterangan', 'icon', 'color'];

    // Hubungkan balik ke model Laporan
    public function laporan()
    {
        return $this->belongsTo(Laporan::class, 'no_ticket', 'no_ticket');
    }
}
