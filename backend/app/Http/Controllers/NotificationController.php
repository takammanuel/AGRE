<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Récupérer le nombre de notifications non lues pour le badge
     */
    public function unreadCount(Request $request)
    {
        // On récupère l'ID envoyé par Angular (?utilisateur_id=...)
        $userId = $request->query('utilisateur_id');

        if (!$userId) {
            return response()->json(['unread_count' => 0], 200);
        }

        $count = Notification::where('utilisateur_id', $userId)
            ->where('is_read', false)
            ->count();

        return response()->json([
            'success' => true,
            'unread_count' => $count
        ]);
    }

    /**
     * Liste complète pour Manuel
     */
    public function index(Request $request)
    {
        $userId = $request->query('utilisateur_id');

        $notifications = Notification::where('utilisateur_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $notifications
        ]);
    }

    /**
     * Marquer comme lu
     */
    public function markAsRead($id)
    {
        $notification = Notification::find($id);
        if ($notification) {
            $notification->update(['is_read' => true]);
        }

        return response()->json(['success' => true]);
    }
}
