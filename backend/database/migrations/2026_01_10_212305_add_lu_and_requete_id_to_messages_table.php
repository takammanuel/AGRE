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
        Schema::table('messages', function (Blueprint $table) {
            $table->boolean('lu')->default(false)->after('contenu');

            // Modifier le type de contenu de string à text pour permettre des messages plus longs
            $table->text('contenu')->change();

            // Ajouter des index pour améliorer les performances
            $table->index(['emetteur_id', 'recepteur_id']);
            $table->index('lu');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn('lu');
            $table->dropIndex(['emetteur_id', 'recepteur_id']);
            $table->dropIndex(['lu']);
        });
    }
};
