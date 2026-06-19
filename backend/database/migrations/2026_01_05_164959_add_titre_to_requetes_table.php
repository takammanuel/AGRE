<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('requetes', function (Blueprint $table) {
            // On ajoute la colonne titre après le code_requete
            // On la met en nullable au cas où il y aurait déjà des données
            $table->string('titre')->after('code_requete')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('requetes', function (Blueprint $table) {
            $table->dropColumn('titre');
        });
    }
};
