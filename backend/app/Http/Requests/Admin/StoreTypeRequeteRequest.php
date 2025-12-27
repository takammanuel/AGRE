<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreTypeRequeteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'libelle' => ['required', 'string', 'max:255', 'unique:type_requetes,libelle'],
            'description' => ['required', 'string'],
            'service_id' => ['nullable', 'exists:services,id'],
        ];
    }
}
