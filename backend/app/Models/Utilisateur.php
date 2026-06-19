<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class Utilisateur extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable, HasApiTokens, SoftDeletes;

    protected $table = 'utilisateurs';

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'password',
        'telephone',
        'photo',
        'email_verified_at',
        'two_factor_code',
        'two_factor_expires_at',
        'is_active',
        'last_login_at'
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_code',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_expires_at' => 'datetime',
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONS ESSENTIELLES
    |--------------------------------------------------------------------------
    */

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'utilisateur_roles')
                    ->withTimestamps();
    }

    public function profilEtudiant()
    {
        return $this->hasOne(ProfilEtudiant::class);
    }

    public function profilAgentAdministratif()
    {
        return $this->hasOne(ProfilAgentAdministratif::class);
    }

    public function profilResponsablePedagogique()
    {
        return $this->hasOne(ProfilResponsablePedagogique::class);
    }

    public function profilAdministrateur()
    {
        return $this->hasOne(ProfilAdministrateur::class);
    }

    /*
    |--------------------------------------------------------------------------
    | MÉTHODES ESSENTIELLES (seulement celles nécessaires)
    |--------------------------------------------------------------------------
    */

    /**
     * Vérifie si l'utilisateur a un rôle
     */
    public function hasRole(string $roleName): bool
    {
         return $this->roles()
                    ->where(function($query) use ($roleName) {
                        $query->where('libelle', strtoupper($roleName))
                              ->orWhere('nom', $roleName)
                              ->orWhere('nom', strtolower($roleName));
                    })
                    ->exists();
    }

    /**
     * Attribuer un rôle à l'utilisateur
     */
    public function assignRole(string $roleName): void
    {
        // Chercher d'abord par libelle (ETUDIANT, AGENT_ACADEMIQUE, etc.)
        $role = Role::where('libelle', strtoupper($roleName))->first();

        // Si pas trouvé, chercher par nom (Étudiant, Agent Académique, etc.)
        if (!$role) {
            $role = Role::where('nom', $roleName)->first();
        }

        // Si toujours pas trouvé, chercher par nom en minuscule
        if (!$role) {
            $role = Role::where('nom', strtolower($roleName))->first();
        }

        if ($role) {
            // Vérifier si le rôle n'est pas déjà assigné
            $exists = DB::table('utilisateur_roles')
                ->where('utilisateur_id', $this->id)
                ->where('role_id', $role->id)
                ->exists();
            
            if (!$exists) {
                $this->roles()->attach($role->id);
            }
        }
    }

    /**
     * Méthodes de vérification simple
     */
    public function isEtudiant(): bool
    {
        return $this->hasRole('ETUDIANT');
    }

    public function isAgent(): bool
    {
        return $this->hasRole('AGENT_ACADEMIQUE');
    }

    public function isResponsable(): bool
    {
        return $this->hasRole('RESPONSABLE_PEDAGOGIQUE');
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('ADMINISTRATEUR');
    }

    public function hasVerifiedEmail(): bool
    {
        return ! is_null($this->email_verified_at);
    }

    public function getProfil()
    {
        if ($this->isEtudiant() && $this->profilEtudiant) {
            return [
                'type' => 'etudiant',
                'data' => $this->profilEtudiant
            ];
        }

        if ($this->isAgent() && $this->profilAgentAdministratif) {
            return [
                'type' => 'agent',
                'data' => $this->profilAgentAdministratif->load('service')
            ];
        }

        if ($this->isResponsable() && $this->profilResponsablePedagogique) {
            return [
                'type' => 'responsable',
                'data' => $this->profilResponsablePedagogique
            ];
        }

        if ($this->isAdmin() && $this->profilAdministrateur) {
            return [
                'type' => 'admin',
                'data' => $this->profilAdministrateur
            ];
        }

        return null;
    }

    /**
     * Marque l'adresse email comme vérifiée.
     */
    public function markEmailAsVerified(): bool
    {
        return $this->forceFill([
            'email_verified_at' => $this->freshTimestamp(),
        ])->save();
    }

    /**
     * Récupère l'email pour la vérification.
     */
    public function getEmailForVerification(): string
    {
        return $this->email;
    }

    /**
     * Envoie la notification de vérification d'email.
     */
    public function sendEmailVerificationNotification(): void
    {
        \Illuminate\Support\Facades\Mail::to($this->email)
            ->send(new \App\Mail\EmailVerificationMail($this));
    }

    /**
     * Scope pour les utilisateurs actifs
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope pour les utilisateurs inactifs
     */
    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }

    /**
     * Scope pour rechercher des utilisateurs
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function($q) use ($search) {
            $q->where('nom', 'like', "%{$search}%")
              ->orWhere('prenom', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhere('telephone', 'like', "%{$search}%");
        });
    }

    /**
     * Scope pour filtrer par rôle
     */
    public function scopeWithRole($query, $roleName)
    {
        return $query->whereHas('roles', function($q) use ($roleName) {
            $q->where('nom', $roleName);
        });
    }

    /**
     * Scope pour les utilisateurs vérifiés
     */
    public function scopeVerified($query)
    {
        return $query->whereNotNull('email_verified_at');
    }

    /**
     * Scope pour les utilisateurs non vérifiés
     */
    public function scopeUnverified($query)
    {
        return $query->whereNull('email_verified_at');
    }
}
