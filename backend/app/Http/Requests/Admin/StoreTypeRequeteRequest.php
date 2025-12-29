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
            'nom' => ['required', 'string', 'max:255', 'unique:type_requetes,nom'],
            'description' => ['required', 'string'],
            'service_id' => ['nullable', 'exists:services,id'],
        ];
    }
}
