<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TypeRequete extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'description',
        'necessite_approbation',
        'delai_traitement_estime',
        'est_actif',
        'service_id'
    ];

    /**
     * Relation 1‑N avec Requete
     */
    public function requetes()
    {
        return $this->hasMany(Requete::class, 'type_requete_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
