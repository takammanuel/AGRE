<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    public function index()
    {
        return Message::with(['emetteur', 'recepteur'])->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'contenu' => 'required|string',
            'emetteur_id' => 'required|exists:utilisateurs,id',
            'recepteur_id' => 'required|exists:utilisateurs,id',
        ]);

        return DB::transaction(function () use ($validated) {
            // 1. On crée le message
            $message = Message::create($validated);

            // 2. On crée la notification avec TES colonnes (utilisateur_id)
            Notification::create([
                'titre' => 'Nouveau message reçu',
                'message' => 'Vous avez reçu un message de ' . $message->emetteur->nom,
                'utilisateur_id' => $validated['recepteur_id'], // On utilise ta colonne exacte
                'is_read' => false,
                'requete_id' => null, // À remplir si le message est lié à une requête spécifique
            ]);

            return response()->json($message->load(['emetteur', 'recepteur']), 201);
        });
    }

    public function markAsRead($id)
    {
        $message = Message::findOrFail($id);
        $message->update(['read_at' => now()]);
        return response()->json($message);
    }
}
