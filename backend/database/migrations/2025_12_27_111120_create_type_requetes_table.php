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
        Schema::create('type_requetes', function (Blueprint $table) {
            $table->id();
            $table->string("nom");
            $table->text("description")->nullable();
            $table->boolean('necessite_approbation')->default(false);
            $table->integer('delai_traitement_estime')->nullable();
            $table->boolean('est_actif')->default(true);

            $table->foreignId('service_id')
                ->nullable()
                ->constrained('services')
                ->nullOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('type_requetes');
    }
};
