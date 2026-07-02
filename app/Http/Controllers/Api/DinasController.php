<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dinas;
use App\Models\User;
use App\Models\Laporan;
use Illuminate\Http\Request;
use App\Models\Kategori;

class DinasController extends Controller
{
    public function index()
    {
        // Ambil dinas beserta kategorinya untuk menghindari N+1 query
        $dinas = Dinas::with('kategoris')->get()->map(function($d) {
            $totalPetugas = User::where('id_dinas', $d->id_dinas)->where('role', 'petugas')->count();

            $katIds = $d->kategoris->pluck('id_kategori');
            $totalLaporan = Laporan::whereIn('id_kategori', $katIds)->count();

            return [
                'id' => 'DNS-' . str_pad($d->id_dinas, 3, '0', STR_PAD_LEFT),
                'original_id' => $d->id_dinas,
                'nama' => $d->nama_dinas,
                'singkatan' => $d->singkatan ?? strtoupper(substr($d->nama_dinas, 0, 3)),
                'kategori_ids' => $katIds->toArray(),
                // Mengembalikan daftar objek kategori (id dan nama) untuk mempermudah frontend
                'kategoris' => $d->kategoris->map(function($k) {
                    return [
                        'id_kategori' => $k->id_kategori,
                        'nama_kategori' => $k->nama_kategori,
                    ];
                }),
                'totalPetugas' => $totalPetugas,
                'totalLaporan' => $totalLaporan,
                'color' => $d->warna_dinas,
            ];
        });

        return response()->json($dinas);
    }

    public function store(Request $request)
    {
        if ($request->has('kategoris') && is_array($request->kategoris)) {
            $request->merge([
                'kategoris' => array_map('intval', $request->kategoris)
            ]);
        }

        $request->validate([
            'nama' => 'required|string|max:255',
            'singkatan' => 'required|string|max:20',
            'kategoris' => 'nullable|array',
            'kategoris.*' => 'integer|exists:kategoris,id_kategori',
            'color' => 'nullable|string|max:50',
        ]);

        $d = Dinas::create([
            'nama_dinas' => $request->nama,
            'singkatan' => $request->singkatan,
            'warna_dinas' => $request->color ?? 'bg-slate-600',
        ]);

        if ($request->has('kategoris')) {
            $d->kategoris()->sync($request->kategoris);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Dinas berhasil ditambahkan',
            'data' => $d->load('kategoris')
        ]);
    }

    public function update(Request $request, $id)
    {
        if ($request->has('kategoris') && is_array($request->kategoris)) {
            $request->merge([
                'kategoris' => array_map('intval', $request->kategoris)
            ]);
        }

        $request->validate([
            'nama' => 'required|string|max:255',
            'singkatan' => 'required|string|max:20',
            'kategoris' => 'nullable|array',
            'kategoris.*' => 'integer|exists:kategoris,id_kategori',
            'color' => 'nullable|string|max:50',
        ]);

        $d = Dinas::findOrFail($id);
        $d->update([
            'nama_dinas' => $request->nama,
            'singkatan' => $request->singkatan,
            'warna_dinas' => $request->color ?? $d->warna_dinas,
        ]);

        if ($request->has('kategoris')) {
            $d->kategoris()->sync($request->kategoris);
        } else {
            $d->kategoris()->sync([]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Dinas berhasil diperbarui',
            'data' => $d->load('kategoris')
        ]);
    }

    public function destroy($id)
    {
        $d = Dinas::findOrFail($id);

        // Break all relationship on pivot table before delete
        $d->kategoris()->detach();
        $d->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Dinas berhasil dihapus'
        ]);
    }
}
