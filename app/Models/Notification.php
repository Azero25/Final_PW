<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $table = 'notifications';

    protected $guarded = [];

    protected $primaryKey = 'id_notification';

    protected $casts = [
        'dibaca' => 'boolean',
    ];

    public function user() {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }

    public function petugas() {
        return $this->belongsTo(User::class, 'id_petugas', 'id_user');
    }
}
