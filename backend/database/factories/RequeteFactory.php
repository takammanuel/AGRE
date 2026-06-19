<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Requete;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Requete>
 */
class RequeteFactory extends Factory
{
    protected $model = Requete::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code_requete'    => $this->faker->unique()->bothify('REQ-###'),
            'priorite'        => $this->faker->randomElement(['Haute', 'Normale', 'Basse']),
            'description'     => $this->faker->sentence(10),
            'etudiant_id'     => 1, // ou factory(User::class) si tu veux créer un utilisateur lié
            'agent_id'        => null,
            'responsable_id'  => null,
            'type_requete_id' => 1, // assure-toi qu’un type existe
            'statut'          => $this->faker->randomElement(['En attente', 'Validée', 'Rejetée']),
        ];
    }
}
