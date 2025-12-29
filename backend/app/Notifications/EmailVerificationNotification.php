<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Carbon;

class EmailVerificationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct()
    {
        //
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(60),
            ['id' => $notifiable->getKey(), 'hash' => sha1($notifiable->getEmailForVerification())]
        );

        return (new MailMessage)
            ->subject('Vérification de votre adresse email')
            ->greeting('Bonjour ' . $notifiable->prenom . ' !')
            ->line('Merci de vous être inscrit sur notre plateforme.')
            ->line('Veuillez cliquer sur le bouton ci-dessous pour vérifier votre adresse email :')
            ->action('Vérifier mon email', $verificationUrl)
            ->line('Ce lien expirera dans 60 minutes.')
            ->line('Si vous n\'avez pas créé de compte, aucune action n\'est requise.')
            ->salutation('Cordialement, L\'équipe ' . config('app.name'));
    }

    public function toArray($notifiable): array
    {
        return [
            //
        ];
    }
}
