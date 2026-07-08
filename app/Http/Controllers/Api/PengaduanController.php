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
use Carbon\Carbon;
use App\Models\Dinas;
use Illuminate\Support\Facades\Auth;
use App\Models\Provinsi;
use App\Models\Kecamatan;
use App\Models\Kabupaten;
use App\Models\LaporanTimeline;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Intervention\Image\Laravel\Facades\Image;
use Intervention\Image\Encoders\WebpEncoder;

class PengaduanController extends Controller
{
    private function buildLogEntry(string $status, $laporan = null): array
    {
        $petugasName = null;
        if ($laporan && $laporan->id_petugas) {
            $petugas = User::find($laporan->id_petugas);
            if ($petugas) {
                $petugasName = $petugas->nama_lengkap;
            }
        }

        $meta = [
            'Laporan Diterima' => ['keterangan' => 'Laporan Anda telah berhasil diterima and sedang menunggu verifikasi.', 'icon' => 'check_circle', 'color' => 'text-green-500'],
            'Verifikasi'       => ['keterangan' => 'Laporan sedang diverifikasi oleh admin.', 'icon' => 'verified', 'color' => 'text-blue-500'],
            'Sedang Diproses'  => [
                'keterangan' => $petugasName ? "Laporan sedang ditangani oleh Petugas {$petugasName} di lapangan." : 'Laporan sedang ditangani oleh petugas di lapangan.',
                'icon' => 'engineering',
                'color' => 'text-yellow-500'
            ],
            'Selesai'          => ['keterangan' => 'Laporan telah selesai ditangani.', 'icon' => 'task_alt', 'color' => 'text-green-500'],
            'Ditolak'          => ['keterangan' => 'Laporan ditolak. Tidak memenuhi kriteria pengaduan.', 'icon' => 'cancel', 'color' => 'text-red-500'],
        ];
        $statusKey = $status === 'Diterima' ? 'Laporan Diterima' : $status;
        $m = $meta[$statusKey] ?? ['keterangan' => $statusKey, 'icon' => 'info', 'color' => 'text-slate-500'];
        return [
            'tanggal'   => now()->format('d M Y, H:i'),
            'status'    => $statusKey,
            'keterangan' => $m['keterangan'],
            'icon'      => $m['icon'],
            'color'      => $m['color'],
        ];
    }

    private function generateTimeline($laporan): array
    {
        // Mengambil log nyata dari tabel relasi laporan_timelines via eager loading / dynamic properties
        $dbTimelines = $laporan->timelines;

        if ($dbTimelines && $dbTimelines->count() > 0) {
            $petugas = $laporan->id_petugas ? \App\Models\User::find($laporan->id_petugas) : null;
            $petugasName = $petugas ? $petugas->nama_lengkap : null;

            return $dbTimelines->map(function($t) use ($petugasName) {
                $keterangan = $t->keterangan;
                if (($t->status === 'Sedang Diproses' || $t->status === 'Diproses' || $t->status === 'Laporan sedang ditangani oleh petugas di lapangan.') && $petugasName) {
                    $keterangan = "Laporan sedang ditangani oleh Petugas {$petugasName} di lapangan.";
                }
                return [
                    'tanggal'    => Carbon::parse($t->created_at)->format('d M Y, H:i'),
                    'status'     => $t->status,
                    'keterangan' => $keterangan,
                    'icon'       => $t->icon,
                    'color'      => $t->color,
                ];
            })->toArray();
        }

        // Fallback data lama jika tabel relasi kosong
        return [
            [
                'tanggal'   => Carbon::parse($laporan->created_at)->format('d M Y, H:i'),
                'status'    => 'Laporan Diterima',
                'keterangan'=> 'Laporan Anda telah berhasil diterima dan sedang menunggu verifikasi.',
                'icon'      => 'check_circle',
                'color'      => 'text-green-500'
            ]
        ];
    }

