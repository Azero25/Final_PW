<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dinas;
use App\Models\Petugas;
use App\Models\Laporan;
use Illuminate\Http\Request;

class DinasController extends Controller
{
    public function index()
    {
        $dinas = Dinas::all()->map(function($d) {
            // Count total officers in this dinas
            $totalPetugas = Petugas::where('id_dinas', $d->id_dinas)->count();

            // Count total reports handled by categories related to this dinas
            $katIds = \App\Models\Kategori::where('id_dinas', $d->id_dinas)->pluck('id_kategori');
            $totalLaporan = Laporan::whereIn('id_kategori', $katIds)->count();

            $colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500', 'bg-teal-500'];
            $idx = $d->id_dinas % count($colors);

            return [
                'id' => 'DNS-' . str_pad($d->id_dinas, 3, '0', STR_PAD_LEFT),
                'original_id' => $d->id_dinas,
                'nama' => $d->nama_dinas,
                'singkatan' => $d->singkatan ?? strtoupper(substr($d->nama_dinas, 0, 3)),
                'kategori' => \App\Models\Kategori::where('id_dinas', $d->id_dinas)->first()?->nama_kategori ?? 'Umum',
                'totalPetugas' => $totalPetugas,
                'totalLaporan' => $totalLaporan,
                'color' => $colors[$idx],
            ];
        });

        return response()->json($dinas);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'singkatan' => 'required|string|max:20',
            'kategori' => 'nullable|string|max:255',
        ]);

        $d = Dinas::create([
            'nama_dinas' => $request->nama,
            'singkatan' => $request->singkatan,
        ]);

        if ($request->kategori) {
            \App\Models\Kategori::firstOrCreate(
                ['nama_kategori' => $request->kategori],
                ['id_dinas' => $d->id_dinas]
            );
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => 'DNS-' . str_pad($d->id_dinas, 3, '0', STR_PAD_LEFT),
                'original_id' => $d->id_dinas,
                'nama' => $d->nama_dinas,
                'singkatan' => $d->singkatan,
                'kategori' => $request->kategori ?? 'Umum',
                'totalPetugas' => 0,
                'totalLaporan' => 0,
                'color' => 'bg-blue-500',
            ]
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'singkatan' => 'required|string|max:20',
        ]);

        $d = Dinas::findOrFail($id);
        $d->update([
            'nama_dinas' => $request->nama,
            'singkatan' => $request->singkatan,
        ]);

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => 'DNS-' . str_pad($d->id_dinas, 3, '0', STR_PAD_LEFT),
                'original_id' => $d->id_dinas,
                'nama' => $d->nama_dinas,
                'singkatan' => $d->singkatan,
                'kategori' => \App\Models\Kategori::where('id_dinas', $d->id_dinas)->first()?->nama_kategori ?? 'Umum',
                'totalPetugas' => Petugas::where('id_dinas', $d->id_dinas)->count(),
                'totalLaporan' => 0,
                'color' => 'bg-blue-500',
            ]
        ]);
    }

    public function destroy($id)
    {
        $d = Dinas::findOrFail($id);
        $d->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Dinas berhasil dihapus'
        ]);
    }
}
