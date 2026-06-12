<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Petugas;
use App\Models\Dinas;
use App\Models\Jabatan;
use Illuminate\Http\Request;

class PetugasController extends Controller
{
    public function index()
    {
        $petugas = Petugas::all()->map(function($p) {
            return [
                'id' => 'PTG-' . str_pad($p->id_petugas, 3, '0', STR_PAD_LEFT),
                'original_id' => $p->id_petugas,
                'nama' => $p->nama_petugas,
                'nip' => $p->NIP,
                'dinas' => $p->id_dinas ? 'DNS-' . str_pad($p->id_dinas, 3, '0', STR_PAD_LEFT) : null,
                'original_dinas_id' => $p->id_dinas,
                'dinas_nama' => Dinas::find($p->id_dinas)?->nama_dinas ?? '-',
                'jabatan' => Jabatan::find($p->id_jabatan)?->nama_jabatan ?? 'Staf',
                'telp' => $p->no_hp ?? '-',
                'status' => 'Aktif', // Default
                'bebanKerja' => $p->beban_kerja ?? 0,
                'avatar' => $p->avatar,
            ];
        });

        return response()->json($petugas);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'nip' => 'required|string|unique:petugas,NIP',
            'dinas' => 'required',
            'jabatan' => 'required|string|max:255',
            'telp' => 'nullable|string|max:20',
        ]);

        $dinasId = $request->dinas;
        if (is_string($dinasId) && str_starts_with($dinasId, 'DNS-')) {
            $dinasId = (int) str_replace('DNS-', '', $dinasId);
        } else {
            $dinasId = (int) $dinasId;
        }

        $jabatan = Jabatan::firstOrCreate(['nama_jabatan' => $request->jabatan]);

        $base = strtolower(str_replace([' ', '.'], '', $request->nama));
        $username = $base . '@gmail.com';
        $counter = 1;
        while (Petugas::where('username', $username)->exists()) {
            $username = $base . $counter . '@gmail.com';
            $counter++;
        }
        $password = bcrypt('petugas123');

        $p = Petugas::create([
            'nama_petugas' => $request->nama,
            'NIP' => $request->nip,
            'username' => $username,
            'password' => $password,
            'no_hp' => $request->telp,
            'id_dinas' => $dinasId,
            'id_jabatan' => $jabatan->id_jabatan,
            'beban_kerja' => 0,
        ]);

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => 'PTG-' . str_pad($p->id_petugas, 3, '0', STR_PAD_LEFT),
                'original_id' => $p->id_petugas,
                'nama' => $p->nama_petugas,
                'nip' => $p->NIP,
                'username' => $p->username,
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
            'nip' => 'required|string|unique:petugas,NIP,' . $id . ',id_petugas',
            'dinas' => 'required',
            'jabatan' => 'required|string|max:255',
            'telp' => 'nullable|string|max:20',
        ]);

        $p = Petugas::findOrFail($id);

        $dinasId = $request->dinas;
        if (is_string($dinasId) && str_starts_with($dinasId, 'DNS-')) {
            $dinasId = (int) str_replace('DNS-', '', $dinasId);
        } else {
            $dinasId = (int) $dinasId;
        }

        $jabatan = Jabatan::firstOrCreate(['nama_jabatan' => $request->jabatan]);

        $p->update([
            'nama_petugas' => $request->nama,
            'NIP' => $request->nip,
            'no_hp' => $request->telp,
            'id_dinas' => $dinasId,
            'id_jabatan' => $jabatan->id_jabatan,
        ]);

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => 'PTG-' . str_pad($p->id_petugas, 3, '0', STR_PAD_LEFT),
                'original_id' => $p->id_petugas,
                'nama' => $p->nama_petugas,
                'nip' => $p->NIP,
                'dinas' => 'DNS-' . str_pad($p->id_dinas, 3, '0', STR_PAD_LEFT),
                'original_dinas_id' => $p->id_dinas,
                'dinas_nama' => Dinas::find($p->id_dinas)?->nama_dinas ?? '-',
                'jabatan' => $jabatan->nama_jabatan,
                'telp' => $p->no_hp ?? '-',
                'status' => 'Aktif',
                'bebanKerja' => $p->beban_kerja ?? 0,
                'avatar' => $p->avatar,
            ]
        ]);
    }

    public function destroy($id)
    {
        $p = Petugas::findOrFail($id);
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

        $petugas = Petugas::where('username', $request->username)
            ->orWhere('NIP', $request->username)
            ->first();

        if ($petugas && \Illuminate\Support\Facades\Hash::check($request->password, $petugas->password)) {
            $dinas = Dinas::find($petugas->id_dinas);
            $jabatan = Jabatan::find($petugas->id_jabatan);

            return response()->json([
                'status' => 'success',
                'petugas' => [
                    'id' => 'PTG-' . str_pad($petugas->id_petugas, 3, '0', STR_PAD_LEFT),
                    'original_id' => $petugas->id_petugas,
                    'nama' => $petugas->nama_petugas,
                    'dinas' => $dinas ? $dinas->nama_dinas : 'Tidak ada dinas',
                    'jabatan' => $jabatan ? $jabatan->nama_jabatan : 'Staf',
                    'username' => $petugas->username,
                    'email' => $petugas->username . '@laporwarga.go.id',
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
            'nip' => 'required|string|unique:petugas,NIP,' . $id . ',id_petugas',
            'telp' => 'nullable|string|max:20',
            'avatar' => 'nullable|string',
        ]);

        $petugas = Petugas::findOrFail($id);

        $petugas->update([
            'nama_petugas' => $request->nama,
            'NIP' => $request->nip,
            'no_hp' => $request->telp,
            'avatar' => $request->avatar,
        ]);

        $dinas = Dinas::find($petugas->id_dinas);
        $jabatan = Jabatan::find($petugas->id_jabatan);

        return response()->json([
            'status' => 'success',
            'message' => 'Profil berhasil diperbarui',
            'petugas' => [
                'id' => 'PTG-' . str_pad($petugas->id_petugas, 3, '0', STR_PAD_LEFT),
                'original_id' => $petugas->id_petugas,
                'nama' => $petugas->nama_petugas,
                'dinas' => $dinas ? $dinas->nama_dinas : 'Tidak ada dinas',
                'jabatan' => $jabatan ? $jabatan->nama_jabatan : 'Staf',
                'username' => $petugas->username,
                'email' => $petugas->username . '@laporwarga.go.id',
                'telepon' => $petugas->no_hp ?? '-',
                'avatar' => $petugas->avatar,
            ]
        ]);
    }
}

