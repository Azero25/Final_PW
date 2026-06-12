<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Laporan;
use App\Models\Kategori;
use App\Models\Kelurahan;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Support\Facades\Storage;

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

        $kategoriObj = Kategori::find($laporan->id_kategori);
        $kategoriName = $kategoriObj?->nama_kategori ?? 'Umum';
        $dinasName = $kategoriObj && $kategoriObj->id_dinas ? (\App\Models\Dinas::find($kategoriObj->id_dinas)?->nama_dinas ?? '-') : '-';
        $dinasId = $kategoriObj ? $kategoriObj->id_dinas : null;

        $petugas = $laporan->id_petugas ? \App\Models\Petugas::find($laporan->id_petugas) : null;
        $petugasName = $petugas ? $petugas->nama_petugas : '-';
        $petugasId = $petugas ? $petugas->id_petugas : null;

        $kelurahanName = Kelurahan::find($laporan->id_kelurahan)?->nama_kelurahan ?? 'Tidak Diketahui';
        $userName = User::find($laporan->id_user)?->nama_lengkap ?? 'Anonim';
        $userHp = User::find($laporan->id_user)?->no_hp ?? '-';

        $decodedGambar = is_string($laporan->bukti_foto) && str_starts_with($laporan->bukti_foto, '[') ? json_decode($laporan->bukti_foto, true) : null;

        return [
            'id' => $laporan->no_ticket,
            'nomor_tiket' => $laporan->no_ticket,
            'nama' => $userName,
            'nohp' => $userHp,
            'anonim' => false,
            'judul' => $laporan->judul_laporan,
            'kategori' => $kategoriName,
            'id_kategori' => $laporan->id_kategori,
            'id_dinas' => $dinasId,
            'nama_dinas' => $dinasName,
            'id_petugas' => $petugasId,
            'nama_petugas' => $petugasName,
            'urgensi' => strtolower($laporan->prioritas),
            'lokasi' => $kelurahanName,
            'deskripsi' => $laporan->isi_laporan,
            'bukti_foto' => $decodedGambar ? ($decodedGambar[0] ?? null) : $laporan->bukti_foto,
            'gambar' => $decodedGambar ? $decodedGambar : ($laporan->bukti_foto ? [$laporan->bukti_foto] : []),
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

    public function index(Request $request)
    {
        $query = Laporan::latest();
        
        if ($request->has('judul')) {
            $query->where('judul_laporan', 'LIKE', '%' . $request->judul . '%');
        }

        $laporans = $query->get();
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
            'bukti_foto' => 'nullable|string', // Accept base64 string
            'gambar' => 'nullable|array|max:5',
            'gambar.*' => 'file|max:10240',
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

        // Decode base64 image and save as .webp in storage folder
        $savedImages = [];

        if ($request->bukti_foto) {
            if (preg_match('/^data:image\/(\w+);base64,/', $request->bukti_foto, $type)) {
                $data = substr($request->bukti_foto, strpos($request->bukti_foto, ',') + 1);
                $data = base64_decode($data);
                if ($data !== false) {
                    $fileName = 'bukti_' . time() . '_' . mt_rand(1000, 9999) . '.webp';
                    Storage::disk('public')->put('uploads/bukti/' . $fileName, $data);
                    $savedImages[] = '/storage/uploads/bukti/' . $fileName;
                }
            }
        }

        // Process uploaded files from multipart form data and save to storage folder
        if ($request->hasFile('gambar')) {
            foreach ($request->file('gambar') as $file) {
                $ext = $file->getClientOriginalExtension() ?: 'webp';
                $fileName = 'bukti_' . time() . '_' . mt_rand(1000, 9999) . '.' . $ext;
                $file->storeAs('uploads/bukti', $fileName, 'public');
                $savedImages[] = '/storage/uploads/bukti/' . $fileName;
            }
        }

        $finalBukti = null;
        if (count($savedImages) > 0) {
            if (count($savedImages) === 1) {
                $finalBukti = $savedImages[0];
            } else {
                $finalBukti = json_encode(array_slice($savedImages, 0, 5));
            }
        }

        $laporan = Laporan::create([
            'no_ticket'     => $nomorTiket,
            'judul_laporan' => $request->judul,
            'id_kategori'   => $kategori->id_kategori,
            'id_kelurahan'  => $kelurahan->id_kelurahan,
            'id_user'       => $userId,
            'prioritas'     => $prioritas,
            'status_laporan'=> 'Laporan Diterima',
            'isi_laporan'   => $request->deskripsi,
            'bukti_foto'    => $finalBukti, // Save WebP image paths
            'tanggal_laporan' => now(),
            'timeline_log'  => $initialLog,
        ]);

        // Create Notification
        $pelaporName = 'Anonim';
        if (!$request->anonim && $userId) {
            $pelaporName = User::find($userId)?->nama_lengkap ?? 'Warga';
        }

        Notification::create([
            'judul' => 'Laporan baru masuk',
            'isi' => "{$nomorTiket}: {$request->judul} telah dilaporkan oleh {$pelaporName}.",
            'tipe' => $prioritas === 'Tinggi' ? 'darurat' : 'laporan',
            'target_id' => $nomorTiket,
            'dibaca' => false,
            'target_role' => 'admin',
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

        // Create Notification for status update
        // Create Notification for warga
        if ($laporan->id_user) {
            Notification::create([
                'judul' => 'Status laporan diperbarui',
                'isi' => "Status laporan Anda ({$nomorTiket}) telah diubah menjadi \"{$newStatus}\".",
                'tipe' => 'update',
                'target_id' => $nomorTiket,
                'dibaca' => false,
                'target_role' => 'warga',
                'id_user' => $laporan->id_user,
            ]);
        }

        // Create Notification for petugas if assigned
        if ($laporan->id_petugas) {
            Notification::create([
                'judul' => 'Status laporan diperbarui',
                'isi' => "Status laporan {$nomorTiket} yang ditugaskan kepada Anda telah diubah menjadi \"{$newStatus}\".",
                'tipe' => 'update',
                'target_id' => $nomorTiket,
                'dibaca' => false,
                'target_role' => 'petugas',
                'id_petugas' => $laporan->id_petugas,
            ]);
        }

        // Create Notification for admin
        Notification::create([
            'judul' => 'Status laporan diperbarui',
            'isi' => "Status laporan {$nomorTiket} telah diubah menjadi \"{$newStatus}\".",
            'tipe' => 'update',
            'target_id' => $nomorTiket,
            'dibaca' => false,
            'target_role' => 'admin',
        ]);

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

        // Delete associated files from storage
        if ($laporan->bukti_foto) {
            $decoded = json_decode($laporan->bukti_foto, true);
            $filesToDelete = is_array($decoded) ? $decoded : [$laporan->bukti_foto];

            foreach ($filesToDelete as $fileUrl) {
                $diskPath = $fileUrl;
                if (str_starts_with($fileUrl, '/storage/')) {
                    $diskPath = substr($fileUrl, 9); // Strip "/storage/"
                }

                if (Storage::disk('public')->exists($diskPath)) {
                    Storage::disk('public')->delete($diskPath);
                }
            }
        }

        $laporan->delete();

        return response()->json(['message' => 'Pengaduan berhasil dihapus']);
    }

    public function getEligiblePetugas(string $nomorTiket)
    {
        $laporan = Laporan::where('no_ticket', $nomorTiket)->first();
        if (!$laporan) {
            return response()->json(['message' => 'Pengaduan tidak ditemukan'], 404);
        }

        $kategori = Kategori::find($laporan->id_kategori);
        if (!$kategori || !$kategori->id_dinas) {
            return response()->json([], 200); // Return empty array if category or dinas is not found
        }

        $petugas = \App\Models\Petugas::where('id_dinas', $kategori->id_dinas)->get();

        return response()->json($petugas);
    }

    public function assignPetugas(Request $request, string $nomorTiket)
    {
        $laporan = Laporan::where('no_ticket', $nomorTiket)->first();
        if (!$laporan) {
            return response()->json(['message' => 'Pengaduan tidak ditemukan'], 404);
        }

        $request->validate([
            'id_petugas' => 'required|exists:petugas,id_petugas'
        ]);

        $petugas = \App\Models\Petugas::findOrFail($request->id_petugas);
        
        $laporan->id_petugas = $petugas->id_petugas;
        $laporan->status_laporan = 'Sedang Diproses';

        $log = $laporan->timeline_log ?? [];
        $log[] = [
            'tanggal'   => now()->format('d M Y, H:i'),
            'status'    => 'Sedang Diproses',
            'keterangan'=> 'Laporan telah ditugaskan kepada petugas: ' . $petugas->nama_petugas,
            'icon'      => 'engineering',
            'color'     => 'text-yellow-500',
        ];
        $laporan->timeline_log = $log;

        $laporan->save();

        // Create Notification for petugas
        Notification::create([
            'judul' => 'Tugas baru ditugaskan',
            'isi' => "Laporan {$nomorTiket} telah ditugaskan kepada Anda.",
            'tipe' => 'update',
            'target_id' => $nomorTiket,
            'dibaca' => false,
            'target_role' => 'petugas',
            'id_petugas' => $petugas->id_petugas,
        ]);

        // Create Notification for warga
        if ($laporan->id_user) {
            Notification::create([
                'judul' => 'Petugas ditugaskan',
                'isi' => "Laporan Anda ({$nomorTiket}) telah ditugaskan kepada petugas {$petugas->nama_petugas}.",
                'tipe' => 'update',
                'target_id' => $nomorTiket,
                'dibaca' => false,
                'target_role' => 'warga',
                'id_user' => $laporan->id_user,
            ]);
        }

        // Create Notification for admin
        Notification::create([
            'judul' => 'Petugas ditugaskan',
            'isi' => "Laporan {$nomorTiket} telah ditugaskan kepada petugas {$petugas->nama_petugas}.",
            'tipe' => 'update',
            'target_id' => $nomorTiket,
            'dibaca' => false,
            'target_role' => 'admin',
        ]);

        return response()->json([
            'message' => 'Petugas berhasil ditugaskan',
            'data' => $this->mapToFrontend($laporan)
        ]);
    }
}
