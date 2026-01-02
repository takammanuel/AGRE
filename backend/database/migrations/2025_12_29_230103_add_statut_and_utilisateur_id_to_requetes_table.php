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
    Schema::table('requetes', function (Blueprint $table) {
        $table->string('statut')->default('En attente');

        // si tu veux un lien direct vers l'utilisateur concerné
        $table->foreignId('utilisateur_id')
              ->nullable()
              ->constrained('utilisateurs')
              ->cascadeOnDelete();
    });
}

public function down(): void
{
    Schema::table('requetes', function (Blueprint $table) {
        $table->dropColumn('statut');
        $table->dropConstrainedForeignId('utilisateur_id');
    });
}
};
