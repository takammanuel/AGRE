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
        'read_at', // champ ajouté
    ];

    /**
     * Relation vers l'utilisateur émetteur
     */
    public function emetteur()
    {
        return $this->belongsTo(Utilisateur::class, 'emetteur_id');
    }

    /**
     * Relation vers l'utilisateur récepteur (nullable)
     */
    public function recepteur()
    {
        return $this->belongsTo(Utilisateur::class, 'recepteur_id');
    }

    /**
     * Vérifie si le message est lu
     */
    public function estLu(): bool
    {
        return !is_null($this->read_at);
    }
}
