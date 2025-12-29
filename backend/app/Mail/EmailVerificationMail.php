<?php

namespace App\Mail;

use App\Models\Utilisateur;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Carbon;

class EmailVerificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $utilisateur;
    public $verificationUrl;
    public $expiresAt;

    /**
     * Create a new message instance.
     */
    public function __construct(Utilisateur $utilisateur)
    {
        $this->utilisateur = $utilisateur;

        // Générer l'URL de vérification signée (valide 60 minutes)
        $this->verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(60),
            [
                'id' => $utilisateur->getKey(),
                'hash' => sha1($utilisateur->getEmailForVerification())
            ]
        );

        $this->expiresAt = Carbon::now()->addMinutes(60)->format('d/m/Y à H:i');
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Vérification de votre adresse email - ' . config('app.name'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.verification-email',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
