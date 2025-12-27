<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'libelle',
        'description',
    ];

    /**
     * Relation many-to-many avec Permission
     */
    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'role_permissions', 'role_id', 'permission_id')
                    ->withTimestamps();
    }

    /**
     * Relation many-to-many avec Utilisateur
     */
    public function utilisateurs()
    {
        return $this->belongsToMany(Utilisateur::class, 'utilisateur_roles', 'role_id', 'utilisateur_id')
                    ->withTimestamps();
    }
}
