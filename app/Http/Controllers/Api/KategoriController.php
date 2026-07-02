<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kategori;
use App\Models\Dinas;
use App\Models\Laporan;
use Illuminate\Http\Request;

class KategoriController extends Controller
{
    public function index()
    {
        $kategoris = Kategori::with('dinas')->get()->map(function($k) {
            $totalLaporan = Laporan::where('id_kategori', $k->id_kategori)->count();

            $totalLaporan = Laporan::where('id_kategori', $k->id_kategori)->count();

            return [
                'id' => 'KAT-' . str_pad($k->id_kategori, 3, '0', STR_PAD_LEFT),
                'original_id' => $k->id_kategori,
                'nama' => $k->nama_kategori,
                'deskripsi' => $k->deskripsi ?? '',
                'icon' => $k->icon,
                'warna' => $k->warna_kategori,
                'aktif' => (bool)($k->aktif ?? true),
                'totalLaporan' => $totalLaporan,
                // Mengembalikan array nama dinas agar sesuai dengan kebutuhan React filtered.map()
                'dinas' => $k->dinas->pluck('nama_dinas')->toArray(),
                // Mengembalikan data detail dinas (id & nama) jika React membutuhkan id untuk state edit
                'dinas_detail' => $k->dinas->map(function($d) {
                    return [
                        'id_dinas' => $d->id_dinas,
                        'nama_dinas' => $d->nama_dinas,
                        'singkatan' => $d->singkatan
                    ];
                })
            ];
        });

        return response()->json($kategoris);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'icon' => 'required|string|max:50',
            'warna' => 'required|string|max:50',
            'aktif' => 'required|boolean',
            'dinas' => 'nullable|array',
            'dinas.*' => 'integer|exists:dinas,id_dinas',
        ]);

        $k = Kategori::create([
            'nama_kategori' => $request->nama,
            'desc_kategori' => $request->deskripsi,
            'icon' => $request->icon,
            'warna_kategori' => $request->warna,
            'aktif' => $request->aktif,
        ]);

        if ($request->has('dinas')) {
            $k->dinas()->sync($request->dinas);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => 'KAT-' . str_pad($k->id_kategori, 3, '0', STR_PAD_LEFT),
                'original_id' => $k->id_kategori,
                'nama' => $k->nama_kategori,
                'deskripsi' => $k->desc_kategori ?? '',
                'icon' => $k->icon,
                'warna' => $k->warna_kategori,
                'aktif' => (bool)$k->aktif,
                'totalLaporan' => 0,
                'dinas' => $k->dinas()->pluck('nama_dinas')->toArray()
            ]
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'icon' => 'required|string|max:50',
            'warna' => 'required|string|max:50',
            'aktif' => 'required|boolean',
            'dinas' => 'nullable|array',
            'dinas.*' => 'integer|exists:dinas,id_dinas',
        ]);

        $k = Kategori::findOrFail($id);

        $k->update([
            'nama_kategori' => $request->nama,
            'desc_kategori' => $request->deskripsi,
            'icon' => $request->icon,
            'warna_kategori' => $request->warna,
            'aktif' => $request->aktif,
        ]);

        if ($request->has('dinas')) {
            $k->dinas()->sync($request->dinas);
        }

        $totalLaporan = Laporan::where('id_kategori', $k->id_kategori)->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => 'KAT-' . str_pad($k->id_kategori, 3, '0', STR_PAD_LEFT),
                'original_id' => $k->id_kategori,
                'nama' => $k->nama_kategori,
                'deskripsi' => $k->desc_kategori ?? '',
                'icon' => $k->icon,
                'warna' => $k->warna_kategori,
                'aktif' => (bool)$k->aktif,
                'totalLaporan' => $totalLaporan,
                'dinas' => $k->dinas()->pluck('nama_dinas')->toArray()
            ]
        ]);
    }

    public function destroy($id)
    {
        $k = Kategori::find($id);
        if (!$k) {
            return response()->json(['message' => 'Kategori tidak ditemukan'], 404);
        }

        $k->dinas()->detach();

        $k->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Kategori berhasil dihapus'
        ]);
    }
}
