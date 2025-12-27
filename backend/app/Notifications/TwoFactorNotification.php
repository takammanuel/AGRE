<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TwoFactorNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $code;

    public function __construct($code)
    {
        $this->code = $code;
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Code de vérification à deux facteurs')
            ->greeting('Bonjour ' . $notifiable->prenom . ' !')
            ->line('Votre code de vérification à deux facteurs est :')
            ->line('**' . $this->code . '**')
            ->line('Ce code est valide pendant 15 minutes.')
            ->line('Si vous n\'avez pas tenté de vous connecter, veuillez ignorer cet email.')
            ->salutation('Cordialement, L\'équipe ' . config('app.name'));
    }

    public function toArray($notifiable): array
    {
        return [
            'code' => $this->code,
        ];
    }
}
