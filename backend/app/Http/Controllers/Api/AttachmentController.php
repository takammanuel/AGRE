<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PieceJointe;
use App\Models\Requete;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AttachmentController extends Controller
{
    /**
     * Upload une pièce jointe pour une requête
     */
    public function store(Request $request, Requete $requete): JsonResponse
    {
        $user = $request->user();

        // Vérifier les permissions
        $canUpload = false;

        if ($user->isEtudiant() && $requete->etudiant_id === $user->id) {
            // L'étudiant peut uploader si la requête est en attente d'infos
            $etatActuel = $requete->etatActuel;
            $canUpload = $etatActuel && $etatActuel->libelle === 'INFORMATIONS_REQUISES';
        } elseif ($user->isAgent() && $requete->agent_id === $user->id) {
            // L'agent peut uploader des documents générés
            $canUpload = true;
        }

        if (!$canUpload) {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'êtes pas autorisé à ajouter des pièces jointes à cette requête.'
            ], 403);
        }

        $request->validate([
            'fichier' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        try {
            $file = $request->file('fichier');
            $path = $file->store('requetes/' . $requete->id, 'public');

            $pieceJointe = $requete->piecesJointes()->create([
                'nom' => $file->getClientOriginalName(),
                'chemin_fichier' => $path,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pièce jointe ajoutée avec succès.',
                'data' => $pieceJointe
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'upload de la pièce jointe.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Télécharger une pièce jointe
     */
    public function download(Request $request, PieceJointe $attachment)
    {
        $user = $request->user();
        $requete = $attachment->requete;

        // Vérifier les permissions
        $canDownload = false;

        if ($user->isEtudiant() && $requete->etudiant_id === $user->id) {
            $canDownload = true;
        } elseif ($user->isAgent() && $requete->typeRequete->service_id === $user->profilAgentAdministratif->service_id) {
            $canDownload = true;
        } elseif ($user->isResponsable() || $user->isAdmin()) {
            $canDownload = true;
        }

        if (!$canDownload) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé.'
            ], 403);
        }

        if (!Storage::disk('public')->exists($attachment->chemin_fichier)) {
            return response()->json([
                'success' => false,
                'message' => 'Fichier introuvable.'
            ], 404);
        }

        $filePath = Storage::disk('public')->path($attachment->chemin_fichier);

        return response()->download($filePath, $attachment->nom);
    }

    /**
     * Supprimer une pièce jointe
     */
    public function destroy(Request $request, PieceJointe $attachment): JsonResponse
    {
        $user = $request->user();
        $requete = $attachment->requete;

        // Seul l'étudiant propriétaire peut supprimer (et seulement si la requête est en attente)
        if (!$user->isEtudiant() || $requete->etudiant_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'êtes pas autorisé à supprimer cette pièce jointe.'
            ], 403);
        }

        $etatActuel = $requete->etatActuel;
        if (!$etatActuel || !in_array($etatActuel->libelle, ['EN_ATTENTE', 'AFFECTEE'])) {
            return response()->json([
                'success' => false,
                'message' => 'Vous ne pouvez supprimer des pièces jointes que si la requête est en attente.'
            ], 422);
        }

        try {
            Storage::disk('public')->delete($attachment->chemin_fichier);
            $attachment->delete();

            return response()->json([
                'success' => true,
                'message' => 'Pièce jointe supprimée avec succès.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de la pièce jointe.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

