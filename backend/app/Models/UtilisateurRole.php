<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class UtilisateurRole extends Pivot
{
    /**
     * La table associée à ce pivot
     */
    protected $table = 'utilisateur_roles';

    /**
     * Les colonnes assignables
     */
    protected $fillable = [
        'utilisateur_id',
        'role_id',
    ];

    /**
     * Timestamps activés
     */
    public $timestamps = true;

    /**
     * Relation vers Utilisateur
     */
    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class);
    }

    /**
     * Relation vers Role
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }
}
