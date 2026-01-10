<?php

namespace App\Http\Requests\Etudiant;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasRole('ETUDIANT');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type_requete_id' => 'required|exists:type_requetes,id',
            'description' => 'required|string|min:10|max:5000',
            'priorite' => 'required|in:URGENTE,STANDARD',
            'pieces_jointes' => 'nullable|array|max:5',
            'pieces_jointes.*' => 'file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB max par fichier
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'type_requete_id.required' => 'Le type de requête est obligatoire.',
            'type_requete_id.exists' => 'Le type de requête sélectionné est invalide.',
            'description.required' => 'La description est obligatoire.',
            'description.min' => 'La description doit contenir au moins 10 caractères.',
            'description.max' => 'La description ne peut pas dépasser 5000 caractères.',
            'priorite.required' => 'La priorité est obligatoire.',
            'priorite.in' => 'La priorité doit être URGENTE ou STANDARD.',
            'pieces_jointes.max' => 'Vous ne pouvez pas joindre plus de 5 fichiers.',
            'pieces_jointes.*.file' => 'Chaque pièce jointe doit être un fichier valide.',
            'pieces_jointes.*.mimes' => 'Les fichiers doivent être au format PDF, JPG, JPEG ou PNG.',
            'pieces_jointes.*.max' => 'Chaque fichier ne peut pas dépasser 5 Mo.',
        ];
    }
}

