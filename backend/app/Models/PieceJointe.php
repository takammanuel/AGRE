<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PieceJointe extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'chemin_fichier',
        'requete_id',
    ];

    /**
     * Relation inverse vers la requête
     */
    public function requete()
    {
        return $this->belongsTo(Requete::class);
    }
}
