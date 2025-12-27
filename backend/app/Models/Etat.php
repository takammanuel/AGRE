<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Etat extends Model
{
    use HasFactory;

    protected $fillable = [
        'libelle',
    ];

    public function requetes()
    {
        return $this->belongsToMany(
            Requete::class,           // Modèle cible
            'historique_requetes',    // Table pivot
            'etat_id',                // FK sur la table pivot vers Etat
            'requete_id'              // FK sur la table pivot vers Requete
        )->withPivot('date_etat')     // Si tu veux accéder à la date de l'état
        ->withTimestamps();
    }
}
