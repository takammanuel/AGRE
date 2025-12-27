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
        Schema::create('profil_responsable_pedagogiques', function (Blueprint $table) {
            $table->id();
            $table->string("departement");

            $table->foreignId('utilisateur_id')
                ->unique()
                ->constrained('utilisateurs')
                ->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profil_responsable_pedagogiques');
    }
};
