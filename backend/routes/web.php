<?php

use App\Http\Controllers\Api\Auth\VerificationController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/email/verify/{id}/{hash}', [VerificationController::class, 'verify'])
    ->middleware(['signed'])
    ->name('verification.verify');

// Route pour renvoyer l'email (optionnel)
Route::post('/email/resend/{userId}', [VerificationController::class, 'resend'])
    ->name('verification.resend');
