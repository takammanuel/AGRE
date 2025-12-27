<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Hash;

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
        'is_active'
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
        return $this->roles()->where('nom', $roleName)->exists();
    }

    /**
     * Attribuer un rôle à l'utilisateur
     */
    public function assignRole(string $roleName): void
    {
        $role = Role::where('nom', $roleName)->first();

        if ($role && !$this->hasRole($roleName)) {
            $this->roles()->attach($role->id);
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
}
