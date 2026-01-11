<?php

namespace App\Events;

use App\Models\Requete;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RequestStatusChanged
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $requete;

    /**
     * Create a new event instance.
     */
    public function __construct(Requete $requete)
    {
        $this->requete = $requete;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return Channel[]
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('requests'), // ou PrivateChannel si tu veux sécuriser
        ];
    }
}
