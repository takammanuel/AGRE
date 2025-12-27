<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProfilResponsablePedagogique extends Model
{
    use HasFactory;

    protected $fillable = [
        'departement',
        'utilisateur_id',
    ];

    /**
     * Relation inverse 1‑1 vers l'utilisateur
     */
    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class);
    }

    /**
     * Relation 1‑N vers les requêtes que le responsable pourrait gérer
     * (optionnel, selon ton application)
     */
    public function requetes()
    {
        return $this->hasMany(Requete::class, 'responsable_id');
    }
}
