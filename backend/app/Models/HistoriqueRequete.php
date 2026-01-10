<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HistoriqueRequete extends Model
{
    use HasFactory;

    protected $fillable = [
        'date_etat',
        'etat_id',
        'requete_id',
        'utilisateur_id',
    ];

    /**
     * Relation vers l'état
     */
    public function etat()
    {
        return $this->belongsTo(Etat::class);
    }

    /**
     * Relation vers la requête
     */
    public function requete()
    {
        return $this->belongsTo(Requete::class);
    }

    /**
     * Relation vers l'utilisateur qui a effectué l'action
     */
    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'utilisateur_id');
    }
}
