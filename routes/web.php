<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\PengaduanController;
use App\Http\Controllers\Api\DinasController;
use App\Http\Controllers\Api\PetugasController;

Route::prefix('api')->group(function () {
    // Auth Routes
    Route::post('/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);
    Route::post('/register', [\App\Http\Controllers\Api\AuthController::class, 'register']);
    Route::post('/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);
    Route::get('/me', [\App\Http\Controllers\Api\AuthController::class, 'me']);

    // Pengaduan Routes
    Route::get('/pengaduans', [PengaduanController::class, 'index']);
    Route::post('/pengaduans', [PengaduanController::class, 'store']);
    Route::get('/pengaduans/{nomorTiket}', [PengaduanController::class, 'show']);
    Route::put('/pengaduans/{nomorTiket}', [PengaduanController::class, 'update']);
    Route::delete('/pengaduans/{nomorTiket}', [PengaduanController::class, 'destroy']);
    
    // Users Routes
    Route::get('/users', [\App\Http\Controllers\Api\UserController::class, 'index']);
    Route::post('/users', [\App\Http\Controllers\Api\UserController::class, 'store']);
    Route::put('/users/{id}', [\App\Http\Controllers\Api\UserController::class, 'update']);
    Route::patch('/users/{id}/status', [\App\Http\Controllers\Api\UserController::class, 'updateStatus']);
    Route::delete('/users/{id}', [\App\Http\Controllers\Api\UserController::class, 'destroy']);

    // Dinas Routes
    Route::get('/dinas', [DinasController::class, 'index']);
    Route::post('/dinas', [DinasController::class, 'store']);

    // Petugas Routes
    Route::get('/petugas', [PetugasController::class, 'index']);
    Route::post('/petugas', [PetugasController::class, 'store']);
    Route::put('/petugas/{id}', [PetugasController::class, 'update']);
    Route::delete('/petugas/{id}', [PetugasController::class, 'destroy']);
});

Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
