<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Notification;
use App\Models\Utilisateur;
use App\Models\Requete;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{
    /**
     * Récupérer toutes les conversations d'un utilisateur
     * Retourne les requêtes où l'utilisateur a envoyé ou reçu des messages
     */
    public function getConversations(Request $request)
    {
        $userId = $request->user()->id;
        
        // Récupérer les IDs des requêtes où l'utilisateur a participé (envoyé OU reçu un message)
        $requeteIds = Message::where('emetteur_id', $userId)
            ->orWhere('recepteur_id', $userId)
            ->distinct()
            ->pluck('requete_id')
            ->toArray();

        if (empty($requeteIds)) {
            return response()->json(['success' => true, 'data' => []]);
        }

        // Récupérer ces requêtes avec le dernier message
        $requetes = Requete::with(['etudiant', 'agent', 'typeRequete'])
            ->whereIn('id', $requeteIds)
            ->get();

        // Formater les données avec le dernier message pour chaque requête
        $formatted = $requetes->map(function($requete) use ($userId) {
            // Dernier message de cette conversation
            $lastMessage = Message::where('requete_id', $requete->id)
                ->orderBy('created_at', 'desc')
                ->first();

            // Compter les messages non lus (reçus par l'utilisateur et non lus)
            $unreadCount = Message::where('requete_id', $requete->id)
                ->where('recepteur_id', $userId)
                ->whereNull('read_at')
                ->count();

            return [
                'requete_id' => $requete->id,
                'titre' => $requete->titre,
                'code_requete' => $requete->code_requete,
                'statut' => $requete->statut,
                'etudiant' => $requete->etudiant,
                'agent' => $requete->agent,
                'type_requete' => $requete->typeRequete,
                'last_message' => $lastMessage ? [
                    'contenu' => $lastMessage->contenu,
                    'created_at' => $lastMessage->created_at,
                    'emetteur_id' => $lastMessage->emetteur_id
                ] : null,
                'unread_count' => $unreadCount
            ];
        });

        // Trier par date du dernier message (plus récent en premier)
        $sorted = $formatted->sortByDesc(function($conv) {
            return $conv['last_message']['created_at'] ?? '1970-01-01';
        })->values();

        return response()->json(['success' => true, 'data' => $sorted]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'contenu'      => 'required|string',
            'emetteur_id'  => 'required|exists:utilisateurs,id',
            'recepteur_id' => 'required|exists:utilisateurs,id',
            'requete_id'   => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        return DB::transaction(function () use ($request) {

            $requete = Requete::find($request->requete_id);

            if (!$requete) {
                $requete = Requete::create([
                    'id'              => $request->requete_id,
                    'utilisateur_id'  => $request->emetteur_id,
                    'etudiant_id'     => $request->emetteur_id,
                    'type_requete_id' => $request->type_requete_id ?? 1,
                    'titre'           => 'Certificat de Scolarité',
                    'description'     => 'Demande initialisée via la messagerie.',
                    'statut'          => 'OUVERT',
                    'code_requete'    => 'REQ-' . strtoupper(bin2hex(random_bytes(3))),
                ]);
            }

            // 1. Enregistrement du message
            $message = Message::create([
                'contenu'      => $request->contenu,
                'emetteur_id'  => $request->emetteur_id,
                'recepteur_id' => $request->recepteur_id,
                'requete_id'   => $requete->id,
            ]);

            // 2. LOGIQUE DE NOTIFICATION INTELLIGENTE
            $emetteur = Utilisateur::find($request->emetteur_id);
            $nomEmetteur = $emetteur ? ($emetteur->prenom . ' ' . $emetteur->nom) : 'Un utilisateur';

            /**
             * Déterminer le(s) destinataire(s) de la notification :
             * - Si l'émetteur est l'étudiant -> notifier l'agent/responsable assigné OU tous les agents/admins si pas assigné
             * - Si l'émetteur est l'agent/responsable/admin -> notifier l'étudiant
             */
            $destinataires = [];
            
            if ($request->emetteur_id == $requete->etudiant_id) {
                // L'étudiant envoie un message
                if ($requete->agent_id) {
                    $destinataires[] = $requete->agent_id;
                }
                if ($requete->responsable_id) {
                    $destinataires[] = $requete->responsable_id;
                }
                
                // Si aucun agent/responsable assigné, notifier le recepteur_id envoyé
                if (empty($destinataires)) {
                    $destinataires[] = $request->recepteur_id;
                }
                
                // Aussi notifier tous les admins pour qu'ils voient les nouvelles requêtes
                $admins = Utilisateur::whereHas('roles', function($q) {
                    $q->where('nom', 'ADMINISTRATEUR');
                })->pluck('id')->toArray();
                
                $destinataires = array_unique(array_merge($destinataires, $admins));
            } else {
                // L'agent/responsable/admin répond -> notifier l'étudiant
                $destinataires[] = $requete->etudiant_id;
            }

            // Créer une notification pour chaque destinataire
            foreach ($destinataires as $destinataireId) {
                // Ne pas notifier l'émetteur lui-même
                if ($destinataireId != $request->emetteur_id) {
                    Notification::create([
                        'utilisateur_id' => $destinataireId,
                        'titre'          => 'Nouveau message - ' . $requete->titre,
                        'message'        => $nomEmetteur . ' vous a envoyé un message.',
                        'requete_id'     => $requete->id,
                        'is_read'        => false,
                        'type'           => 'CHAT',
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Requête générée et message envoyé avec succès',
                'data'    => $message->load(['emetteur', 'recepteur'])
            ], 201);
        });
    }

    public function getByRequete($requeteId)
    {
        $messages = Message::with(['emetteur', 'recepteur'])
            ->where('requete_id', $requeteId)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json(['success' => true, 'data' => $messages]);
    }

    /**
     * Marquer tous les messages d'une conversation comme lus pour l'utilisateur connecté
     */
    public function markAsRead(Request $request, $requeteId)
    {
        $userId = $request->user()->id;

        // Marquer comme lus tous les messages reçus par cet utilisateur dans cette conversation
        $updated = Message::where('requete_id', $requeteId)
            ->where('recepteur_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => $updated . ' message(s) marqué(s) comme lu(s)'
        ]);
    }
}
