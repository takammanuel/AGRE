<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profil_administrateurs', function (Blueprint $table) {
            $table->id();
            $table->enum('niveau_acces', ['super_admin', 'admin'])->default('admin');

            $table->foreignId('utilisateur_id')
                ->unique()
                ->constrained('utilisateurs')
                ->cascadeOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profil_administrateurs');
    }
};
