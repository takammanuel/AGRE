<?php

namespace App\Http\Controllers\Api\Agent;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\Utilisateur;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MessagerieController extends Controller
{
    /**
     * Liste des conversations de l'agent
     * GET /api/agent/messagerie/conversations
     */
    public function conversations(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Récupérer toutes les conversations (messages envoyés ou reçus)
        $conversations = Message::where(function($query) use ($user) {
            $query->where('emetteur_id', $user->id)
                  ->orWhere('recepteur_id', $user->id);
        })
        ->with(['emetteur', 'recepteur'])
        ->orderBy('created_at', 'desc')
        ->get()
        ->groupBy(function($message) use ($user) {
            // Grouper par l'autre utilisateur (pas soi-même)
            return $message->emetteur_id === $user->id 
                ? $message->recepteur_id 
                : $message->emetteur_id;
        })
        ->map(function($messages, $userId) use ($user) {
            $lastMessage = $messages->first();
            $otherUser = $lastMessage->emetteur_id === $user->id 
                ? $lastMessage->recepteur 
                : $lastMessage->emetteur;
            
            $unreadCount = $messages->where('recepteur_id', $user->id)
                                   ->where('lu', false)
                                   ->count();
            
            return [
                'user_id' => $otherUser->id,
                'user_nom' => $otherUser->nom,
                'user_prenom' => $otherUser->prenom,
                'user_email' => $otherUser->email,
                'last_message' => $lastMessage->contenu,
                'last_message_date' => $lastMessage->created_at,
                'unread_count' => $unreadCount,
                'is_read' => $lastMessage->recepteur_id === $user->id ? $lastMessage->lu : true
            ];
        })
        ->values();
        
        return response()->json([
            'success' => true,
            'data' => $conversations
        ]);
    }
    
    /**
     * Messages d'une conversation spécifique
     * GET /api/agent/messagerie/conversation/{userId}
     */
    public function conversation(Request $request, int $userId): JsonResponse
    {
        $user = $request->user();
        
        $messages = Message::where(function($query) use ($user, $userId) {
            $query->where('emetteur_id', $user->id)
                  ->where('recepteur_id', $userId);
        })
        ->orWhere(function($query) use ($user, $userId) {
            $query->where('emetteur_id', $userId)
                  ->where('recepteur_id', $user->id);
        })
        ->with(['emetteur', 'recepteur'])
        ->orderBy('created_at', 'asc')
        ->get();
        
        // Marquer les messages reçus comme lus
        Message::where('emetteur_id', $userId)
               ->where('recepteur_id', $user->id)
               ->where('lu', false)
               ->update(['lu' => true]);
        
        $otherUser = Utilisateur::find($userId);
        
        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $otherUser->id,
                    'nom' => $otherUser->nom,
                    'prenom' => $otherUser->prenom,
                    'email' => $otherUser->email
                ],
                'messages' => $messages
            ]
        ]);
    }
    
    /**
     * Envoyer un message
     * POST /api/agent/messagerie/send
     */
    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'destinataire_id' => 'required|exists:utilisateurs,id',
            'contenu' => 'required|string|max:2000',
            'requete_id' => 'nullable|exists:requetes,id'
        ]);
        
        $message = Message::create([
            'emetteur_id' => $request->user()->id,
            'recepteur_id' => $validated['destinataire_id'],
            'contenu' => $validated['contenu'],
            'requete_id' => $validated['requete_id'] ?? null,
            'lu' => false
        ]);
        
        $message->load(['emetteur', 'recepteur']);
        
        return response()->json([
            'success' => true,
            'message' => 'Message envoyé avec succès',
            'data' => $message
        ], 201);
    }
    
    /**
     * Marquer un message comme lu
     * PUT /api/agent/messagerie/{messageId}/read
     */
    public function markAsRead(Request $request, int $messageId): JsonResponse
    {
        $message = Message::where('id', $messageId)
                         ->where('recepteur_id', $request->user()->id)
                         ->firstOrFail();
        
        $message->update(['lu' => true]);
        
        return response()->json([
            'success' => true,
            'message' => 'Message marqué comme lu'
        ]);
    }
    
    /**
     * Nombre de messages non lus
     * GET /api/agent/messagerie/unread-count
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $count = Message::where('recepteur_id', $request->user()->id)
                       ->where('lu', false)
                       ->count();
        
        return response()->json([
            'success' => true,
            'data' => ['count' => $count]
        ]);
    }
    
    /**
     * Liste des étudiants pour démarrer une conversation
     * GET /api/agent/messagerie/etudiants
     */
    public function etudiants(Request $request): JsonResponse
    {
        $etudiants = Utilisateur::whereHas('roles', function($q) {
            $q->where('libelle', 'ETUDIANT');
        })
        ->where('is_active', true)
        ->select('id', 'nom', 'prenom', 'email')
        ->orderBy('nom')
        ->get();
        
        return response()->json([
            'success' => true,
            'data' => $etudiants
        ]);
    }
}