    /**
     * Map dari Laporan (Backend ERD) ke format JSON Pengaduan (Frontend)
     */
    private function mapToFrontend($laporan)
    {
        $statusColors = [
            'Laporan Diterima' => 'bg-green-100 text-green-800 border-green-200',
            'Verifikasi' => 'bg-blue-100 text-blue-800 border-blue-200',
            'Sedang Diproses' => 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Selesai' => 'bg-green-100 text-green-800 border-green-200',
            'Ditolak' => 'bg-red-100 text-red-800 border-red-200',
        ];

        $kategoriObj = Kategori::find($laporan->id_kategori);
        $kategoriName = $kategoriObj?->nama_kategori ?? 'Umum';

        // Ambil dinas dari pivot table kategori_dinas secara aman
        $dinasId = DB::table('kategori_dinas')->where('id_kategori', $laporan->id_kategori)->value('id_dinas');
        $dinasName = $dinasId ? (Dinas::find($dinasId)?->nama_dinas ?? '-') : '-';

        $petugas = $laporan->id_petugas ? User::find($laporan->id_petugas) : null;
        $petugasName = $petugas ? $petugas->nama_lengkap : '-';
        $petugasId = $petugas ? $petugas->id_user : null;

        $kelurahan = Kelurahan::find($laporan->id_kelurahan);
        $kelurahanName = $kelurahan?->nama_kelurahan ?? 'Tidak Diketahui';
        $kecamatanName = $kelurahan?->kecamatan?->nama_kecamatan ?? 'Tidak Diketahui';
        $userObj = User::find($laporan->id_user);
        $userName = $userObj?->nama_lengkap ?? 'Anonim';
        $userHp = $userObj?->no_hp ?? '-';
        $userEmail = $userObj?->email ?? '-';

        $decodedGambar = is_string($laporan->bukti_foto) && str_starts_with($laporan->bukti_foto, '[') ? json_decode($laporan->bukti_foto, true) : null;
        $hasDecoded = is_array($decodedGambar);

        $decodedSelesai = is_string($laporan->foto_selesai) && str_starts_with($laporan->foto_selesai, '[') ? json_decode($laporan->foto_selesai, true) : null;
        $hasDecodedSelesai = is_array($decodedSelesai);

        return [
            'id' => $laporan->no_ticket,
            'nomor_tiket' => $laporan->no_ticket,
            'id_user' => $laporan->id_user,
            'email' => $userEmail,
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
            'petugas' => $petugasName,
            'petugas_avatar' => $petugas ? $petugas->avatar : null,
            'dinas' => $dinasName,
            'urgensi' => strtolower($laporan->prioritas),
            'lokasi' => $kelurahanName,
            'kecamatan' => $kecamatanName,
            'deskripsi' => $laporan->isi_laporan,
            'bukti_foto' => $hasDecoded ? ($decodedGambar[0] ?? null) : $laporan->bukti_foto,
            'gambar' => $hasDecoded ? $decodedGambar : ($laporan->bukti_foto ? [$laporan->bukti_foto] : []),
            'foto_selesai' => $hasDecodedSelesai ? ($decodedSelesai[0] ?? null) : $laporan->foto_selesai,
            'foto_selesai_list' => $hasDecodedSelesai ? $decodedSelesai : ($laporan->foto_selesai ? [$laporan->foto_selesai] : []),
            'status' => $laporan->status_laporan === 'Diterima' ? 'Laporan Diterima' : $laporan->status_laporan,
            'timeline' => $this->generateTimeline($laporan),
            'created_at' => $laporan->created_at,
            'updated_at' => $laporan->updated_at,
            'statusColor' => $statusColors[$laporan->status_laporan === 'Diterima' ? 'Laporan Diterima' : $laporan->status_laporan] ?? 'bg-slate-100 text-slate-800 border-slate-200',
            'tanggalDibuat' => Carbon::parse($laporan->tanggal_laporan)->format('d M Y'),
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

        if ($request->has('id_dinas')) {
            $kategoriIds = DB::table('kategori_dinas')->where('id_dinas', $request->id_dinas)->pluck('id_kategori');
            $query->whereIn('id_kategori', $kategoriIds);
        }

        $laporans = $query->get();

        $kategoriIds = $laporans->pluck('id_kategori')->filter()->unique();
        $kategoris = Kategori::whereIn('id_kategori', $kategoriIds)->get()->keyBy('id_kategori');

        $petugasIds = $laporans->pluck('id_petugas')->filter()->unique();
        $petugasList = User::whereIn('id_user', $petugasIds)->get()->keyBy('id_user');

        $kelurahanIds = $laporans->pluck('id_kelurahan')->filter()->unique();
        $kelurhans = Kelurahan::with('kecamatan')->whereIn('id_kelurahan', $kelurahanIds)->get()->keyBy('id_kelurahan');

        $userIds = $laporans->pluck('id_user')->filter()->unique();
        $users = User::whereIn('id_user', $userIds)->get()->keyBy('id_user');

        $laporanTikets = $laporans->pluck('no_ticket')->unique();
        $allTimelines = LaporanTimeline::whereIn('no_ticket', $laporanTikets)->get()->groupBy('no_ticket');

        $mapped = $laporans->map(function ($laporan) use ($kategoris, $petugasList, $kelurhans, $users, $allTimelines) {
            $kategoriObj = $kategoris->get($laporan->id_kategori);
            $kategoriName = $kategoriObj ? $kategoriObj->nama_kategori : 'Lainnya';

            $dinasId = DB::table('kategori_dinas')->where('id_kategori', $laporan->id_kategori)->value('id_dinas');
            $dinasName = $dinasId ? (Dinas::find($dinasId)?->nama_dinas ?? '-') : '-';

            $petugas = $petugasList->get($laporan->id_petugas);
            $petugasName = $petugas ? $petugas->nama_lengkap : '-';
            $petugasId = $petugas ? $petugas->id_user : null;

            $kelurahanObj = $kelurhans->get($laporan->id_kelurahan);
            $kelurahanName = $kelurahanObj?->nama_kelurahan ?? 'Tidak Diketahui';
            $kecamatanName = $kelurahanObj?->kecamatan?->nama_kecamatan ?? 'Tidak Diketahui';

            $userObj = $users->get($laporan->id_user);
            $userName = $userObj?->nama_lengkap ?? 'Anonim';
            $userHp = $userObj?->no_hp ?? '-';
            $userEmail = $userObj?->email ?? '-';

            // Set eager relation agar query timeline tidak melambat (N+1 solver)
            $laporan->setRelation('timelines', $allTimelines->get($laporan->no_ticket) ?: collect());

            $decodedGambar = is_string($laporan->bukti_foto) && str_starts_with($laporan->bukti_foto, '[') ? json_decode($laporan->bukti_foto, true) : null;
            $hasDecoded = is_array($decodedGambar);

            $decodedSelesai = is_string($laporan->foto_selesai) && str_starts_with($laporan->foto_selesai, '[') ? json_decode($laporan->foto_selesai, true) : null;
            $hasDecodedSelesai = is_array($decodedSelesai);

            return [
                'id' => $laporan->no_ticket,
                'nomor_tiket' => $laporan->no_ticket,
                'id_user' => $laporan->id_user,
                'email' => $userEmail,
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
                'petugas' => $petugasName,
                'petugas_avatar' => $petugas ? $petugas->avatar : null,
                'dinas' => $dinasName,
                'urgensi' => strtolower($laporan->prioritas),
                'lokasi' => $kelurahanName,
                'kecamatan' => $kecamatanName,
                'deskripsi' => $laporan->isi_laporan,
                'bukti_foto' => $hasDecoded ? ($decodedGambar[0] ?? null) : $laporan->bukti_foto,
                'gambar' => $hasDecoded ? $decodedGambar : ($laporan->bukti_foto ? [$laporan->bukti_foto] : []),
                'foto_selesai' => $hasDecodedSelesai ? ($decodedSelesai[0] ?? null) : $laporan->foto_selesai,
                'foto_selesai_list' => $hasDecodedSelesai ? $decodedSelesai : ($laporan->foto_selesai ? [$laporan->foto_selesai] : []),
                'status' => $laporan->status_laporan === 'Diterima' ? 'Laporan Diterima' : $laporan->status_laporan,
                'timeline' => $this->generateTimeline($laporan),
                'created_at' => $laporan->created_at,
                'updated_at' => $laporan->updated_at,
                'statusColor' => 'bg-slate-100 text-slate-800 border-slate-200',
                'tanggalDibuat' => Carbon::parse($laporan->tanggal_laporan)->format('d M Y'),
                'prioritas' => ucfirst($laporan->prioritas),
                'nomorTiket' => $laporan->no_ticket,
            ];
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
            'lokasi' => 'required|string', // Menampung teks alamat lengkap/panjang
            'id_kelurahan' => 'nullable|integer|exists:kelurahans,id_kelurahan', // Validasi input baru dari React
            'map_provinsi' => 'nullable|string|max:255',
            'map_kabupaten' => 'nullable|string|max:255',
            'map_kecamatan' => 'nullable|string|max:255',
            'map_kelurahan' => 'nullable|string|max:255',
            'deskripsi' => 'required|string',
            'bukti_foto' => 'nullable|string',
            'gambar' => 'nullable|array|max:5',
            'gambar.*' => 'file|max:10240',
        ]);

        $nomorTiket = 'LPW-' . date('Y') . '-' . str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
        while (Laporan::where('no_ticket', $nomorTiket)->exists()) {
            $nomorTiket = 'LPW-' . date('Y') . '-' . str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
        }

        $kategoriInput = trim($request->kategori);
        $kategori = Kategori::whereRaw('LOWER(nama_kategori) = ?', [strtolower($kategoriInput)])->first();
        if (!$kategori) {
            $kategori = Kategori::create(['nama_kategori' => ucfirst($kategoriInput)]);
        }

        // --- LOGIKA PENENTUAN ID KELURAHAN YANG BARU ---
        $finalKelurahanId = null;

        if ($request->filled('id_kelurahan')) {
            // Jika frontend berhasil mengunci ID Kelurahan (dari peta/dropdown), langsung gunakan ID tersebut
            $finalKelurahanId = $request->id_kelurahan;
        } elseif ($request->filled('map_kelurahan')) {
            // Jika data wilayah kelurahan terdeteksi dari peta, buat/cari otomatis secara cascading
            try {
                DB::beginTransaction();

                $provNama = $request->filled('map_provinsi') ? trim($request->map_provinsi) : 'Provinsi Kalimantan Selatan';
                $provinsi = Provinsi::firstOrCreate([
                    'nama_provinsi' => $provNama
                ]);

                $kabNama = $request->filled('map_kabupaten') ? trim($request->map_kabupaten) : 'Kabupaten Default';
                $kabupaten = Kabupaten::firstOrCreate([
                    'nama_kabupaten' => $kabNama,
                    'id_provinsi' => $provinsi->id_provinsi
                ]);

                $kecNama = $request->filled('map_kecamatan') ? trim($request->map_kecamatan) : 'Kecamatan Default';
                $kecamatanDb = Kecamatan::firstOrCreate([
                    'nama_kecamatan' => $kecNama,
                    'id_kabupaten' => $kabupaten->id_kabupaten
                ]);

                $kelurahan = Kelurahan::firstOrCreate([
                    'nama_kelurahan' => trim($request->map_kelurahan),
                    'id_kecamatan' => $kecamatanDb->id_kecamatan
                ]);

                DB::commit();
                $finalKelurahanId = $kelurahan->id_kelurahan;
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Gagal membuat wilayah otomatis dari peta: ' . $e->getMessage());
            }
        }

        if (!$finalKelurahanId) {
            // Coba cari nama kelurahan yang termuat di dalam teks alamat lokasi (smart match)
            $lokasiText = strtolower($request->lokasi);
            $matchedKelurahan = Kelurahan::all()->first(function ($kel) use ($lokasiText) {
                $nama = strtolower($kel->nama_kelurahan);
                // Hanya cocokkan nama kelurahan yang memiliki panjang >= 3 karakter agar tidak mencocokkan asal
                return strlen($nama) >= 3 && str_contains($lokasiText, $nama);
            });

            if ($matchedKelurahan) {
                $finalKelurahanId = $matchedKelurahan->id_kelurahan;
            } else {
                // Fallback: Jika koordinat peta tidak menghasilkan kelurahan DB atau input manual diketik bebas tanpa dropdown,
                // buat entitas wilayah default agar sistem tidak crash.
                $provinsi = Provinsi::firstOrCreate(['nama_provinsi' => 'Provinsi Kalimantan Selatan']);
                $kabupaten = Kabupaten::firstOrCreate(
                    ['nama_kabupaten' => 'Kabupaten Default', 'id_provinsi' => $provinsi->id_provinsi],
                    ['id_provinsi' => $provinsi->id_provinsi]
                );
                $kecamatanDb = Kecamatan::firstOrCreate(
                    ['nama_kecamatan' => 'Kecamatan Default', 'id_kabupaten' => $kabupaten->id_kabupaten],
                    ['id_kabupaten' => $kabupaten->id_kabupaten]
                );

                // Membatasi panjang teks penciptaan kelurahan fallback agar tidak melebihi struktur database varchar
                $namaKelurahanPotong = substr($request->lokasi, 0, 50);
                $kelurahan = Kelurahan::firstOrCreate(
                    ['nama_kelurahan' => $namaKelurahanPotong, 'id_kecamatan' => $kecamatanDb->id_kecamatan],
                    ['id_kecamatan' => $kecamatanDb->id_kecamatan]
                );
                $finalKelurahanId = $kelurahan->id_kelurahan;
            }
        }

        $userId = Auth::check() ? Auth::id() : null;

        $prioritasMap = ['rendah' => 'Rendah', 'sedang' => 'Sedang', 'tinggi' => 'Tinggi'];
        $prioritas = $prioritasMap[strtolower($request->urgensi)] ?? 'Sedang';

        $savedImages = [];
        if ($request->hasFile('gambar')) {
            foreach ($request->file('gambar') as $file) {
                try {
                    $fileName = 'bukti_' . time() . '_' . mt_rand(1000, 9999) . '.webp';
                    $path = 'uploads/bukti/' . $fileName;

                    $imageStream = Image::decode($file)
                        ->encode(new WebpEncoder(quality: 80));

                    Storage::disk('public')->put($path, (string) $imageStream);
                    $savedImages[] = '/storage/' . $path;
                } catch (\Exception $e) {
                    Log::error('Gagal memproses file gambar: ' . $e->getMessage());
                }
            }
        } elseif ($request->bukti_foto) {
            if (preg_match('/^data:image\/(\w+);base64,/', $request->bukti_foto)) {
                try {
                    $fileName = 'bukti_' . time() . '_' . mt_rand(1000, 9999) . '.webp';
                    $path = 'uploads/bukti/' . $fileName;

                    $imageStream = Image::decode($request->bukti_foto)
                        ->encode(new WebpEncoder(quality: 80));

                    Storage::disk('public')->put($path, (string) $imageStream);
                    $savedImages[] = '/storage/' . $path;
                } catch (\Exception $e) {
                    Log::error('Gagal memproses gambar bukti: ' . $e->getMessage());
                }
            }
        }

        // 1. BUAT LAPORAN TERLEBIH DAHULU
        $laporan = Laporan::create([
            'no_ticket'      => $nomorTiket,
            'judul_laporan' => $request->judul,
            'id_kategori'   => $kategori->id_kategori,
            'id_kelurahan'  => $finalKelurahanId, // Menggunakan ID kelurahan yang terdeteksi/fallback
            'lokasi'        => $request->lokasi,       // Menyimpan string alamat lengkap dari peta (Kolom baru database)
            'id_user'       => $userId,
            'prioritas'     => $prioritas,
            'status_laporan'=> 'Diterima',
            'isi_laporan'   => $request->deskripsi,
            'bukti_foto'    => count($savedImages) === 1 ? $savedImages[0] : json_encode($savedImages),
            'tanggal_laporan' => now(),
        ]);

        // 2. TIMELINE LOG PERTAMA
        $metaLog = $this->buildLogEntry('Laporan Diterima');
        LaporanTimeline::create([
            'no_ticket'  => $laporan->no_ticket,
            'status'     => $metaLog['status'],
            'keterangan' => $metaLog['keterangan'],
            'icon'       => $metaLog['icon'],
            'color'      => $metaLog['color'],
        ]);

        // Kirim Notifikasi Admin
        $pelaporName = (!$request->anonim && $userId) ? (User::find($userId)?->nama_lengkap ?? 'Warga') : 'Anonim';
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

    public function show(string $idOrTiket)
    {
        $laporan = is_numeric($idOrTiket) ? Laporan::find($idOrTiket) : Laporan::where('no_ticket', $idOrTiket)->first();

        if (!$laporan) {
            return response()->json(['message' => 'Pengaduan tidak ditemukan'], 404);
        }

        return response()->json($this->mapToFrontend($laporan));
    }

    public function update(Request $request, string $idOrTiket)
    {
        $laporan = is_numeric($idOrTiket) ? Laporan::find($idOrTiket) : Laporan::where('no_ticket', $idOrTiket)->first();

        if (!$laporan) {
            return response()->json(['message' => 'Pengaduan tidak ditemukan'], 404);
        }

        $request->validate([
            'status' => 'required|string',
            'foto_selesai' => 'nullable',
        ]);

        $statusToEnum = [
            'Laporan Diterima' => 'Diterima',
            'Diterima' => 'Diterima',
            'Verifikasi' => 'Verifikasi',
            'Sedang Diproses' => 'Sedang Diproses',
            'Diproses' => 'Sedang Diproses',
            'Selesai' => 'Selesai',
            'Ditolak' => 'Ditolak',
        ];

        $newStatus = $statusToEnum[$request->status] ?? 'Sedang Diproses';

        // Jika yang mengubah status adalah petugas, otomatis tugaskan ke laporan ini
        if (Auth::check() && Auth::user()->role === 'petugas') {
            $laporan->id_petugas = Auth::id();
        }

        $laporan->status_laporan = $newStatus;

        // Proses upload foto selesai jika status diubah menjadi Selesai dan ada input foto_selesai
        if ($newStatus === 'Selesai' && $request->foto_selesai) {
            $fotoInput = $request->foto_selesai;
            $fotoList = is_array($fotoInput) ? $fotoInput : [$fotoInput];
            $savedSelesaiImages = [];

            foreach ($fotoList as $base64Img) {
                if (preg_match('/^data:image\/(\w+);base64,/', $base64Img)) {
                    try {
                        $fileName = 'selesai_' . time() . '_' . mt_rand(1000, 9999) . '.webp';
                        $path = 'uploads/bukti/' . $fileName;

                        $imageStream = Image::decode($base64Img)
                            ->encode(new WebpEncoder(quality: 80));

                        Storage::disk('public')->put($path, (string) $imageStream);
                        $savedSelesaiImages[] = '/storage/' . $path;
                    } catch (\Exception $e) {
                        Log::error('Gagal memproses foto selesai: ' . $e->getMessage());
                    }
                }
            }
            if (count($savedSelesaiImages) > 0) {
                $laporan->foto_selesai = count($savedSelesaiImages) === 1 ? $savedSelesaiImages[0] : json_encode($savedSelesaiImages);
            }
        }

        // Catat riwayat ke tabel pivot timelines secara permanen jika belum ada duplikat status berturut-turut
        $metaLog = $this->buildLogEntry($newStatus, $laporan);
        $lastTimeline = LaporanTimeline::where('no_ticket', $laporan->no_ticket)->latest()->first();
        if (!$lastTimeline || $lastTimeline->status !== $metaLog['status']) {
            LaporanTimeline::create([
                'no_ticket'  => $laporan->no_ticket,
                'status'     => $metaLog['status'],
                'keterangan' => $metaLog['keterangan'],
                'icon'       => $metaLog['icon'],
                'color'      => $metaLog['color'],
            ]);
        }

        $laporan->save();
        $nomorTiket = $laporan->no_ticket;

        // Create Notifications
        if ($laporan->id_user) {
            Notification::create([
                'judul' => 'Status laporan diperbarui',
                'isi' => "Status laporan Anda ({$nomorTiket}) telah diubah menjadi \"{$newStatus}\".",
                'tipe' => 'update', 'target_id' => $nomorTiket, 'dibaca' => false, 'target_role' => 'warga', 'id_user' => $laporan->id_user,
            ]);
        }

        return response()->json([
            'message' => 'Status berhasil diperbarui',
            'data' => $this->mapToFrontend($laporan)
        ]);
    }

    public function destroy(string $idOrTiket)
    {
        $laporan = is_numeric($idOrTiket) ? Laporan::find($idOrTiket) : Laporan::where('no_ticket', $idOrTiket)->first();

        if (!$laporan) {
            return response()->json(['message' => 'Pengaduan tidak ditemukan'], 404);
        }

        $laporan->delete();
        return response()->json(['message' => 'Pengaduan berhasil dihapus']);
    }

    public function getEligiblePetugas(string $idOrTiket)
    {
        $laporan = is_numeric($idOrTiket)
            ? Laporan::find($idOrTiket)
            : Laporan::where('no_ticket', $idOrTiket)->first();

        if (!$laporan) {
            return response()->json(['message' => 'Pengaduan tidak ditemukan'], 404);
        }

        $idKategori = (int) $laporan->id_kategori;

        $dinasIds = DB::table('kategori_dinas')
            ->where('id_kategori', $idKategori)
            ->pluck('id_dinas')
            ->toArray();

        if (empty($dinasIds)) {
            return response()->json([], 200);
        }

        $petugas = User::where('role', 'petugas')->whereIn('id_dinas', $dinasIds)->get()->map(function($p) {
            return [
                'id_petugas' => $p->id_user,
                'nama_petugas' => $p->nama_lengkap,
                'NIP' => $p->nip ?? '-',
            ];
        });

        return response()->json($petugas);
    }

    public function assignPetugas(Request $request, string $idOrTiket)
    {
        // PERBAIKAN: Menggunakan $idOrTiket adaptif (bukan $nomorTiket gaib lagi)
        $laporan = is_numeric($idOrTiket) ? Laporan::find($idOrTiket) : Laporan::where('no_ticket', $idOrTiket)->first();

        if (!$laporan) {
            return response()->json(['message' => 'Pengaduan tidak ditemukan'], 404);
        }

        $request->validate([
            'id_petugas' => 'required|exists:users,id_user'
        ]);

        $petugas = User::where('role', 'petugas')->findOrFail($request->id_petugas);

        $laporan->id_petugas = $petugas->id_user;
        $laporan->status_laporan = 'Sedang Diproses';

        // Catat mutasi tugas baru ke riwayat timeline jika belum ada duplikat berturut-turut
        $keterangan = 'Laporan telah ditugaskan kepada petugas: ' . $petugas->nama_lengkap;
        $lastTimeline = LaporanTimeline::where('no_ticket', $laporan->no_ticket)->latest()->first();
        if (!$lastTimeline || $lastTimeline->status !== 'Sedang Diproses' || $lastTimeline->keterangan !== $keterangan) {
            LaporanTimeline::create([
                'no_ticket'  => $laporan->no_ticket,
                'status'     => 'Sedang Diproses',
                'keterangan' => $keterangan,
                'icon'       => 'engineering',
                'color'      => 'text-yellow-500',
            ]);
        }

        $laporan->save();
        $nomorTiket = $laporan->no_ticket;

        // Notifikasi Petugas & Warga
        Notification::create([
            'judul' => 'Tugas baru ditugaskan',
            'isi' => "Laporan {$nomorTiket} telah ditugaskan kepada Anda.",
            'tipe' => 'update', 'target_id' => $nomorTiket, 'dibaca' => false, 'target_role' => 'petugas', 'id_petugas' => $petugas->id_user,
        ]);

        return response()->json([
            'message' => 'Petugas berhasil ditugaskan',
            'data' => $this->mapToFrontend($laporan)
        ]);
    }
}
