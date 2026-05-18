<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PengaduanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $pengaduans = \App\Models\Pengaduan::latest()->get();
        return response()->json($pengaduans);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'nullable|string|max:255',
            'nohp' => 'nullable|string|max:20',
            'anonim' => 'boolean',
            'judul' => 'required|string|max:255',
            'kategori' => 'required|string',
            'urgensi' => 'required|string',
            'lokasi' => 'required|string|max:255',
            'deskripsi' => 'required|string',
        ]);

        // Generate nomor tiket LPW-YYYY-XXXXXX
        $nomorTiket = 'LPW-' . date('Y') . '-' . str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
        
        // Ensure uniqueness (simple way)
        while (\App\Models\Pengaduan::where('nomor_tiket', $nomorTiket)->exists()) {
            $nomorTiket = 'LPW-' . date('Y') . '-' . str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
        }

        $validated['nomor_tiket'] = $nomorTiket;
        $validated['status'] = 'Laporan Diterima';
        
        $validated['timeline'] = [
            [
                'tanggal' => now()->format('d M Y, H:i'),
                'status' => 'Laporan Diterima',
                'keterangan' => 'Laporan Anda telah berhasil diterima dan sedang menunggu verifikasi.',
                'icon' => 'check_circle',
                'color' => 'text-green-500'
            ]
        ];

        $pengaduan = \App\Models\Pengaduan::create($validated);

        return response()->json([
            'message' => 'Pengaduan berhasil dibuat',
            'data' => $pengaduan
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $nomorTiket)
    {
        $pengaduan = \App\Models\Pengaduan::where('nomor_tiket', $nomorTiket)->first();

        if (!$pengaduan) {
            return response()->json(['message' => 'Pengaduan tidak ditemukan'], 404);
        }

        // Add dummy color formatting for frontend compatibility
        $statusColors = [
            'Laporan Diterima' => 'bg-green-100 text-green-800 border-green-200',
            'Verifikasi' => 'bg-blue-100 text-blue-800 border-blue-200',
            'Sedang Diproses' => 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Selesai' => 'bg-green-100 text-green-800 border-green-200',
        ];
        
        $pengaduan->statusColor = $statusColors[$pengaduan->status] ?? 'bg-slate-100 text-slate-800 border-slate-200';
        $pengaduan->tanggalDibuat = $pengaduan->created_at->format('d M Y');
        $pengaduan->prioritas = ucfirst($pengaduan->urgensi);
        // frontend uses nomorTiket, so map it
        $pengaduan->nomorTiket = $pengaduan->nomor_tiket;

        return response()->json($pengaduan);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $nomorTiket)
    {
        $pengaduan = \App\Models\Pengaduan::where('nomor_tiket', $nomorTiket)->first();

        if (!$pengaduan) {
            return response()->json(['message' => 'Pengaduan tidak ditemukan'], 404);
        }

        $request->validate([
            'status' => 'required|string',
            'keterangan' => 'nullable|string'
        ]);

        $pengaduan->status = $request->status;

        $timeline = $pengaduan->timeline ?? [];
        
        $icon = 'info';
        $color = 'text-blue-500';
        if ($request->status === 'Verifikasi') {
            $icon = 'verified'; $color = 'text-blue-500';
        } elseif ($request->status === 'Sedang Diproses' || $request->status === 'Diproses') {
            $icon = 'engineering'; $color = 'text-yellow-500';
            $pengaduan->status = 'Sedang Diproses';
        } elseif ($request->status === 'Selesai') {
            $icon = 'task_alt'; $color = 'text-green-500';
        } elseif ($request->status === 'Ditolak') {
            $icon = 'cancel'; $color = 'text-red-500';
        }

        $timeline[] = [
            'tanggal' => now()->format('d M Y, H:i'),
            'status' => $pengaduan->status,
            'keterangan' => $request->keterangan ?? 'Status diperbarui menjadi ' . $pengaduan->status,
            'icon' => $icon,
            'color' => $color
        ];

        $pengaduan->timeline = $timeline;
        $pengaduan->save();

        return response()->json(['message' => 'Status berhasil diperbarui', 'data' => $pengaduan]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $nomorTiket)
    {
        $pengaduan = \App\Models\Pengaduan::where('nomor_tiket', $nomorTiket)->first();

        if (!$pengaduan) {
            return response()->json(['message' => 'Pengaduan tidak ditemukan'], 404);
        }

        $pengaduan->delete();

        return response()->json(['message' => 'Pengaduan berhasil dihapus']);
    }
}
