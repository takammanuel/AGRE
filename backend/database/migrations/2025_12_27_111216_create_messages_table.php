<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->text("contenu");

            // Lien vers l'émetteur
            $table->foreignId('emetteur_id')
                ->constrained('utilisateurs')
                ->cascadeOnDelete();

            // Lien vers le récepteur (nullable pour le support)
            $table->foreignId('recepteur_id')
                ->nullable()
                ->constrained('utilisateurs')
                ->nullOnDelete();

            // Ton système de lecture (Notifications)
            $table->timestamp("read_at")->nullable();

            // Lien vers la requête (Indispensable pour ta logique)
            $table->foreignId('requete_id')
                ->nullable()
                ->constrained('requetes')
                ->nullOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
