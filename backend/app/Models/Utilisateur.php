<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Utilisateur extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'password',
        'telephone',
    ];

    protected $hidden = [
        'password',
    ];

    /**
     * Relation many-to-many avec Role
     */
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'utilisateur_roles', 'utilisateur_id', 'role_id')
                    ->withTimestamps();
    }

    /**
     * Relation 1-N avec Requete (étudiant)
     */
    public function requetesEtudiant()
    {
        return $this->hasMany(Requete::class, 'etudiant_id');
    }

    /**
     * Relation 1-N avec Requete (agent)
     */
    public function requetesAgent()
    {
        return $this->hasMany(Requete::class, 'agent_id');
    }

    /**
     * Relation 1-N avec ProfilAgentAdministratif
     */
    public function profilAgentAdministratif()
    {
        return $this->hasOne(ProfilAgentAdministratif::class);
    }

    public function profilEtudiant()
    {
        return $this->hasOne(ProfilEtudiant::class);
    }

    public function profilResponsablePedagogique()
    {
        return $this->hasOne(ProfilResponsablePedagogique::class);
    }

    /**
     * Relation 1-N avec Message (émis)
     */
    public function messagesEnvoyes()
    {
        return $this->hasMany(Message::class, 'emetteur_id');
    }

    /**
     * Relation 1-N avec Message (reçus)
     */
    public function messagesRecus()
    {
        return $this->hasMany(Message::class, 'recepteur_id');
    }

    /**
     * Relation 1-N avec Notification
     */
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}
