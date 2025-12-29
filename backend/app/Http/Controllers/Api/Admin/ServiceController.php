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
        $services = Service::paginate(10);

        return response()->json([
            'success' => true,
            'services' => $services
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
    public function destroy(int $id): JsonResponse
    {
        try {
            // Récupérer le service par son ID
            $service = Service::findOrFail($id);

            // Vérifier si le service est utilisé
            if ($service->profilsAgentsAdministratifs()->exists()) {
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

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Service non trouvé.'
            ], 404);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la suppression.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}
