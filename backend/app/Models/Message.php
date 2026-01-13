<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    use HasFactory;

    protected $table = 'messages';

    protected $fillable = [
        'emetteur_id',
        'recepteur_id',
        'requete_id',
        'read_at',
    ];

    public function emetteur()
    {
        return $this->belongsTo(Utilisateur::class, 'emetteur_id');
    }

    public function recepteur()
    {
        return $this->belongsTo(Utilisateur::class, 'recepteur_id');
    }

    public function requete()
    {
        return $this->belongsTo(Requete::class, 'requete_id');
    }

    public function estLu(): bool
    {
        return !is_null($this->read_at);
    }
}
