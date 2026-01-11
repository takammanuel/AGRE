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

    public function historiques() { return $this->hasMany(HistoriqueRequete::class, 'requete_id'); }
    public function notifications() { return $this->hasMany(Notification::class, 'requete_id'); }
    public function piecesJointes() { return $this->hasMany(PieceJointe::class, 'requete_id'); }
}
