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

        $username = strtolower(str_replace(' ', '_', $request->nama)) . mt_rand(10, 99);
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
                'dinas' => 'DNS-' . str_pad($p->id_dinas, 3, '0', STR_PAD_LEFT),
                'original_dinas_id' => $p->id_dinas,
                'dinas_nama' => Dinas::find($p->id_dinas)?->nama_dinas ?? '-',
                'jabatan' => $jabatan->nama_jabatan,
                'telp' => $p->no_hp ?? '-',
                'status' => 'Aktif',
                'bebanKerja' => 0,
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
}
