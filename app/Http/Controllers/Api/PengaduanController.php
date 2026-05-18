<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Laporan;
use App\Models\Kategori;
use App\Models\Kelurahan;
use App\Models\User;

class PengaduanController extends Controller
{
    private function buildLogEntry(string $status): array {
        $meta = [
            'Laporan Diterima' => ['keterangan' => 'Laporan Anda telah berhasil diterima dan sedang menunggu verifikasi.', 'icon' => 'check_circle', 'color' => 'text-green-500'],
            'Verifikasi'       => ['keterangan' => 'Laporan sedang diverifikasi oleh admin.', 'icon' => 'verified', 'color' => 'text-blue-500'],
            'Sedang Diproses'  => ['keterangan' => 'Laporan sedang ditangani oleh petugas di lapangan.', 'icon' => 'engineering', 'color' => 'text-yellow-500'],
            'Selesai'          => ['keterangan' => 'Laporan telah selesai ditangani.', 'icon' => 'task_alt', 'color' => 'text-green-500'],
            'Ditolak'          => ['keterangan' => 'Laporan ditolak. Tidak memenuhi kriteria pengaduan.', 'icon' => 'cancel', 'color' => 'text-red-500'],
        ];
        $m = $meta[$status] ?? ['keterangan' => $status, 'icon' => 'info', 'color' => 'text-slate-500'];
        return [
            'tanggal'   => now()->format('d M Y, H:i'),
            'status'    => $status,
            'keterangan'=> $m['keterangan'],
            'icon'      => $m['icon'],
            'color'     => $m['color'],
        ];
    }

    private function generateTimeline($laporan): array {
        // Jika ada log nyata, gunakan itu
        if (!empty($laporan->timeline_log) && is_array($laporan->timeline_log)) {
            return $laporan->timeline_log;
        }
        // Fallback untuk data lama yang belum punya log: bangun dari status saat ini
        $log = [$this->buildLogEntry('Laporan Diterima')];
        // Koreksi waktu ke created_at yang sebenarnya
        $log[0]['tanggal'] = \Carbon\Carbon::parse($laporan->created_at)->format('d M Y, H:i');

        $current = $laporan->status_laporan;
        if (in_array($current, ['Verifikasi', 'Sedang Diproses', 'Selesai', 'Ditolak']) && $current !== 'Laporan Diterima') {
            $entry = $this->buildLogEntry($current === 'Sedang Diproses' || $current === 'Selesai' || $current === 'Ditolak' ? 'Verifikasi' : $current);
            $log[] = $entry;
        }
        if (in_array($current, ['Sedang Diproses', 'Selesai'])) {
            $log[] = $this->buildLogEntry('Sedang Diproses');
        }
        if ($current === 'Selesai') {
            $entry = $this->buildLogEntry('Selesai');
            $entry['tanggal'] = \Carbon\Carbon::parse($laporan->updated_at)->format('d M Y, H:i');
            $log[] = $entry;
        }
        if ($current === 'Ditolak') {
            $entry = $this->buildLogEntry('Ditolak');
            $entry['tanggal'] = \Carbon\Carbon::parse($laporan->updated_at)->format('d M Y, H:i');
            $log[] = $entry;
        }
        return $log;
    }

    /**
     * Map dari Laporan (Backend ERD) ke format JSON Pengaduan (Frontend yang lama)
     */
    private function mapToFrontend($laporan) {
        $statusColors = [
            'Laporan Diterima' => 'bg-green-100 text-green-800 border-green-200',
            'Verifikasi' => 'bg-blue-100 text-blue-800 border-blue-200',
            'Sedang Diproses' => 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Selesai' => 'bg-green-100 text-green-800 border-green-200',
            'Ditolak' => 'bg-red-100 text-red-800 border-red-200',
        ];

        $kategoriName = Kategori::find($laporan->id_kategori)?->nama_kategori ?? 'Umum';
        $kelurahanName = Kelurahan::find($laporan->id_kelurahan)?->nama_kelurahan ?? 'Tidak Diketahui';
        $userName = User::find($laporan->id_user)?->nama_lengkap ?? 'Anonim';
        $userHp = User::find($laporan->id_user)?->no_hp ?? '-';

        return [
            'id' => $laporan->no_ticket, // frontend might need id
            'nomor_tiket' => $laporan->no_ticket,
            'nama' => $userName,
            'nohp' => $userHp,
            'anonim' => false,
            'judul' => $laporan->judul_laporan,
            'kategori' => $kategoriName,
            'urgensi' => strtolower($laporan->prioritas),
            'lokasi' => $kelurahanName,
            'deskripsi' => $laporan->isi_laporan,
            'status' => $laporan->status_laporan,
            'timeline' => $this->generateTimeline($laporan),
            'created_at' => $laporan->created_at,
            'updated_at' => $laporan->updated_at,
            'statusColor' => $statusColors[$laporan->status_laporan] ?? 'bg-slate-100 text-slate-800 border-slate-200',
            'tanggalDibuat' => \Carbon\Carbon::parse($laporan->tanggal_laporan)->format('d M Y'),
            'prioritas' => ucfirst($laporan->prioritas),
            'nomorTiket' => $laporan->no_ticket,
        ];
    }

