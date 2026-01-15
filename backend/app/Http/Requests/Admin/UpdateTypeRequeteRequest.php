<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTypeRequeteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $typeRequeteId = $this->route('types_requete');
        
        return [
            'nom' => ['required', 'string', 'max:255', 'unique:type_requetes,nom,' . $typeRequeteId],
            'description' => ['required', 'string'],
            'service_id' => ['nullable', 'exists:services,id'],
        ];
    }
}
