<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RolePermissionController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | RÔLES
    |--------------------------------------------------------------------------
    */

    /**
     * Liste tous les rôles
     */
    public function roles(): JsonResponse
    {
        $roles = Role::with('permissions')->get();

        return response()->json([
            'success' => true,
            'data' => $roles
        ]);
    }

    /**
     * Afficher un rôle
     */
    public function showRole(Role $role): JsonResponse
    {
        $role->load('permissions');

        return response()->json([
            'success' => true,
            'data' => $role
        ]);
    }

    /**
     * Mettre à jour les permissions d'un rôle
     */
    public function updateRolePermissions(Request $request, Role $role): JsonResponse
    {
        $request->validate([
            'permissions' => ['required', 'array'],
            'permissions.*' => ['exists:permissions,id']
        ]);

        $role->permissions()->sync($request->permissions);

        return response()->json([
            'success' => true,
            'message' => 'Permissions mises à jour avec succès.',
            'data' => $role->load('permissions')
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | PERMISSIONS
    |--------------------------------------------------------------------------
    */

    /**
     * Liste toutes les permissions
     */
    public function permissions(): JsonResponse
    {
        $permissions = Permission::orderBy('libelle')->get();

        return response()->json([
            'success' => true,
            'data' => $permissions
        ]);
    }
}
