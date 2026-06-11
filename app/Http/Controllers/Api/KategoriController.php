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
        $kategoris = Kategori::all()->map(function($k) {
            $totalLaporan = Laporan::where('id_kategori', $k->id_kategori)->count();
            
            // Resolve Dinas
            $dinasObj = Dinas::find($k->id_dinas);
            $dinasName = $dinasObj ? ($dinasObj->singkatan ?? $dinasObj->nama_dinas) : 'Tidak Ada';

            return [
                'id' => 'KAT-' . str_pad($k->id_kategori, 3, '0', STR_PAD_LEFT),
                'original_id' => $k->id_kategori,
                'nama' => ucfirst($k->nama_kategori),
                'icon' => $k->icon ?? 'construction',
                'warna' => $k->warna ?? 'bg-blue-500',
                'dinas' => $dinasName,
                'id_dinas' => $k->id_dinas,
                'totalLaporan' => $totalLaporan,
                'aktif' => (bool) $k->aktif,
                'deskripsi' => $k->desc_kategori ?? '',
            ];
        });

        return response()->json($kategoris);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'dinas' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'icon' => 'nullable|string',
            'warna' => 'nullable|string',
            'aktif' => 'nullable|boolean',
        ]);

        // Resolve dinas
        $dinas = Dinas::where('singkatan', $request->dinas)
            ->orWhere('nama_dinas', $request->dinas)
            ->first();

        if (!$dinas) {
            $dinas = Dinas::create([
                'nama_dinas' => $request->dinas,
                'singkatan' => $request->dinas,
            ]);
        }

        $k = Kategori::create([
            'nama_kategori' => strtolower($request->nama),
            'desc_kategori' => $request->deskripsi,
            'id_dinas' => $dinas->id_dinas,
            'icon' => $request->icon ?? 'construction',
            'warna' => $request->warna ?? 'bg-blue-500',
            'aktif' => filter_var($request->aktif ?? true, FILTER_VALIDATE_BOOLEAN),
        ]);

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => 'KAT-' . str_pad($k->id_kategori, 3, '0', STR_PAD_LEFT),
                'original_id' => $k->id_kategori,
                'nama' => ucfirst($k->nama_kategori),
                'icon' => $k->icon,
                'warna' => $k->warna,
                'dinas' => $dinas->singkatan ?? $dinas->nama_dinas,
                'id_dinas' => $k->id_dinas,
                'totalLaporan' => 0,
                'aktif' => (bool) $k->aktif,
                'deskripsi' => $k->desc_kategori ?? '',
            ]
        ]);
    }

    public function update(Request $request, $id)
    {
        $k = Kategori::find($id);
        if (!$k) {
            return response()->json(['message' => 'Kategori tidak ditemukan'], 404);
        }

        $request->validate([
            'nama' => 'required|string|max:255',
            'dinas' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'icon' => 'nullable|string',
            'warna' => 'nullable|string',
            'aktif' => 'nullable|boolean',
        ]);

        // Resolve dinas
        $dinas = Dinas::where('singkatan', $request->dinas)
            ->orWhere('nama_dinas', $request->dinas)
            ->first();

        if (!$dinas) {
            $dinas = Dinas::create([
                'nama_dinas' => $request->dinas,
                'singkatan' => $request->dinas,
            ]);
        }

        $k->update([
            'nama_kategori' => strtolower($request->nama),
            'desc_kategori' => $request->deskripsi,
            'id_dinas' => $dinas->id_dinas,
            'icon' => $request->icon ?? $k->icon,
            'warna' => $request->warna ?? $k->warna,
            'aktif' => filter_var($request->aktif ?? $k->aktif, FILTER_VALIDATE_BOOLEAN),
        ]);

        $totalLaporan = Laporan::where('id_kategori', $k->id_kategori)->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => 'KAT-' . str_pad($k->id_kategori, 3, '0', STR_PAD_LEFT),
                'original_id' => $k->id_kategori,
                'nama' => ucfirst($k->nama_kategori),
                'icon' => $k->icon,
                'warna' => $k->warna,
                'dinas' => $dinas->singkatan ?? $dinas->nama_dinas,
                'id_dinas' => $k->id_dinas,
                'totalLaporan' => $totalLaporan,
                'aktif' => (bool) $k->aktif,
                'deskripsi' => $k->desc_kategori ?? '',
            ]
        ]);
    }

    public function destroy($id)
    {
        $k = Kategori::find($id);
        if (!$k) {
            return response()->json(['message' => 'Kategori tidak ditemukan'], 404);
        }

        $k->delete();

        return response()->json(['status' => 'success', 'message' => 'Kategori berhasil dihapus']);
    }
}
