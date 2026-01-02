<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Afficher toutes les notifications
     * - Si l'utilisateur est connecté (auth), on filtre par son id
     * - Sinon, on peut passer ?utilisateur_id=8 en paramètre
     */
   public function index()
{
    // Récupérer uniquement les notifications de l'utilisateur connecté
    $notifications = Notification::where('utilisateur_id', auth()->id())
        ->with(['requete'])
        ->orderBy('created_at', 'desc')
        ->get();

    return response()->json([
        'success' => true,
        'data' => $notifications
    ]);
}

    /**
     * Créer une nouvelle notification
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'message' => 'required|string',
            'requete_id' => 'nullable|exists:requetes,id',
            'utilisateur_id' => 'required|exists:utilisateurs,id',
        ]);

        // Par défaut, une notification est non lue
        $validated['is_read'] = false;

        $notification = Notification::create($validated);

        return response()->json([
            'success' => true,
            'data' => $notification
        ], 201);
    }

    /**
     * Marquer une notification comme lue
     */
    public function markAsRead($id)
    {
        $notification = Notification::findOrFail($id);
        $notification->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'data' => $notification
        ]);
    }
}
