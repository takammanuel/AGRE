<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Utilisateur extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'utilisateurs';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'password',
        'telephone',
        'photo',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONS - RÔLES & PERMISSIONS
    |--------------------------------------------------------------------------
    */

    /**
     * Relation many-to-many avec Role
     */
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'utilisateur_roles', 'utilisateur_id', 'role_id')
                    ->withTimestamps();
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONS - PROFILS
    |--------------------------------------------------------------------------
    */

    /**
     * Relation 1-1 avec ProfilEtudiant
     */
    public function profilEtudiant()
    {
        return $this->hasOne(ProfilEtudiant::class, 'utilisateur_id');
    }

    /**
     * Relation 1-1 avec ProfilAgentAdministratif
     */
    public function profilAgentAdministratif()
    {
        return $this->hasOne(ProfilAgentAdministratif::class, 'utilisateur_id');
    }

    /**
     * Relation 1-1 avec ProfilResponsablePedagogique
     */
    public function profilResponsablePedagogique()
    {
        return $this->hasOne(ProfilResponsablePedagogique::class, 'utilisateur_id');
    }

    /**
     * Relation 1-1 avec ProfilAdministrateur
     */
    public function profilAdministrateur()
    {
        return $this->hasOne(ProfilAdministrateur::class, 'utilisateur_id');
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONS - REQUÊTES
    |--------------------------------------------------------------------------
    */

    /**
     * Relation 1-N avec Requete (en tant qu'étudiant)
     */
    public function requetesEtudiant()
    {
        return $this->hasMany(Requete::class, 'etudiant_id');
    }

    /**
     * Relation 1-N avec Requete (en tant qu'agent)
     */
    public function requetesAgent()
    {
        return $this->hasMany(Requete::class, 'agent_id');
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONS - MESSAGERIE
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | RELATIONS - NOTIFICATIONS
    |--------------------------------------------------------------------------
    */

    /**
     * Relation 1-N avec Notification
     */
    public function notifications()
    {
        return $this->hasMany(Notification::class, 'utilisateur_id');
    }

    /*
    |--------------------------------------------------------------------------
    | MÉTHODES - GESTION DES RÔLES
    |--------------------------------------------------------------------------
    */

    /**
     * Vérifie si l'utilisateur a un rôle spécifique
     *
     * @param string $roleName
     * @return bool
     */
    public function hasRole(string $roleName): bool
    {
        return $this->roles()->where('nom', $roleName)->exists();
    }

    /**
     * Vérifie si l'utilisateur a au moins un des rôles spécifiés
     *
     * @param array $roles
     * @return bool
     */
    public function hasAnyRole(array $roles): bool
    {
        return $this->roles()->whereIn('nom', $roles)->exists();
    }

    /**
     * Vérifie si l'utilisateur a tous les rôles spécifiés
     *
     * @param array $roles
     * @return bool
     */
    public function hasAllRoles(array $roles): bool
    {
        foreach ($roles as $role) {
            if (!$this->hasRole($role)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Assigner un rôle à l'utilisateur
     *
     * @param string $roleName
     * @return void
     */
    public function assignRole(string $roleName): void
    {
        $role = Role::where('nom', $roleName)->firstOrFail();

        // Utilise syncWithoutDetaching pour éviter les doublons
        $this->roles()->syncWithoutDetaching([$role->id]);
    }

    /**
     * Assigner plusieurs rôles à l'utilisateur
     *
     * @param array $roleNames
     * @return void
     */
    public function assignRoles(array $roleNames): void
    {
        $roles = Role::whereIn('nom', $roleNames)->pluck('id')->toArray();
        $this->roles()->syncWithoutDetaching($roles);
    }

    /**
     * Retirer un rôle de l'utilisateur
     *
     * @param string $roleName
     * @return void
     */
    public function removeRole(string $roleName): void
    {
        $role = Role::where('nom', $roleName)->first();

        if ($role) {
            $this->roles()->detach($role->id);
        }
    }

    /**
     * Synchroniser les rôles (remplace tous les rôles existants)
     *
     * @param array $roleNames
     * @return void
     */
    public function syncRoles(array $roleNames): void
    {
        $roles = Role::whereIn('nom', $roleNames)->pluck('id')->toArray();
        $this->roles()->sync($roles);
    }

    /**
     * Retirer tous les rôles
     *
     * @return void
     */
    public function removeAllRoles(): void
    {
        $this->roles()->detach();
    }

    /*
    |--------------------------------------------------------------------------
    | MÉTHODES - GESTION DES PERMISSIONS
    |--------------------------------------------------------------------------
    */

    /**
     * Vérifie si l'utilisateur a une permission spécifique via ses rôles
     *
     * @param string $permissionName
     * @return bool
     */
    public function hasPermission(string $permissionName): bool
    {
        foreach ($this->roles as $role) {
            if ($role->permissions()->where('nom', $permissionName)->exists()) {
                return true;
            }
        }

        return false;
    }

    /**
     * Vérifie si l'utilisateur a au moins une des permissions spécifiées
     *
     * @param array $permissions
     * @return bool
     */
    public function hasAnyPermission(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Récupère toutes les permissions de l'utilisateur via ses rôles
     *
     * @return \Illuminate\Support\Collection
     */
    public function getAllPermissions()
    {
        return $this->roles->flatMap(function ($role) {
            return $role->permissions;
        })->unique('id');
    }

    /*
    |--------------------------------------------------------------------------
    | MÉTHODES - GESTION DES PROFILS
    |--------------------------------------------------------------------------
    */

    /**
     * Récupère le profil spécifique selon le rôle principal
     *
     * @return mixed
     */
    public function getProfil()
    {
        if ($this->hasRole('etudiant')) {
            return $this->profilEtudiant;
        } elseif ($this->hasRole('agent_academique')) {
            return $this->profilAgentAdministratif;
        } elseif ($this->hasRole('responsable_pedagogique')) {
            return $this->profilResponsablePedagogique;
        } elseif ($this->hasRole('administrateur')) {
            return $this->profilAdministrateur;
        }

        return null;
    }

    /**
     * Récupère le type de profil selon le rôle principal
     *
     * @return string|null
     */
    public function getProfilType(): ?string
    {
        if ($this->hasRole('etudiant')) {
            return 'etudiant';
        } elseif ($this->hasRole('agent_academique')) {
            return 'agent';
        } elseif ($this->hasRole('responsable_pedagogique')) {
            return 'responsable';
        } elseif ($this->hasRole('administrateur')) {
            return 'administrateur';
        }

        return null;
    }

    /**
     * Vérifie si l'utilisateur a un profil
     *
     * @return bool
     */
    public function hasProfil(): bool
    {
        return $this->getProfil() !== null;
    }

    /*
    |--------------------------------------------------------------------------
    | MÉTHODES - HELPERS
    |--------------------------------------------------------------------------
    */

    /**
     * Vérifie si l'utilisateur est un étudiant
     *
     * @return bool
     */
    public function isEtudiant(): bool
    {
        return $this->hasRole('etudiant');
    }

    /**
     * Vérifie si l'utilisateur est un agent
     *
     * @return bool
     */
    public function isAgent(): bool
    {
        return $this->hasRole('agent_academique');
    }

    /**
     * Vérifie si l'utilisateur est un responsable pédagogique
     *
     * @return bool
     */
    public function isResponsable(): bool
    {
        return $this->hasRole('responsable_pedagogique');
    }

    /**
     * Vérifie si l'utilisateur est un administrateur
     *
     * @return bool
     */
    public function isAdministrateur(): bool
    {
        return $this->hasRole('administrateur');
    }

    /**
     * Récupère le nom complet de l'utilisateur
     *
     * @return string
     */
    public function getNomCompletAttribute(): string
    {
        return "{$this->prenom} {$this->nom}";
    }

    /**
     * Récupère l'URL de la photo de profil
     *
     * @return string
     */
    public function getPhotoUrlAttribute(): string
    {
        if ($this->photo) {
            return asset('storage/' . $this->photo);
        }

        // Photo par défaut
        return asset('images/default-avatar.png');
    }

    /**
     * Vérifie si l'email est vérifié
     *
     * @return bool
     */
    public function isEmailVerified(): bool
    {
        return $this->email_verified_at !== null;
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    /**
     * Scope pour filtrer par rôle
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $roleName
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithRole($query, string $roleName)
    {
        return $query->whereHas('roles', function ($q) use ($roleName) {
            $q->where('nom', $roleName);
        });
    }

    /**
     * Scope pour les utilisateurs vérifiés
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeVerified($query)
    {
        return $query->whereNotNull('email_verified_at');
    }

    /**
     * Scope pour les utilisateurs non vérifiés
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeUnverified($query)
    {
        return $query->whereNull('email_verified_at');
    }

    /**
     * Scope pour rechercher par nom ou prénom
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $search
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('nom', 'LIKE', "%{$search}%")
              ->orWhere('prenom', 'LIKE', "%{$search}%")
              ->orWhere('email', 'LIKE', "%{$search}%");
        });
    }
}
