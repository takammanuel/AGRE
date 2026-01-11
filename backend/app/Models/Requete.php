<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Requete extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',             // <--- TRÈS IMPORTANT : Ajoute l'ID ici pour permettre la création forcée
        'code_requete',
        'titre',
        'priorite',
        'description',
        'etudiant_id',
        'agent_id',
        'responsable_id',
        'type_requete_id',
        'utilisateur_id', // C'est celui que tu utilises dans le MessageController
        'statut',
    ];

    // Relations
    public function etudiant() { return $this->belongsTo(Utilisateur::class, 'etudiant_id'); }
    public function agent() { return $this->belongsTo(Utilisateur::class, 'agent_id'); }
    public function responsable() { return $this->belongsTo(Utilisateur::class, 'responsable_id'); }
    public function typeRequete() { return $this->belongsTo(TypeRequete::class, 'type_requete_id'); }
    public function utilisateur() { return $this->belongsTo(Utilisateur::class, 'utilisateur_id'); }

    public function messages()
    {
        return $this->hasMany(Message::class, 'requete_id');
    }

    /**
     * Relation pratique vers les états via la table pivot historique_requetes
     */
    public function etats()
    {
        return $this->belongsToMany(
            Etat::class,
            'historique_requetes',
            'requete_id',
            'etat_id'
        )->withPivot('date_etat')
         ->withTimestamps();
    }

    /**
     * Obtenir l'état actuel de la requête
     */
    public function getEtatActuelAttribute()
    {
        $dernierHistorique = $this->historiques()
            ->with('etat')
            ->orderBy('date_etat', 'desc')
            ->first();

        return $dernierHistorique ? $dernierHistorique->etat : null;
    }

    /**
     * Changer l'état de la requête et enregistrer dans l'historique
     */
    public function changerEtat($etatLibelle, $utilisateurId = null)
    {
        $etat = Etat::where('libelle', $etatLibelle)->first();

        if (!$etat) {
            throw new \Exception("État '{$etatLibelle}' introuvable");
        }

        HistoriqueRequete::create([
            'requete_id' => $this->id,
            'etat_id' => $etat->id,
            'date_etat' => now(),
        ]);

        return $this;
    }

    /**
     * Générer un code de requête unique
     */
    public static function genererCodeRequete()
    {
        $annee = date('Y');
        $derniereRequete = self::where('code_requete', 'like', "REQ-{$annee}-%")
            ->orderBy('code_requete', 'desc')
            ->first();

        if ($derniereRequete) {
            $numero = (int) substr($derniereRequete->code_requete, -4) + 1;
        } else {
            $numero = 1;
        }

        return sprintf('REQ-%s-%04d', $annee, $numero);
    }
    public function historiques() { return $this->hasMany(HistoriqueRequete::class, 'requete_id'); }
    public function notifications() { return $this->hasMany(Notification::class, 'requete_id'); }
    public function piecesJointes() { return $this->hasMany(PieceJointe::class, 'requete_id'); }
}
