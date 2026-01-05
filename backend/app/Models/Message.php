<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'contenu',
        'emetteur_id',
        'recepteur_id',
        'requete_id', // On garde l'ID de la requête
        'read_at',    // On garde ton système de notification
    ];

    /** Relation vers l'émetteur */
    public function emetteur()
    {
        return $this->belongsTo(User::class, 'emetteur_id');
    }

    /** Relation vers le récepteur */
    public function recepteur()
    {
        return $this->belongsTo(User::class, 'recepteur_id');
    }

    /** Relation vers la requête associée (Ton travail) */
    public function requete()
    {
        return $this->belongsTo(Requete::class, 'requete_id');
    }

    /** Vérifie si le message est lu (Ton travail) */
    public function estLu(): bool
    {
        return !is_null($this->read_at);
    }
}
