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
             * LA SÉCURITÉ :
             * Si l'émetteur du message est l'étudiant (Manuel), le destinataire est Charlie (recepteur_id).
             * MAIS si l'émetteur n'est PAS l'étudiant (c'est Charlie qui répond),
             * alors le destinataire est FORCÉMENT l'étudiant (Manuel).
             */
            $destinataireId = ($request->emetteur_id == $requete->etudiant_id)
                              ? $request->recepteur_id
                              : $requete->etudiant_id;

            Notification::create([
                'utilisateur_id' => $destinataireId, // <--- On utilise l'ID calculé intelligemment
                'titre'          => 'Nouveau message - ' . $requete->titre,
                'message'        => $nomEmetteur . ' vous a envoyé un message.',
                'requete_id'     => $requete->id,
                'is_read'        => false,
                'type'           => 'CHAT',
            ]);

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
}
