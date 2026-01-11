<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    use HasFactory;

    protected $table = 'messages';

    protected $fillable = [
        'emetteur_id',
        'recepteur_id',
        'requete_id',
        'contenu',
        'lu'
    ];

    protected $casts = [
        'lu' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Relation avec l'expéditeur (émetteur)
     */
    public function expediteur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'emetteur_id');
    }
    
    /**
     * Alias pour l'émetteur
     */
    public function emetteur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'emetteur_id');
    }

    /**
     * Relation avec le destinataire (récepteur)
     */
    public function destinataire(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'recepteur_id');
    }
    
    /**
     * Alias pour le récepteur
     */
    public function recepteur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'recepteur_id');
    }

    /**
     * Relation avec la requête (optionnelle)
     */
    public function requete(): BelongsTo
    {
        return $this->belongsTo(Requete::class);
    }
}
