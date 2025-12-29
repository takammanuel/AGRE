import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-header-etudiant',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header-etudiant.html',
  styleUrls: ['./header-etudiant.scss']
})
export class HeaderEtudiant implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser: any = null;
  showProfileMenu = false;
  showNotifications = false;
  notificationCount = 3; // À remplacer par vraies données
  showMobileMenu = false;

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser = user;
    }
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  if (this.showProfileMenu) {
    this.showNotifications = false;
    this.showMobileMenu = false;
  }
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  if (this.showNotifications) {
    this.showProfileMenu = false;
    this.showMobileMenu = false;
  }
  }

  closeMenus(): void {
    this.showProfileMenu = false;
    this.showNotifications = false;
    this.showMobileMenu = false;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Erreur lors de la déconnexion', error);
        localStorage.removeItem('auth_token');
        this.router.navigate(['/login']);
      }
    });
  }

  goToProfile(): void {
    this.router.navigate(['/etudiant/profil']);
    this.closeMenus();
  }

  goToSettings(): void {
    this.router.navigate(['/etudiant/parametres']);
    this.closeMenus();
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }


}
