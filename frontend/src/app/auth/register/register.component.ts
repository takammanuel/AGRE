import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Pour afficher/masquer le mot de passe
  showPassword = false;
  showConfirmPassword = false;

  constructor() {
    this.registerForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      prenom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.pattern(/^[+]?[0-9\s\-\(\)]{10,}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]]
    });
  }

  // Getters pour faciliter l'accès aux contrôles
  get nom() { return this.registerForm.get('nom'); }
  get prenom() { return this.registerForm.get('prenom'); }
  get email() { return this.registerForm.get('email'); }
  get telephone() { return this.registerForm.get('telephone'); }
  get password() { return this.registerForm.get('password'); }
  get password_confirmation() { return this.registerForm.get('password_confirmation'); }
  get acceptTerms() { return this.registerForm.get('acceptTerms'); }

  // Basculer la visibilité du mot de passe
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    // Vérifier que les mots de passe correspondent
    if (this.registerForm.value.password !== this.registerForm.value.password_confirmation) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Préparer les données pour l'API
    const formData = {
      nom: this.registerForm.value.nom,
      prenom: this.registerForm.value.prenom,
      email: this.registerForm.value.email,
      telephone: this.registerForm.value.telephone || null,
      password: this.registerForm.value.password,
      password_confirmation: this.registerForm.value.password_confirmation
    };

    // Appel à l'API d'inscription
    this.authService.register(formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response.message || 'Inscription réussie ! Veuillez vérifier votre email.';

        // Rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          this.router.navigate(['/login'], {
            queryParams: { registered: 'true' }
          });
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;

        // Gestion des erreurs spécifiques
        if (error.status === 422 && error.error.errors) {
          // Erreurs de validation Laravel
          const errors = error.error.errors;
          if (errors.email) {
            this.errorMessage = errors.email[0];
          } else if (errors.password) {
            this.errorMessage = errors.password[0];
          } else {
            this.errorMessage = 'Veuillez vérifier les informations saisies.';
          }
        } else if (error.status === 400) {
          this.errorMessage = 'Données invalides.';
        } else if (error.status === 409) {
          this.errorMessage = 'Cet email est déjà utilisé.';
        } else {
          this.errorMessage = 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.';
        }
      }
    });
  }

  // Marquer tous les champs comme touchés pour afficher les erreurs
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}
