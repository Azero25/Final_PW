<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Carbon\Carbon;

class NotificationController extends Controller
{
    public function index()
    {
        Carbon::setLocale('id');
        $notifications = Notification::latest()->get();

        $mapped = $notifications->map(function ($notif) {
            return [
                'id' => $notif->id,
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
