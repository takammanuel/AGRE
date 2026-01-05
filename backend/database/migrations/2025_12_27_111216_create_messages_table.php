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
            $table->text("contenu"); // contenu long
            $table->foreignId('emetteur_id')
                ->constrained('utilisateurs')
                ->cascadeOnDelete();

            $table->foreignId('recepteur_id')
                ->nullable()
                ->constrained('utilisateurs')
                ->nullOnDelete();

<<<<<<< HEAD
            $table->timestamp("read_at")->nullable(); // date de lecture
=======
            $table->foreignId('requete_id')
                ->nullable()
                ->constrained('requetes')
                ->nullOnDelete();

>>>>>>> 4d88cd1013aa43e270b199e9c2303d76379c9c4a
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
