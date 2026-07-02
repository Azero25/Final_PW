<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Notification;
use App\Models\User;
use App\Models\Provinsi;
use App\Models\Kabupaten;
use App\Models\Kecamatan;
use App\Models\Kelurahan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;
use Intervention\Image\Encoders\WebpEncoder;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'nama_lengkap' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'warga',
        ]);

        // Create Notification
        Notification::create([
            'judul' => 'Pengguna baru terdaftar',
            'isi' => "{$user->nama_lengkap} ({$user->email}) berhasil mendaftar sebagai warga di sistem LaporWarga.",
            'tipe' => 'pengguna',
            'target_id' => $user->id_user,
            'dibaca' => false,
            'target_role' => 'admin',
        ]);

        Auth::login($user);

        return response()->json([
            'status' => 'success',
            'user' => $user,
        ], 200);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();

            return response()->json([
                'status' => 'success',
                'user' => Auth::user()->load('kelurahan.kecamatan.kabupaten.provinsi'),
            ], 200);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Email atau password salah.',
        ], 401);
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['status' => 'success'], 200);
    }

    public function me(Request $request)
    {
        if (Auth::check()) {
            return response()->json([
                'user' => Auth::user()->load('kelurahan.kecamatan.kabupaten.provinsi')
            ], 200);
        }

        return response()->json([
            'user' => null
        ], 401);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 401);
        }

        $userId = $user->id_user;
        $request->validate([
            'nama_lengkap'   => 'required|string|max:255',
            'nik'            => 'nullable|string|digits:16|unique:users,nik,' . $userId . ',id_user',
            'no_hp'          => 'nullable|string|min:10|max:20|unique:users,no_hp,' . $userId . ',id_user',
            'alamat_lengkap' => 'nullable|string',
            'avatar'         => 'nullable|string',

            'provinsi'       => 'required|string|max:255',
            'kabupaten'      => 'required|string|max:255',
            'kecamatan'      => 'required|string|max:255',
            'kelurahan'      => 'required|string|max:255',
        ]);

        // Pembuatan / pencarian wilayah data
        $provinsi = Provinsi::firstOrCreate(['nama_provinsi' => trim($request->provinsi)]);

        $kabupaten = Kabupaten::firstOrCreate(
            ['nama_kabupaten' => trim($request->kabupaten), 'id_provinsi' => $provinsi->id_provinsi],
            ['id_provinsi' => $provinsi->id_provinsi]
        );

        $kecamatan = Kecamatan::firstOrCreate(
            ['nama_kecamatan' => trim($request->kecamatan), 'id_kabupaten' => $kabupaten->id_kabupaten],
            ['id_kabupaten' => $kabupaten->id_kabupaten]
        );

        $kelurahan = Kelurahan::firstOrCreate(
            ['nama_kelurahan' => trim($request->kelurahan), 'id_kecamatan' => $kecamatan->id_kecamatan],
            ['id_kecamatan' => $kecamatan->id_kecamatan]
        );

        // Default: gunakan avatar yang sudah ada saat ini di database
        $avatarPath = $user->avatar;

        // Cek 1: Jika user mengirimkan data Base64 baru
        if ($request->filled('avatar') && str_starts_with($request->avatar, 'data:image')) {
            try {
                // Proses gambar baru terlebih dahulu
                $encodedImage = Image::decode($request->avatar)->encode(new WebpEncoder(quality: 80));
                $fileName = 'avatar_' . time() . '_' . mt_rand(1000, 9999) . '.webp';
                $folderPath = "avatars/{$user->role}/{$fileName}";
                
                Storage::disk('public')->put($folderPath, $encodedImage->toString());

                // Hapus file lama HANYA KETIKA file baru berhasil disimpan ke storage
                if ($user->avatar && str_starts_with($user->avatar, '/storage/')) {
                    $oldFilePath = substr($user->avatar, 9); // memotong '/storage/'
                    Storage::disk('public')->delete($oldFilePath);
                }

                $avatarPath = '/storage/' . $folderPath;
            } catch (\Exception $e) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Gagal memproses dan menyimpan avatar baru'
                ], 500);
            }
        } 
        // Cek 2: Jika user secara eksplisit menghapus fotonya (mengirimkan string kosong atau null)
        else if ($request->has('avatar') && empty($request->avatar)) {
            if ($user->avatar && str_starts_with($user->avatar, '/storage/')) {
                $oldFilePath = substr($user->avatar, 9);
                Storage::disk('public')->delete($oldFilePath);
            }
            $avatarPath = null;
        }

        // Eksekusi update data ke database
        $user->update([
            'nama_lengkap'   => $request->nama_lengkap,
            'nik'            => $request->nik,
            'no_hp'          => $request->no_hp,
            'alamat_lengkap' => $request->alamat_lengkap,
            'id_kelurahan'   => $kelurahan->id_kelurahan,
            'avatar'         => $avatarPath,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Profil berhasil diperbarui',
            'user'    => $user->load('kelurahan.kecamatan.kabupaten.provinsi')
        ], 200);
    }

    public function updatePassword(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 401);
        }

        $request->validate([
            'password_lama' => 'required|string',
            'password_baru' => 'required|string|min:8',
        ]);

        if (!Hash::check($request->password_lama, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kata sandi saat ini salah.'
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->password_baru)
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Kata sandi berhasil diubah.'
        ], 200);
    }
}
