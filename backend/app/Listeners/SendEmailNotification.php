<?php

namespace App\Listeners;

use App\Events\RequestStatusChanged;
use Illuminate\Support\Facades\Mail;
use App\Mail\RequestStatusChangedMail;

class SendEmailNotification
{
    /**
     * Handle the event.
     */
    public function handle(RequestStatusChanged $event): void
    {
        // Récupérer l'utilisateur lié à la requête
        $user = $event->requete->utilisateur; // Assure-toi que ton modèle Requete a une relation utilisateur

        // Vérifier que l'utilisateur a bien un email
        if ($user && $user->email) {
            // Envoyer l'email
            Mail::to($user->email)->send(new RequestStatusChangedMail($event->requete));
        }
    }
}
