<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Modifier la colonne enum pour ajouter les nouveaux états
        DB::statement("ALTER TABLE etats MODIFY COLUMN libelle ENUM('EN_ATTENTE', 'AFFECTEE', 'EN_COURS', 'TRAITEE', 'REJETEE', 'INFORMATIONS_REQUISES', 'EN_ATTENTE_APPROBATION')");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Supprimer les nouveaux états (on garde seulement les 4 initiaux)
        DB::statement("ALTER TABLE etats MODIFY COLUMN libelle ENUM('EN_ATTENTE', 'EN_COURS', 'TRAITEE', 'REJETEE')");
    }
};

