<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Dinas;
use App\Models\Jabatan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class PetugasController extends Controller
{
    public function index()
    {
        $petugas = User::where('role', 'petugas')->get()->map(function($p) {
            return [
                'id' => 'PTG-' . str_pad($p->id_user, 3, '0', STR_PAD_LEFT),
                'original_id' => $p->id_user,
                'nama' => $p->nama_lengkap,
                'nip' => $p->nip,
                'dinas' => $p->id_dinas ? 'DNS-' . str_pad($p->id_dinas, 3, '0', STR_PAD_LEFT) : null,
                'original_dinas_id' => $p->id_dinas,
                'dinas_nama' => Dinas::find($p->id_dinas)?->nama_dinas ?? '-',
                'id_jabatan' => $p->id_jabatan,
                'jabatan' => Jabatan::find($p->id_jabatan)?->nama_jabatan ?? 'Staf',
                'telp' => $p->no_hp ?? '-',
                'status' => $p->status ?? 'Aktif',
                'bebanKerja' => $p->count_laporan ?? 0,
                'avatar' => $p->avatar,
            ];
        });

        return response()->json($petugas);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'nip' => 'required|string|unique:users,nip',
            'dinas' => 'required',
            'jabatan' => 'required',
            'telp' => 'nullable|string|max:20',
        ]);

        $dinasId = $request->dinas;
        if (is_string($dinasId) && str_starts_with($dinasId, 'DNS-')) {
            $dinasId = (int) str_replace('DNS-', '', $dinasId);
        } else {
            $dinasId = (int) $dinasId;
        }

        $jabatanId = $request->jabatan;
        $jabatanId = (int) $jabatanId;

        $jabatan = Jabatan::find($jabatanId);

        $base = strtolower(str_replace([' ', '.'], '', $request->nama));
        $email = $base . '@gmail.com';
        $counter = 1;
        while (User::where('email', $email)->exists()) {
            $email = $base . $counter . '@gmail.com';
            $counter++;
        }
        $password = bcrypt('petugas123');

        $p = User::create([
            'nama_lengkap' => $request->nama,
            'nip' => $request->nip,
            'email' => $email,
            'password' => $password,
            'no_hp' => $request->telp,
            'id_dinas' => $dinasId,
            'id_jabatan' => $jabatanId,
            'role' => 'petugas',
            'count_laporan' => 0,
        ]);

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => 'PTG-' . str_pad($p->id_user, 3, '0', STR_PAD_LEFT),
                'original_id' => $p->id_user,
                'nama' => $p->nama_lengkap,
                'nip' => $p->nip,
                'username' => $p->email,
                'dinas' => 'DNS-' . str_pad($p->id_dinas, 3, '0', STR_PAD_LEFT),
                'original_dinas_id' => $p->id_dinas,
                'dinas_nama' => Dinas::find($p->id_dinas)?->nama_dinas ?? '-',
                'jabatan' => $jabatan->nama_jabatan,
                'telp' => $p->no_hp ?? '-',
                'status' => 'Aktif',
                'bebanKerja' => 0,
                'avatar' => $p->avatar,
            ]
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'nip' => 'required|string|unique:users,nip,' . $id . ',id_user',
            'dinas' => 'required',
            'jabatan' => 'required',
            'telp' => 'nullable|string|max:20',
        ]);

        $p = User::where('role', 'petugas')->findOrFail($id);

        $dinasId = $request->dinas;
        if (is_string($dinasId) && str_starts_with($dinasId, 'DNS-')) {
            $dinasId = (int) str_replace('DNS-', '', $dinasId);
        } else {
            $dinasId = (int) $dinasId;
        }

        $jabatanId = (int) $request->jabatan;
        $jabatan = Jabatan::find($jabatanId);

        $p->update([
            'nama_lengkap' => $request->nama,
            'nip' => $request->nip,
            'no_hp' => $request->telp,
            'id_dinas' => $dinasId,
            'id_jabatan' => $jabatanId,
        ]);

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => 'PTG-' . str_pad($p->id_user, 3, '0', STR_PAD_LEFT),
                'original_id' => $p->id_user,
                'nama' => $p->nama_lengkap,
                'nip' => $p->nip,
                'dinas' => 'DNS-' . str_pad($p->id_dinas, 3, '0', STR_PAD_LEFT),
                'original_dinas_id' => $p->id_dinas,
                'dinas_nama' => Dinas::find($p->id_dinas)?->nama_dinas ?? '-',
                'jabatan' => $jabatan->nama_jabatan,
                'telp' => $p->no_hp ?? '-',
                'status' => 'Aktif',
                'bebanKerja' => $p->count_laporan ?? 0,
                'avatar' => $p->avatar,
            ]
        ]);
    }

    public function destroy($id)
    {
        $p = User::where('role', 'petugas')->findOrFail($id);
        $p->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Petugas berhasil dihapus'
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $petugas = User::where('role', 'petugas')
            ->where(function ($q) use ($request) {
                $q->where('email', $request->username)
                  ->orWhere('nip', $request->username);
            })
            ->first();

        if ($petugas && Hash::check($request->password, $petugas->password)) {
            $dinas = Dinas::find($petugas->id_dinas);
            $jabatan = Jabatan::find($petugas->id_jabatan);

            return response()->json([
                'status' => 'success',
                'petugas' => [
                    'id' => 'PTG-' . str_pad($petugas->id_user, 3, '0', STR_PAD_LEFT),
                    'original_id' => $petugas->id_user,
                    'nama' => $petugas->nama_lengkap,
                    'dinas' => $dinas ? $dinas->nama_dinas : 'Tidak ada dinas',
                    'original_dinas_id' => $petugas->id_dinas,
                    'jabatan' => $jabatan ? $jabatan->nama_jabatan : 'Staf',
                    'username' => $petugas->email,
                    'email' => $petugas->email,
                    'telepon' => $petugas->no_hp ?? '-',
                    'avatar' => $petugas->avatar,
                ]
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Username/NIP atau password salah.'
        ], 401);
    }

    public function updateProfile(Request $request, $id)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'nip' => 'required|string|unique:users,nip,' . $id . ',id_user',
            'telp' => 'nullable|string|max:20',
            'avatar' => 'nullable|string',
        ]);

        $petugas = User::where('role', 'petugas')->findOrFail($id);

        $avatarPath = $request->avatar;

        if ($request->avatar && preg_match('/^data:image\/(\w+);base64,/', $request->avatar)) {
            try {
                if ($petugas->avatar && str_starts_with($petugas->avatar, '/storage/')) {
                    $oldPath = substr($petugas->avatar, 9);
                    if (Storage::disk('public')->exists($oldPath)) {
                        Storage::disk('public')->delete($oldPath);
                    }
                }

                $fileName = 'avatar_' . time() . '_' . mt_rand(1000, 9999) . '.webp';
                $subPath = 'avatars/petugas/' . $fileName;

                $imgEncoded = Image::decode($request->avatar)->encode(new WebpEncoder(quality: 80));
                Storage::disk('public')->put($subPath, (string) $imgEncoded);

                $avatarPath = '/storage/' . $subPath;

            } catch (\Exception $e) {
                Log::error('Gagal memproses avatar V3: ' . $e->getMessage());
            }

        } elseif ($request->avatar === null) {
            if ($petugas->avatar && str_starts_with($petugas->avatar, '/storage/')) {
                $oldPath = substr($petugas->avatar, 9);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }
            $avatarPath = null;
        }

        $petugas->update([
            'nama_lengkap' => $request->nama,
            'nip' => $request->nip,
            'no_hp' => $request->telp,
            'avatar' => $avatarPath,
        ]);

        $dinas = Dinas::find($petugas->id_dinas);
        $jabatan = Jabatan::find($petugas->id_jabatan);

        return response()->json([
            'status' => 'success',
            'message' => 'Profil berhasil diperbarui',
            'petugas' => [
                'id' => 'PTG-' . str_pad($petugas->id_user, 3, '0', STR_PAD_LEFT),
                'original_id' => $petugas->id_user,
                'nama' => $petugas->nama_lengkap,
                'dinas' => $dinas ? $dinas->nama_dinas : 'Tidak ada dinas',
                'jabatan' => $jabatan ? $jabatan->nama_jabatan : 'Staf',
                'username' => $petugas->email,
                'email' => $petugas->email,
                'telepon' => $petugas->no_hp ?? '-',
                'avatar' => $petugas->avatar,
            ]
        ]);
    }

    public function updatePassword(Request $request, $id)
    {
        $petugas = User::where('role', 'petugas')->findOrFail($id);

        $request->validate([
            'password_lama' => 'required|string',
            'password_baru' => 'required|string|min:8',
        ]);

        if (!Hash::check($request->password_lama, $petugas->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kata sandi saat ini salah.'
            ], 422);
        }

        $petugas->update([
            'password' => Hash::make($request->password_baru)
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Kata sandi berhasil diubah.'
        ]);
    }
}
