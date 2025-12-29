<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProfilEtudiant extends Model
{
    use HasFactory;

    protected $fillable = [
        'matricule',
        'niveau',
        'filiere',
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
     * Relation 1‑N vers les requêtes de l'étudiant
     */
    public function requetes()
    {
        return $this->hasMany(Requete::class, 'etudiant_id');
    }

    public function isComplete(): bool
    {
        return !empty($this->matricule) && !empty($this->niveau) && !empty($this->filiere);
    }
}
