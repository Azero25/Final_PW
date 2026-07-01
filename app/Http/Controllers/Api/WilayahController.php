<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Provinsi;
use App\Models\Kabupaten;
use App\Models\Kecamatan;
use App\Models\Kelurahan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class WilayahController extends Controller
{
    /**
     * Mengambil data wilayah cascading berdasarkan pengetikan (Mendukung endpoint search-cascading)
     */
    public function searchWilayah(Request $request)
    {
        $type = $request->query('type');
        $search = trim($request->query('q'));
        $parentId = $request->query('parent_id');

        if (empty($search)) {
            return response()->json([]);
        }

        switch ($type) {
            case 'provinsi':
                $data = Provinsi::where('nama_provinsi', 'LIKE', "%{$search}%")
                    ->limit(5)->get(['id_provinsi', 'nama_provinsi']);
                break;

            case 'kabupaten':
                $data = Kabupaten::where('id_provinsi', $parentId)
                    ->where('nama_kabupaten', 'LIKE', "%{$search}%")
                    ->limit(5)->get(['id_kabupaten', 'nama_kabupaten']);
                break;

            case 'kecamatan':
                $data = Kecamatan::where('id_kabupaten', $parentId)
                    ->where('nama_kecamatan', 'LIKE', "%{$search}%")
                    ->limit(5)->get(['id_kecamatan', 'nama_kecamatan']);
                break;

            case 'kelurahan':
                $data = Kelurahan::where('id_kecamatan', $parentId)
                    ->where('nama_kelurahan', 'LIKE', "%{$search}%")
                    ->limit(5)->get(['id_kelurahan', 'nama_kelurahan']);
                break;

            default:
                $data = [];
        }

        return response()->json($data);
    }

    /**
     * Tambah Provinsi Baru
     */
    public function storeProvinsi(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama' => 'required|string|max:255|unique:provinsis,nama_provinsi',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);
        }

        $provinsi = Provinsi::create([
            'nama_provinsi' => trim($request->nama)
        ]);

        return response()->json([
            'status' => 'success',
            'data' => [
                'id_provinsi' => $provinsi->id_provinsi,
                'nama_provinsi' => $provinsi->nama_provinsi
            ]
        ], 201);
    }

    /**
     * Tambah Kabupaten Baru
     */
    public function storeKabupaten(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_provinsi' => 'required|exists:provinsis,id_provinsi',
            'nama' => 'required|string|max:255|unique:kabupatens,nama_kabupaten,NULL,id_kabupaten,id_provinsi,' . $request->id_provinsi,
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);
        }

        $kabupaten = Kabupaten::create([
            'id_provinsi' => $request->id_provinsi,
            'nama_kabupaten' => trim($request->nama)
        ]);

        return response()->json([
            'status' => 'success',
            'data' => [
                'id_kabupaten' => $kabupaten->id_kabupaten,
                'nama_kabupaten' => $kabupaten->nama_kabupaten
            ]
        ], 201);
    }

    /**
     * Tambah Kecamatan Baru
     */
    public function storeKecamatan(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_kabupaten' => 'required|exists:kabupatens,id_kabupaten',
            'nama' => 'required|string|max:255|unique:kecamatans,nama_kecamatan,NULL,id_kecamatan,id_kabupaten,' . $request->id_kabupaten,
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);
        }

        $kecamatan = Kecamatan::create([
            'id_kabupaten' => $request->id_kabupaten,
            'nama_kecamatan' => trim($request->nama)
        ]);

        return response()->json([
            'status' => 'success',
            'data' => [
                'id_kecamatan' => $kecamatan->id_kecamatan,
                'nama_kecamatan' => $kecamatan->nama_kecamatan
            ]
        ], 201);
    }

    /**
     * Tambah Desa / Kelurahan Baru
     */
    public function storeKelurahan(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_kecamatan' => 'required|exists:kecamatans,id_kecamatan',
            'nama' => 'required|string|max:255|unique:kelurahans,nama_kelurahan,NULL,id_kelurahan,id_kecamatan,' . $request->id_kecamatan,
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);
        }

        $kelurahan = Kelurahan::create([
            'id_kecamatan' => $request->id_kecamatan,
            'nama_kelurahan' => trim($request->nama)
        ]);

        return response()->json([
            'status' => 'success',
            'data' => [
                'id_kelurahan' => $kelurahan->id_kelurahan,
                'nama_kelurahan' => $kelurahan->nama_kelurahan
            ]
        ], 201);
    }
}
