<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

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
        ]);
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
                'user' => Auth::user(),
            ]);
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

        return response()->json(['status' => 'success']);
    }

    public function me(Request $request)
    {
        if (Auth::check()) {
            return response()->json([
                'user' => Auth::user()
            ]);
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

        $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'nik' => 'nullable|string|size:16',
            'no_hp' => 'nullable|string|min:10|max:20',
            'alamat_lengkap' => 'nullable|string',
            'desa' => 'nullable|string|max:255',
            'kelurahan' => 'nullable|string|max:255',
            'kecamatan' => 'nullable|string|max:255',
            'kabupaten' => 'nullable|string|max:255',
            'provinsi' => 'nullable|string|max:255',
            'avatar' => 'nullable|string',
        ]);

        $avatarPath = $request->avatar;

        if ($request->avatar && preg_match('/^data:image\/(\w+);base64,/', $request->avatar, $type)) {
            $data = substr($request->avatar, strpos($request->avatar, ',') + 1);
            $data = base64_decode($data);
            if ($data !== false) {
                $folder = $user->role === 'admin' ? 'admin' : 'warga';
                $extension = strtolower($type[1]) ?: 'webp';
                $fileName = 'avatar_' . time() . '_' . mt_rand(1000, 9999) . '.' . $extension;

                Storage::disk('public')->put('avatars/' . $folder . '/' . $fileName, $data);

                if ($user->avatar && str_starts_with($user->avatar, '/storage/')) {
                    $oldPath = substr($user->avatar, 9);
                    if (Storage::disk('public')->exists($oldPath)) {
                        Storage::disk('public')->delete($oldPath);
                    }
                }

                $avatarPath = '/storage/avatars/' . $folder . '/' . $fileName;
            }
        } elseif ($request->avatar === null) {
            if ($user->avatar && str_starts_with($user->avatar, '/storage/')) {
                $oldPath = substr($user->avatar, 9);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }
            $avatarPath = null;
        }

        $user->update([
            'nama_lengkap' => $request->nama_lengkap,
            'nik' => $request->nik,
            'no_hp' => $request->no_hp,
            'alamat_lengkap' => $request->alamat_lengkap,
            'desa' => $request->desa,
            'kelurahan' => $request->kelurahan,
            'kecamatan' => $request->kecamatan,
            'kabupaten' => $request->kabupaten,
            'provinsi' => $request->provinsi,
            'avatar' => $avatarPath,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Profil berhasil diperbarui',
            'user' => $user
        ]);
    }

    public function updatePassword(Request $request)
    {
        $user = Auth
::user();
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
        ]);
    }
}
