<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTypeRequeteRequest;
use App\Http\Requests\Admin\UpdateTypeRequeteRequest;
use App\Models\Service;
use App\Models\TypeRequete;
use Illuminate\Http\JsonResponse;

class TypeRequeteController extends Controller
{
    /**
     * Liste tous les types de requêtes
     */
    public function index(): JsonResponse
    {
        $types = TypeRequete::with('service')->paginate(10);

        return response()->json([
            'success' => true,
            'types_requetes' => $types
        ]);
    }

    public function typeRequestForStudents(): JsonResponse
    {
        $types = TypeRequete::with('service')->get();

        return response()->json([
            'success' => true,
            'types_requetes' => $types
        ]);
    }

    /**
     * Afficher un type de requête
     */
    public function show(TypeRequete $typeRequete): JsonResponse
    {
        $typeRequete->load('service');

        return response()->json([
            'success' => true,
            'data' => $typeRequete
        ]);
    }

    /**
     * Créer un nouveau type de requête
     */
    public function store(StoreTypeRequeteRequest $request): JsonResponse
    {
        $typeRequete = TypeRequete::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Type de requête créé avec succès.',
            'data' => $typeRequete->load('service')
        ], 201);
    }

    /**
     * Mettre à jour un type de requête
     */
    public function update(UpdateTypeRequeteRequest $request, TypeRequete $typeRequete): JsonResponse
    {
        \Log::info('=== UPDATE TYPE REQUÊTE ===');
        \Log::info('ID: ' . $typeRequete->id);
        \Log::info('Données reçues: ', $request->validated());
        
        $typeRequete->update($request->validated());
        $typeRequete->refresh();
        
        \Log::info('Type mis à jour: ', $typeRequete->toArray());

        return response()->json([
            'success' => true,
            'message' => 'Type de requête modifié avec succès.',
            'data' => $typeRequete->load('service')
        ]);
    }

    /**
     * Supprimer un type de requête
     */
    public function destroy(TypeRequete $typeRequete): JsonResponse
    {
        \Log::info('=== DELETE TYPE REQUÊTE ===');
        \Log::info('ID: ' . $typeRequete->id);
        
        // Vérifier si le type est utilisé dans des requêtes
        $nbRequetes = $typeRequete->requetes()->count();
        \Log::info('Nombre de requêtes utilisant ce type: ' . $nbRequetes);
        
        if ($nbRequetes > 0) {
            \Log::warning('Suppression refusée: type utilisé dans ' . $nbRequetes . ' requête(s)');
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer ce type car il est utilisé dans des requêtes.'
            ], 422);
        }

        $typeRequete->delete();
        \Log::info('Type supprimé avec succès');
        
        return response()->json([
            'success' => true,
            'message' => 'Type de requête supprimé avec succès.'
        ]);
    }
}
