<?php

namespace App\Mail;

use App\Models\Requete;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class RequestStatusChangedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $requete;

    /**
     * Create a new message instance.
     */
    public function __construct(Requete $requete)
    {
        $this->requete = $requete;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Mise à jour de votre requête')
                    ->markdown('emails.request_status_changed');
    }
}
