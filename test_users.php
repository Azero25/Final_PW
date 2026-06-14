<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$users = App\Models\User::orderBy('created_at', 'desc')->take(5)->get(['id_user', 'nama_lengkap', 'email']);
echo json_encode($users, JSON_PRETTY_PRINT);
