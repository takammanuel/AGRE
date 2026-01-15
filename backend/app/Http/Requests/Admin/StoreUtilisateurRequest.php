<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUtilisateurRequest extends FormRequest
{
    public function authorize(): bool
    {
        // On vérifiera avec un middleware admin
        return true;
    }

    public function rules(): array
    {
        return [
            'nom' => ['required', 'string', 'max:255'],
            'prenom' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:utilisateurs,email'],
            'password' => ['required', 'string', Password::defaults()],
            'telephone' => ['nullable', 'string', 'max:20'],
            'role' => ['required', 'string', 'exists:roles,nom'], // Étudiant, Agent Académique, etc.
            'is_active' => ['sometimes', 'boolean'],

            // Champs spécifiques selon le rôle
            'profil_data' => ['sometimes', 'array'],
            'profil_data.matricule' => ['required_if:role,Étudiant', 'string', 'max:50', 'unique:profil_etudiants,matricule'],
            'profil_data.filiere' => ['required_if:role,Étudiant', 'string', 'max:100'],
            'profil_data.niveau' => ['required_if:role,Étudiant', 'integer'],
            'profil_data.annee_inscription' => ['nullable', 'date'],

            'profil_data.poste' => ['required_if:role,Agent Académique', 'string', 'max:100'],
            'profil_data.service_id' => ['required_if:role,Agent Académique', 'exists:services,id'],
            'profil_data.date_embauche' => ['nullable', 'date'],

            'profil_data.departement' => ['required_if:role,Responsable Pédagogique', 'string', 'max:100'],
            'profil_data.specialite' => ['nullable', 'string', 'max:100'],

            'profil_data.niveau_acces' => ['required_if:role,Administrateur', 'in:super_admin,admin,moderateur'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'Cet email est déjà utilisé.',
            'role.required' => 'Le rôle est obligatoire.',
            'role.exists' => 'Le rôle sélectionné n\'existe pas.',
            'profil_data.matricule.required_if' => 'Le matricule est obligatoire pour un étudiant.',
            'profil_data.matricule.unique' => 'Ce matricule est déjà utilisé.',
            'profil_data.poste.required_if' => 'Le poste est obligatoire pour un agent.',
            'profil_data.service_id.required_if' => 'Le service est obligatoire pour un agent.',
            'profil_data.departement.required_if' => 'Le département est obligatoire pour un responsable pédagogique.',
        ];
    }
}
