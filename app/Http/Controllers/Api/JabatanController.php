<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Jabatan;
use Illuminate\Http\Request;

class JabatanController extends Controller
{
    public function index()
    {
        $jabatan = Jabatan::all()->map(function($j) {
            return [
                'original_id' => $j->id_jabatan,
                'nama_jabatan' => $j->nama_jabatan,
                'level_jabatan'=> $j->level_jabatan,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $jabatan
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_jabatan' => 'required|string|max:255|unique:jabatans,nama_jabatan',
            'level_jabatan' => 'required|integer|min:1',
        ]);

        $jabatan = Jabatan::create([
            'nama_jabatan' => $request->nama_jabatan,
            'level_jabatan' => $request->level_jabatan,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Jabatan berhasil ditambahkan',
            'data' => $jabatan
        ], 200);
    }

    public function show($id)
    {
        // Mencari berdasarkan primary key id_jabatan
        $jabatan = Jabatan::findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $jabatan
        ]);
    }

    public function update(Request $request, $id)
    {
        $jabatan = Jabatan::findOrFail($id);

        $request->validate([
            'nama_jabatan' => 'required|string|max:255|unique:jabatans,nama_jabatan,' . $id . ',id_jabatan',
            'level_jabatan' => 'required|integer|min:1',
        ]);

        $jabatan->update([
            'nama_jabatan' => $request->nama_jabatan,
            'level_jabatan' => $request->level_jabatan,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Jabatan berhasil diperbarui',
            'data' => $jabatan
        ], 200);
    }

    public function destroy($id) {
        $jabatan = Jabatan::findOrFail($id);

        if($jabatan->users()->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Jabatan tidak bisa dihapus karena sedang digunakan oleh user'
            ], 422);
        }

        $jabatan->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Jabatan berhasil dihapus.'
        ], 200);
    }
}
