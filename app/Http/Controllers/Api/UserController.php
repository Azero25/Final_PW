<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Kelurahan;
use App\Models\Laporan;
use Carbon\Carbon;
use App\Models\Provinsi;
use App\Models\Kabupaten;
use App\Models\Kecamatan;

class UserController extends Controller
{
    public function index()
    {
        $users = User::whereIn('role', ['warga', 'admin'])->get();

        $laporanCounts = Laporan::selectRaw('id_user, count(*) as count')
            ->groupBy('id_user')
            ->pluck('count', 'id_user');

        $kelurahanIds = $users->pluck('id_kelurahan')->filter()->unique();
        $kelurahans = Kelurahan::whereIn('id_kelurahan', $kelurahanIds)->get()->keyBy('id_kelurahan');

        $mappedUsers = $users->map(function ($user) use ($laporanCounts, $kelurahans) {
            $totalLaporan = $laporanCounts->get($user->id_user, 0);

            $kelurahanName = '-';
            if ($user->id_kelurahan && $kelurahans->has($user->id_kelurahan)) {
                $kelurahanName = $kelurahans->get($user->id_kelurahan)->nama_kelurahan;
            }

            return [
                'id' => 'USR-' . str_pad($user->id_user, 3, '0', STR_PAD_LEFT),
                'nama' => $user->nama_lengkap,
                'email' => $user->email,
                'telp' => $user->no_hp ?? '-',
                'kelurahan' => $kelurahanName,
                'totalLaporan' => $totalLaporan,
                'status' => $user->status ?? 'Aktif',
                'bergabung' => $user->tanggal_bergabung ? Carbon::parse($user->tanggal_bergabung)->format('d M Y') : '-',
                'avatar' => $user->avatar ?? strtoupper(substr($user->nama_lengkap, 0, 1)),
                'role' => $user->role,
                'original_id' => $user->id_user,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $mappedUsers
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'telp' => 'nullable|string|max:20',
            'kelurahan' => 'nullable|string|max:255',
            'status' => 'nullable|string',
            'role' => 'required|string|in:warga,admin',
            'password' => 'required|string|min:8',
        ]);

        $kelurahanId = null;
        if($request->filled('kelurahan')) {
            $provinsi = Provinsi::firstOrCreate([
                'nama_provinsi' => 'D.I. Yogyakarta'
            ]);
            $kabupaten = Kabupaten::firstOrCreate([
                'nama_kabupaten' => 'Sleman',
                'id_provinsi' => $provinsi->id_provinsi
            ]);
            $kecamatan = Kecamatan::firstOrCreate([
                'nama_kecamatan' => 'Sleman',
                'id_kabupaten' => $kabupaten->id_kabupaten
            ]);
            $kelurahan = Kelurahan::firstOrCreate([
                'nama_kelurahan' => $request->kelurahan,
                'id_kecamatan' => $kecamatan->id_kecamatan
            ]);
            $kelurahanId = $kelurahan->id_kelurahan;
        } else {
            $kelurahanId = null;
        }

        $user = User::create([
            'nama_lengkap' => $request->nama,
            'email' => $request->email,
            'no_hp' => $request->telp,
            'id_kelurahan' => $kelurahanId,
            'status' => $request->status ?? 'Aktif',
            'password' => Hash::make($request->password),
            'role' => $request->role,
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
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id_user . ',id_user',
            'telp' => 'nullable|string|max:20',
            'kelurahan' => 'nullable|string|max:255',
            'role' => 'required|string|in:warga,admin',
            'status' => 'nullable|string',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        $kelurahanId = $user->id_kelurahan;
        if($request->filled('kelurahan')) {
            if ($user->kelurahan && $user->kelurahan->kecamatan) {
                $kecamatanDb = $user->kelurahan->kecamatan;
            } else {
                $provinsi = Provinsi::firstOrCreate(['nama_provinsi' => 'D.I. Yogyakarta']);
                $kabupaten = Kabupaten::firstOrCreate(
                    ['nama_kabupaten' => 'Sleman'],
                    ['id_provinsi' => $provinsi->id_provinsi]
                );
                $kecamatanDb = Kecamatan::firstOrCreate(
                    ['nama_kecamatan' => 'Sleman'],
                    ['id_kabupaten' => $kabupaten->id_kabupaten]
                );
            }

            $kelurahan = Kelurahan::firstOrCreate([
                'nama_kelurahan' => $request->kelurahan,
                'id_kecamatan'   => $kecamatanDb->id_kecamatan
            ]);

            $kelurahanId = $kelurahan->id_kelurahan;
        } else if($request->exists('kelurahan') && empty($request->kelurahan)){
            $kelurahanId = null;
        }

        $updatedData = [
            'nama_lengkap' => $request->nama,
            'email' => $request->email,
            'no_hp' => $request->telp,
            'id_kelurahan' => $kelurahanId,
            'role' => $request->role,
            'status' => $request->status ?? $user->status,
        ];

        if($request->filled('password')) {
            $updatedData['password'] = Hash::make($request->password);
        }

        $user->update($updatedData);

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

        $user->update(['status' => $request->status]);

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
