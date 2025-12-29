<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProfilAdministrateur extends Model
{
    use HasFactory;

    /**
     * Les attributs qui sont assignables en masse.
     *
     * @var array<string>
     */
    protected $fillable = [
        'niveau_acces',
        'utilisateur_id',
    ];

    /**
     * Les valeurs par défaut des attributs du modèle.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'niveau_acces' => 'admin',
    ];

    /**
     * Les casts de type pour les attributs du modèle.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relation avec le modèle Utilisateur.
     */
    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class);
    }

    /**
     * Vérifie si l'administrateur est un super administrateur.
     *
     * @return bool
     */
    public function estSuperAdmin(): bool
    {
        return $this->niveau_acces === 'super_admin';
    }

    /**
     * Vérifie si l'administrateur est un administrateur standard.
     *
     * @return bool
     */
    public function estAdmin(): bool
    {
        return $this->niveau_acces === 'admin';
    }

    /**
     * Définit le niveau d'accès comme super administrateur.
     *
     * @return void
     */
    public function definirCommeSuperAdmin(): void
    {
        $this->update(['niveau_acces' => 'super_admin']);
    }

    /**
     * Définit le niveau d'accès comme administrateur standard.
     *
     * @return void
     */
    public function definirCommeAdmin(): void
    {
        $this->update(['niveau_acces' => 'admin']);
    }
}
