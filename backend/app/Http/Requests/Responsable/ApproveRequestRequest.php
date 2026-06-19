<?php

namespace App\Http\Requests\Responsable;

use Illuminate\Foundation\Http\FormRequest;

class ApproveRequestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasRole('RESPONSABLE_PEDAGOGIQUE');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'action' => 'required|in:approve,reject,request_info,escalate',
            'commentaire' => 'required_if:action,reject|nullable|string|max:1000',
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
            'action.in' => 'L\'action doit être : approve, reject, request_info ou escalate.',
            'commentaire.required_if' => 'Un commentaire est obligatoire lors du rejet.',
            'commentaire.max' => 'Le commentaire ne peut pas dépasser 1000 caractères.',
        ];
    }
}

