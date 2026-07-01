<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Carbon\Carbon;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        Carbon::setLocale('id');
        
        $query = Notification::query();

        if ($request->has('role')) {
            $role = $request->input('role');
            if ($role === 'admin') {
                $query->where('target_role', 'admin');
            } elseif ($role === 'petugas') {
                $query->where('target_role', 'petugas');
                if ($request->has('id')) {
                    $query->where('id_petugas', $request->input('id'));
                }
            } elseif ($role === 'warga') {
                $query->where('target_role', 'warga');
                if ($request->has('id')) {
                    $query->where('id_user', $request->input('id'));
                }
            }
        }

        $notifications = $query->latest()->get();

        $mapped = $notifications->map(function ($notif) {
            return [
                'id' => $notif->id_notification,
                'judul' => $notif->judul,
                'isi' => $notif->isi,
                'tipe' => $notif->tipe,
                'waktu' => $notif->created_at->diffForHumans(),
                'dibaca' => (bool) $notif->dibaca,
                'target_id' => $notif->target_id,
            ];
        });

        return response()->json($mapped);
    }

    public function markAllAsRead()
    {
        Notification::where('dibaca', false)->update(['dibaca' => true]);

        return response()->json(['message' => 'Semua notifikasi ditandai dibaca']);
    }

    public function markAsRead($id)
    {
        $notif = Notification::find($id);
        if ($notif) {
            $notif->update(['dibaca' => true]);
        }

        return response()->json(['message' => 'Notifikasi ditandai dibaca']);
    }

    public function destroy($id)
    {
        $notif = Notification::find($id);
        if ($notif) {
            $notif->delete();
        }

        return response()->json(['message' => 'Notifikasi berhasil dihapus']);
    }

    public function destroyRead()
    {
        Notification::where('dibaca', true)->delete();

        return response()->json(['message' => 'Notifikasi dibaca berhasil dihapus']);
    }
}
