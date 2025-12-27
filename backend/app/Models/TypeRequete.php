<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TypeRequete extends Model
{
    use HasFactory;

    protected $fillable = [
        'libelle',
        'description',
    ];

    /**
     * Relation 1‑N avec Requete
     */
    public function requetes()
    {
        return $this->hasMany(Requete::class, 'type_requete_id');
    }
}
