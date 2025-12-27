<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'description',
    ];

    /**
     * Relation avec ProfilAgentAdministratif
     * Un service peut avoir plusieurs profils d'agents administratifs
     */
    public function profilsAgentsAdministratifs()
    {
        return $this->hasMany(ProfilAgentAdministratif::class);
    }
}
