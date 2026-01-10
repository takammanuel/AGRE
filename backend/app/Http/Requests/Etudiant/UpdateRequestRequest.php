<?php

namespace App\Http\Requests\Etudiant;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRequestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $requete = $this->route('requete');
        return $this->user()->id === $requete->etudiant_id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'informations_complementaires' => 'required|string|min:10|max:2000',
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
            'informations_complementaires.required' => 'Les informations complémentaires sont obligatoires.',
            'informations_complementaires.min' => 'Les informations doivent contenir au moins 10 caractères.',
            'informations_complementaires.max' => 'Les informations ne peuvent pas dépasser 2000 caractères.',
        ];
    }
}

