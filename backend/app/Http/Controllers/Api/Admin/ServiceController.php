<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreServiceRequest;
use App\Http\Requests\Admin\UpdateServiceRequest;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    /**
     * Liste tous les services
     */
    public function index(): JsonResponse
    {
        $services = Service::orderBy('nom')->get();

        return response()->json([
            'success' => true,
            'data' => $services
        ]);
    }

    /**
     * Afficher un service
     */
    public function show(Service $service): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $service
        ]);
    }

    /**
     * Créer un nouveau service
     */
    public function store(StoreServiceRequest $request): JsonResponse
    {
        $service = Service::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Service créé avec succès.',
            'data' => $service
        ], 201);
    }

    /**
     * Mettre à jour un service
     */
    public function update(UpdateServiceRequest $request, Service $service): JsonResponse
    {
        $service->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Service modifié avec succès.',
            'data' => $service
        ]);
    }

    /**
     * Supprimer un service
     */
    public function destroy(Service $service): JsonResponse
    {
        // Vérifier si le service est utilisé
        if ($service->agents()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer ce service car il est attribué à des agents.'
            ], 422);
        }

        $service->delete();

        return response()->json([
            'success' => true,
            'message' => 'Service supprimé avec succès.'
        ]);
    }
}
