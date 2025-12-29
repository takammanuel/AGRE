<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class RolePermission extends Pivot
{
    /**
     * La table associée à ce pivot
     */
    protected $table = 'role_permissions';

    /**
     * Les colonnes assignables
     */
    protected $fillable = [
        'role_id',
        'permission_id',
    ];

    /**
     * Relation vers Role
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Relation vers Permission
     */
    public function permission()
    {
        return $this->belongsTo(Permission::class);
    }

    public $timestamps = true;
}
