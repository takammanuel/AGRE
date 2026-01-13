import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

const API_URL = 'http://localhost:8000/api';

@Component({
  selector: 'app-agent-profil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss']
})
export class AgentProfilComponent implements OnInit {
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
