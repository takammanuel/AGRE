<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

   protected $fillable = [
    'titre',
    'message',
    'requete_id',
    'utilisateur_id',
    'is_read',
    'type', // AJOUTE CECI pour que le type CHAT soit enregistré
];

    public function requete()
    {
        return $this->belongsTo(Requete::class, 'requete_id');
    }

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'utilisateur_id');
    }

    public function estLue(): bool
    {
        return (bool) $this->is_read;
    }
}
