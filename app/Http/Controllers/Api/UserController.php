<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        $users = User::all()->map(function ($user) {
            $totalLaporan = \App\Models\Pengaduan::where('nama', $user->name)->count();
            
            return [
                'id' => 'USR-' . str_pad($user->id, 3, '0', STR_PAD_LEFT),
                'nama' => $user->name,
                'email' => $user->email,
                'telp' => $user->telp ?? '-', 
                'kecamatan' => $user->kecamatan ?? '-', 
                'totalLaporan' => $totalLaporan, 
                'status' => $user->status ?? 'Aktif',
                'bergabung' => $user->created_at ? $user->created_at->format('d M Y') : '-',
                'avatar' => strtoupper(substr($user->name, 0, 1)),
                'role' => $user->role,
                'original_id' => $user->id,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $users
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'telp' => 'nullable|string|max:20',
            'kecamatan' => 'nullable|string|max:255',
            'status' => 'required|string|in:Aktif,Nonaktif,Diblokir',
        ]);

        $user = User::create([
            'name' => $request->nama,
            'email' => $request->email,
            'telp' => $request->telp,
            'kecamatan' => $request->kecamatan,
            'status' => $request->status,
            'password' => Hash::make('password123'), // default password
            'role' => 'warga',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Pengguna berhasil ditambahkan',
            'data' => $user
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'nama' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'telp' => 'nullable|string|max:20',
            'kecamatan' => 'nullable|string|max:255',
            'status' => 'required|string|in:Aktif,Nonaktif,Diblokir',
        ]);

        $user->update([
            'name' => $request->nama,
            'email' => $request->email,
            'telp' => $request->telp,
            'kecamatan' => $request->kecamatan,
            'status' => $request->status,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Pengguna berhasil diperbarui',
            'data' => $user
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'status' => 'required|string|in:Aktif,Nonaktif,Diblokir',
        ]);

        $user->update([
            'status' => $request->status,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Status pengguna berhasil diperbarui',
            'data' => $user
        ]);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Pengguna berhasil dihapus'
        ]);
    }
}
