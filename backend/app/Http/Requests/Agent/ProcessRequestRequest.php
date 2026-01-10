<?php

namespace App\Http\Requests\Agent;

use Illuminate\Foundation\Http\FormRequest;

class ProcessRequestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasRole('AGENT_ACADEMIQUE');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'action' => 'required|in:validate,reject,request_info,escalate',
            'commentaire' => 'required_if:action,reject|nullable|string|max:1000',
            'document' => 'nullable|file|mimes:pdf|max:10240', // 10MB max pour documents générés
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
            'action.required' => 'L\'action est obligatoire.',
            'action.in' => 'L\'action doit être : validate, reject, request_info ou escalate.',
            'commentaire.required_if' => 'Un commentaire est obligatoire lors du rejet.',
            'commentaire.max' => 'Le commentaire ne peut pas dépasser 1000 caractères.',
            'document.file' => 'Le document doit être un fichier valide.',
            'document.mimes' => 'Le document doit être au format PDF.',
            'document.max' => 'Le document ne peut pas dépasser 10 Mo.',
        ];
    }
}

