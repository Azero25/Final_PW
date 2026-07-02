<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\PengaduanController;
use App\Http\Controllers\Api\DinasController;
use App\Http\Controllers\Api\PetugasController;
use App\Http\Controllers\Api\KategoriController;
use App\Http\Controllers\Api\WilayahController;
use App\Http\Controllers\Api\JabatanController;

Route::prefix('api')->group(function () {
    // Auth Routes
    Route::post('/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);
    Route::post('/register', [\App\Http\Controllers\Api\AuthController::class, 'register']);
    Route::post('/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);
    Route::get('/me', [\App\Http\Controllers\Api\AuthController::class, 'me']);
    Route::put('/profile', [\App\Http\Controllers\Api\AuthController::class, 'updateProfile']);
    Route::put('/profile/password', [\App\Http\Controllers\Api\AuthController::class, 'updatePassword']);

    // Pengaduan Routes
    Route::get('/pengaduans', [PengaduanController::class, 'index']);
    Route::post('/pengaduans', [PengaduanController::class, 'store']);
    Route::get('/pengaduans/{nomorTiket}', [PengaduanController::class, 'show']);
    Route::put('/pengaduans/{nomorTiket}', [PengaduanController::class, 'update']);
    Route::delete('/pengaduans/{nomorTiket}', [PengaduanController::class, 'destroy']);
    Route::get('/pengaduans/{nomorTiket}/petugas-eligible', [PengaduanController::class, 'getEligiblePetugas']);
    Route::post('/pengaduans/{nomorTiket}/assign', [PengaduanController::class, 'assignPetugas']);
    
    // Users Routes
    Route::get('/users', [\App\Http\Controllers\Api\UserController::class, 'index']);
    Route::post('/users', [\App\Http\Controllers\Api\UserController::class, 'store']);
    Route::put('/users/{id}', [\App\Http\Controllers\Api\UserController::class, 'update']);
    Route::patch('/users/{id}/status', [\App\Http\Controllers\Api\UserController::class, 'updateStatus']);
    Route::delete('/users/{id}', [\App\Http\Controllers\Api\UserController::class, 'destroy']);

    // Dinas Routes
    Route::get('/dinas', [DinasController::class, 'index']);
    Route::post('/dinas', [DinasController::class, 'store']);
    Route::put('/dinas/{id}', [DinasController::class, 'update']);
    Route::delete('/dinas/{id}', [DinasController::class, 'destroy']);

    // Kategori Routes
    Route::get('/kategoris', [KategoriController::class, 'index']);
    Route::post('/kategoris', [KategoriController::class, 'store']);
    Route::put('/kategoris/{id}', [KategoriController::class, 'update']);
    Route::delete('/kategoris/{id}', [KategoriController::class, 'destroy']);

    // Jabatan Routes
    Route::get('/jabatans', [JabatanController::class, 'index']);
    Route::post('/jabatans', [JabatanController::class, 'store']);
    Route::put('/jabatans/{id}', [JabatanController::class, 'update']);
    Route::delete('/jabatans/{id}', [JabatanController::class, 'destroy']);

    // Petugas Routes
    Route::get('/petugas', [PetugasController::class, 'index']);
    Route::post('/petugas', [PetugasController::class, 'store']);
    Route::put('/petugas/{id}', [PetugasController::class, 'update']);
    Route::delete('/petugas/{id}', [PetugasController::class, 'destroy']);
    Route::post('/petugas/login', [PetugasController::class, 'login']);
    Route::put('/petugas/profile/{id}', [PetugasController::class, 'updateProfile']);
    Route::put('/petugas/profile/{id}/password', [PetugasController::class, 'updatePassword']);

    // Get Wilayah Routes
    Route::prefix('wilayah')->group(function () {
        Route::get('/search-cascading', [WilayahController::class, 'searchWilayah']);
        Route::post('/provinsi', [WilayahController::class, 'storeProvinsi']);
        Route::post('/kabupaten', [WilayahController::class, 'storeKabupaten']);
        Route::post('/kecamatan', [WilayahController::class, 'storeKecamatan']);
        Route::post('/kelurahan', [WilayahController::class, 'storeKelurahan']);
    });

    // Notification Routes
    Route::get('/notifications', [\App\Http\Controllers\Api\NotificationController::class, 'index']);
    Route::put('/notifications/read-all', [\App\Http\Controllers\Api\NotificationController::class, 'markAllAsRead']);
    Route::put('/notifications/{id}/read', [\App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);
    Route::delete('/notifications/delete-read', [\App\Http\Controllers\Api\NotificationController::class, 'destroyRead']);
    Route::delete('/notifications/{id}', [\App\Http\Controllers\Api\NotificationController::class, 'destroy']);
});

Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
