import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

const API_URL = 'http://localhost:8000/api';

@Component({
  selector: 'app-responsable-profil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profil-container">
      <div class="page-header">
        <h2><i class="bi bi-person-circle"></i> Mon Profil</h2>
        <p class="text-muted">Gérez vos informations personnelles</p>
      </div>

      <!-- Messages -->
      <div *ngIf="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
        <i class="bi bi-check-circle"></i> {{ successMessage }}
        <button type="button" class="btn-close" (click)="successMessage = ''"></button>
      </div>

      <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="bi bi-exclamation-triangle"></i> {{ errorMessage }}
        <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>

      <!-- Profil Content -->
      <div *ngIf="!isLoading && user" class="row">
        <!-- Carte Profil -->
        <div class="col-md-4">
          <div class="profile-card">
            <div class="profile-header">
              <div class="profile-avatar">
                <i class="bi bi-person-circle"></i>
              </div>
              <h4>{{ user.nom }} {{ user.prenom }}</h4>
              <p class="role-badge">
                <i class="bi bi-shield-check"></i> Responsable Pédagogique
              </p>
            </div>
            <div class="profile-info">
              <div class="info-item">
                <i class="bi bi-envelope"></i>
                <span>{{ user.email }}</span>
              </div>
              <div class="info-item">
                <i class="bi bi-calendar"></i>
                <span>Membre depuis {{ user.created_at | date: 'MMMM yyyy' }}</span>
              </div>
            </div>
          </div>

          <!-- Actions Dangereuses -->
          <div class="danger-zone">
            <h5><i class="bi bi-exclamation-triangle"></i> Zone Dangereuse</h5>
            <p class="text-muted">Actions irréversibles</p>
            <button
              class="btn btn-danger w-100"
              (click)="confirmDelete()"
              [disabled]="isDeleting"
            >
              <i class="bi bi-trash"></i>
              <span *ngIf="!isDeleting">Supprimer mon compte</span>
              <span *ngIf="isDeleting">
                <span class="spinner-border spinner-border-sm me-2"></span>
                Suppression...
              </span>
            </button>
          </div>
        </div>

        <!-- Formulaires -->
        <div class="col-md-8">
          <!-- Modifier Informations -->
          <div class="card mb-4">
            <div class="card-header">
              <h5><i class="bi bi-pencil"></i> Modifier mes informations</h5>
            </div>
            <div class="card-body">
              <form (ngSubmit)="updateProfile()" #profileForm="ngForm">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Nom *</label>
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="profileData.nom"
                      name="nom"
                      required
                    />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Prénom *</label>
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="profileData.prenom"
                      name="prenom"
                      required
                    />
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Email *</label>
                  <input
                    type="email"
                    class="form-control"
                    [(ngModel)]="profileData.email"
                    name="email"
                    required
                  />
                </div>

                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="isUpdating || !profileForm.valid"
                >
                  <i class="bi bi-save"></i>
                  <span *ngIf="!isUpdating">Enregistrer les modifications</span>
                  <span *ngIf="isUpdating">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Enregistrement...
                  </span>
                </button>
              </form>
            </div>
          </div>

          <!-- Changer Mot de Passe -->
          <div class="card">
            <div class="card-header">
              <h5><i class="bi bi-key"></i> Changer mon mot de passe</h5>
            </div>
            <div class="card-body">
              <form (ngSubmit)="changePassword()" #passwordForm="ngForm">
                <div class="mb-3">
                  <label class="form-label">Mot de passe actuel *</label>
                  <input
                    type="password"
                    class="form-control"
                    [(ngModel)]="passwordData.current_password"
                    name="current_password"
                    required
                  />
                </div>

                <div class="mb-3">
                  <label class="form-label">Nouveau mot de passe *</label>
                  <input
                    type="password"
                    class="form-control"
                    [(ngModel)]="passwordData.new_password"
                    name="new_password"
                    required
                    minlength="8"
                  />
                  <small class="text-muted">Minimum 8 caractères</small>
                </div>

                <div class="mb-3">
                  <label class="form-label">Confirmer le nouveau mot de passe *</label>
                  <input
                    type="password"
                    class="form-control"
                    [(ngModel)]="passwordData.new_password_confirmation"
                    name="new_password_confirmation"
                    required
                  />
                </div>

                <button
                  type="submit"
                  class="btn btn-warning"
                  [disabled]="isChangingPassword || !passwordForm.valid"
                >
                  <i class="bi bi-shield-lock"></i>
                  <span *ngIf="!isChangingPassword">Changer le mot de passe</span>
                  <span *ngIf="isChangingPassword">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Modification...
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profil-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .page-header h2 {
      color: #2c3e50;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .page-header h2 i {
      margin-right: 0.75rem;
      color: var(--responsable-color, #6f42c1);
    }

    .profile-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      margin-bottom: 1.5rem;
    }

    .profile-header {
      background: linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%);
      padding: 2rem;
      text-align: center;
      color: white;
    }

    .profile-avatar {
      width: 100px;
      height: 100px;
      margin: 0 auto 1rem;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid rgba(255, 255, 255, 0.3);
    }

    .profile-avatar i {
      font-size: 4rem;
      color: white;
    }

    .profile-header h4 {
      margin: 0;
      font-weight: 600;
    }

    .role-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      margin-top: 0.5rem;
      font-size: 0.875rem;
    }

    .profile-info {
      padding: 1.5rem;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .info-item:last-child {
      border-bottom: none;
    }

    .info-item i {
      color: #6f42c1;
      font-size: 1.25rem;
    }

    .danger-zone {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border: 2px solid #dc3545;
    }

    .danger-zone h5 {
      color: #dc3545;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .danger-zone h5 i {
      margin-right: 0.5rem;
    }

    .card {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border: none;
    }

    .card-header {
      background: linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%);
      color: white;
      border-radius: 12px 12px 0 0 !important;
      padding: 1rem 1.5rem;
    }

    .card-header h5 {
      margin: 0;
      font-weight: 600;
    }

    .card-header h5 i {
      margin-right: 0.5rem;
    }

    .form-label {
      font-weight: 500;
      color: #495057;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      font-weight: 500;
      border-radius: 8px;
    }

    .btn i {
      margin-right: 0.5rem;
    }

    @media (max-width: 768px) {
      .profil-container {
        padding: 1rem;
      }
    }
  `]
})
export class ResponsableProfilComponent implements OnInit {
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);

  user: any = null;
  isLoading = false;
  isUpdating = false;
  isChangingPassword = false;
  isDeleting = false;
  successMessage = '';
  errorMessage = '';

  profileData = {
    nom: '',
    prenom: '',
    email: ''
  };

  passwordData = {
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  };

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.http.get<any>(`${API_URL}/auth/profile`).subscribe({
      next: (response) => {
        if (response.success) {
          this.user = response.data;
          this.profileData = {
            nom: this.user.nom,
            prenom: this.user.prenom,
            email: this.user.email
          };
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement du profil';
        this.isLoading = false;
      }
    });
  }

  updateProfile(): void {
    this.isUpdating = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.http.put<any>(`${API_URL}/auth/profile`, this.profileData).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = 'Profil mis à jour avec succès';
          this.user = response.data;
          // Mettre à jour les données dans le localStorage
          const currentUser = this.authService.getCurrentUser();
          if (currentUser) {
            currentUser.nom = this.user.nom;
            currentUser.prenom = this.user.prenom;
            currentUser.email = this.user.email;
            localStorage.setItem('user', JSON.stringify(currentUser));
          }
        }
        this.isUpdating = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Erreur lors de la mise à jour';
        this.isUpdating = false;
      }
    });
  }

  changePassword(): void {
    if (this.passwordData.new_password !== this.passwordData.new_password_confirmation) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.isChangingPassword = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.http.put<any>(`${API_URL}/auth/profile/password`, this.passwordData).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = 'Mot de passe modifié avec succès';
          this.passwordData = {
            current_password: '',
            new_password: '',
            new_password_confirmation: ''
          };
        }
        this.isChangingPassword = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Erreur lors du changement de mot de passe';
        this.isChangingPassword = false;
      }
    });
  }

  confirmDelete(): void {
    const confirmation = confirm(
      '⚠️ ATTENTION ⚠️\n\n' +
      'Êtes-vous sûr de vouloir supprimer votre compte?\n\n' +
      'Cette action est IRRÉVERSIBLE et entraînera:\n' +
      '- La suppression de toutes vos données\n' +
      '- La perte d\'accès à votre compte\n' +
      '- La suppression de votre historique\n\n' +
      'Tapez "SUPPRIMER" pour confirmer'
    );

    if (confirmation) {
      const finalConfirm = prompt('Tapez "SUPPRIMER" en majuscules pour confirmer:');
      if (finalConfirm === 'SUPPRIMER') {
        this.deleteAccount();
      } else {
        alert('Suppression annulée');
      }
    }
  }

  deleteAccount(): void {
    this.isDeleting = true;
    this.errorMessage = '';

    this.http.delete<any>(`${API_URL}/auth/profile`).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Votre compte a été supprimé avec succès');
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        this.isDeleting = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Erreur lors de la suppression du compte';
        this.isDeleting = false;
      }
    });
  }
}

