<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UpdateUtilisateurRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('id');

        return [
            'nom' => ['sometimes', 'string', 'max:255'],
            'prenom' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', 'unique:utilisateurs,email,' . $userId],
            'password' => ['sometimes', 'string', Password::defaults()],
            'telephone' => ['nullable', 'string', 'max:20'],
            'is_active' => ['sometimes', 'boolean'],

            // Profil data (optionnel en modification)
            'profil_data' => ['sometimes', 'array'],
            'profil_data.matricule' => ['sometimes', 'string', 'max:50'],
            'profil_data.filiere' => ['sometimes', 'string', 'max:100'],
            'profil_data.niveau' => ['sometimes', 'integer'],
            'profil_data.annee_inscription' => ['nullable', 'date'],
            'profil_data.poste' => ['sometimes', 'string', 'max:100'],
            'profil_data.service_id' => ['sometimes', 'exists:services,id'],
            'profil_data.date_embauche' => ['nullable', 'date'],
            'profil_data.departement' => ['sometimes', 'string', 'max:100'],
            'profil_data.specialite' => ['nullable', 'string', 'max:100'],
            'profil_data.niveau_acces' => ['sometimes', 'in:super_admin,admin,moderateur'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'Cet email est déjà utilisé par un autre utilisateur.',
        ];
    }
}
