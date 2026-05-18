<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pengaduan extends Model
{
    /** @use HasFactory<\Database\Factories\PengaduanFactory> */
    use HasFactory;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'timeline' => 'array',
            'anonim' => 'boolean',
        ];
    }
}
