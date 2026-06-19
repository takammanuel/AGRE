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
        Schema::table('historique_requetes', function (Blueprint $table) {
            if (!Schema::hasColumn('historique_requetes', 'utilisateur_id')) {
                $table->foreignId('utilisateur_id')
                    ->nullable()
                    ->after('requete_id')
                    ->constrained('utilisateurs')
                    ->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('historique_requetes', function (Blueprint $table) {
            $table->dropForeign(['utilisateur_id']);
            $table->dropColumn('utilisateur_id');
        });
    }
};

