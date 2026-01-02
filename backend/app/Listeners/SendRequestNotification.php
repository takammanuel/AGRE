<?php

namespace App\Listeners;

use App\Events\RequestStatusChanged;
use App\Models\Notification;
use App\Models\HistoriqueRequete;
use App\Models\Etat;

class SendRequestNotification
{
    /**
     * Handle the event.
     */
    public function handle(RequestStatusChanged $event): void
    {
        $requete = $event->requete;

        // ✅ Créer une notification
        Notification::create([
            'titre'          => 'Changement de statut',
            'message'        => "La requête #{$requete->id} est maintenant : {$requete->statut}",
            'requete_id'     => $requete->id,
            'utilisateur_id' => $requete->utilisateur_id,
            'is_read'        => false,
        ]);

        // ✅ Adapter le statut pour correspondre aux valeurs de la table etats
        $etatLibelle = match (strtolower($requete->statut)) {
            'en attente' => 'EN_ATTENTE',
            'en cours'   => 'EN_COURS',
            'traitée'    => 'TRAITEE',
            'rejetée'    => 'REJETEE',
            default      => null,
        };

        // ✅ Enregistrer l’historique uniquement si l’état existe
        $etat = $etatLibelle ? Etat::where('libelle', $etatLibelle)->first() : null;

        HistoriqueRequete::create([
            'requete_id'     => $requete->id,
            'etat_id'        => $etat?->id,
            'utilisateur_id' => $requete->utilisateur_id,
            'date_etat'      => now(), // ✅ ajouté ici
        ]);
    }
}
