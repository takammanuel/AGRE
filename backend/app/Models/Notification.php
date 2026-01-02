<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'titre',
        'message',
        'requete_id',
        'utilisateur_id',
        'is_read', // champ ajouté
    ];

    /**
     * Relation vers la requête associée (optionnelle)
     */
    public function requete()
    {
        return $this->belongsTo(Requete::class);
    }

    /**
     * Relation vers l'utilisateur destinataire
     */
    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class);
    }

    /**
     * Vérifie si la notification est lue
     */
    public function estLue(): bool
    {
        return (bool) $this->is_read;
    }
}