    public function index()
    {
        $laporans = Laporan::latest()->get();
        $mapped = $laporans->map(function($laporan) {
            return $this->mapToFrontend($laporan);
        });
        return response()->json($mapped);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'nullable|string|max:255',
            'nohp' => 'nullable|string|max:20',
            'anonim' => 'boolean',
            'judul' => 'required|string|max:255',
            'kategori' => 'required|string',
            'urgensi' => 'required|string',
            'lokasi' => 'required|string|max:255',
            'deskripsi' => 'required|string',
        ]);

        $nomorTiket = 'LPW-' . date('Y') . '-' . str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
        while (Laporan::where('no_ticket', $nomorTiket)->exists()) {
            $nomorTiket = 'LPW-' . date('Y') . '-' . str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
        }

        // Auto Create Hierarchy for Kategori
        $dinas = \App\Models\Dinas::firstOrCreate(['nama_dinas' => 'Dinas Umum Pusat']);
        $kategori = Kategori::firstOrCreate(
            ['nama_kategori' => $request->kategori],
            ['id_dinas' => $dinas->id_dinas]
        );

        // Auto Create Hierarchy for Kelurahan
        $provinsi = \App\Models\Provinsi::firstOrCreate(['nama_provinsi' => 'Provinsi Kalimantan Selatan']);
        $kecamatanDb = \App\Models\Kecamatan::firstOrCreate(
            ['nama_kecamatan' => 'Kecamatan Default'],
            ['id_provinsi' => $provinsi->id_provinsi]
        );
        $kelurahan = Kelurahan::firstOrCreate(
            ['nama_kelurahan' => $request->lokasi],
            ['id_kecamatan' => $kecamatanDb->id_kecamatan]
        );

        $userId = null;
        if (auth()->check()) {
            $userId = auth()->id();
        } else {
            if ($request->nama) {
                $user = User::firstOrCreate(
                    ['nama_lengkap' => $request->nama],
                    ['email' => uniqid().'@dummy.com', 'password' => bcrypt('dummy'), 'no_hp' => $request->nohp]
                );
                $userId = $user->id_user;
            }
        }

        $prioritasMap = [
            'rendah' => 'Rendah',
            'sedang' => 'Sedang',
            'tinggi' => 'Tinggi'
        ];
        $prioritas = $prioritasMap[strtolower($request->urgensi)] ?? 'Sedang';

        $initialLog = [$this->buildLogEntry('Laporan Diterima')];

        $laporan = Laporan::create([
            'no_ticket'     => $nomorTiket,
            'judul_laporan' => $request->judul,
            'id_kategori'   => $kategori->id_kategori,
            'id_kelurahan'  => $kelurahan->id_kelurahan,
            'id_user'       => $userId,
            'prioritas'     => $prioritas,
            'status_laporan'=> 'Laporan Diterima',
            'isi_laporan'   => $request->deskripsi,
            'tanggal_laporan' => now(),
            'timeline_log'  => $initialLog,
        ]);

        return response()->json([
            'message' => 'Pengaduan berhasil dibuat',
            'data' => $this->mapToFrontend($laporan)
        ], 201);
    }

    public function show(string $nomorTiket)
    {
        $laporan = Laporan::where('no_ticket', $nomorTiket)->first();

        if (!$laporan) {
            return response()->json(['message' => 'Pengaduan tidak ditemukan'], 404);
        }

        return response()->json($this->mapToFrontend($laporan));
    }

    public function update(Request $request, string $nomorTiket)
    {
        $laporan = Laporan::where('no_ticket', $nomorTiket)->first();

        if (!$laporan) {
            return response()->json(['message' => 'Pengaduan tidak ditemukan'], 404);
        }

        $request->validate([
            'status' => 'required|string',
            'keterangan' => 'nullable|string'
        ]);

        $statusToEnum = [
            'Laporan Diterima' => 'Laporan Diterima',
            'Verifikasi' => 'Verifikasi',
            'Sedang Diproses' => 'Sedang Diproses',
            'Diproses' => 'Sedang Diproses',
            'Selesai' => 'Selesai',
            'Ditolak' => 'Ditolak',
        ];

        $newStatus = $statusToEnum[$request->status] ?? 'Sedang Diproses';
        $laporan->status_laporan = $newStatus;

        // Tambahkan entri log dengan waktu nyata
        $log = $laporan->timeline_log ?? [];
        $log[] = $this->buildLogEntry($newStatus);
        $laporan->timeline_log = $log;

        $laporan->save();

        return response()->json([
            'message' => 'Status berhasil diperbarui', 
            'data' => $this->mapToFrontend($laporan)
        ]);
    }

    public function destroy(string $nomorTiket)
    {
        $laporan = Laporan::where('no_ticket', $nomorTiket)->first();

        if (!$laporan) {
            return response()->json(['message' => 'Pengaduan tidak ditemukan'], 404);
        }

        $laporan->delete();

        return response()->json(['message' => 'Pengaduan berhasil dihapus']);
    }
}
