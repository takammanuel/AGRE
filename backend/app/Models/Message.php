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
}
