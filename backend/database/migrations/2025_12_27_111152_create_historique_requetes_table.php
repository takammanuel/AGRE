<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
     Schema::create('historique_requetes', function (Blueprint $table) {
    $table->id();
    $table->dateTime("date_etat");

    $table->foreignId('etat_id')
        ->constrained('etats')
        ->cascadeOnDelete();

    $table->foreignId('requete_id')
        ->constrained('requetes')
        ->cascadeOnDelete();

    // $table->foreignId('utilisateur_id')
    //     ->constrained('utilisateurs')
    //     ->cascadeOnDelete();

    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('historique_requetes');
    }
};
