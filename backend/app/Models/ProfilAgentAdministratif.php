<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProfilAgentAdministratif extends Model
{
    use HasFactory;

    protected $fillable = [
        'poste',
        'utilisateur_id',
    ];

    /**
     * Relation inverse 1‑1 vers l'utilisateur
     */
    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class);
    }


    public function service()
    {
         return $this->belongsTo(Service::class);
    }
}
