import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

// Chemins relatifs (4 niveaux pour atteindre services/models depuis pages/etudiant/layout/header-etudiant)
import { AuthService } from '../../../../services/auth.service';
import { NotificationService } from '../../../../services/notification';
import { Notification } from '../../../../models/communication';

@Component({
  selector: 'app-header-etudiant',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header-etudiant.html',
  styleUrls: ['./header-etudiant.scss']
})
export class HeaderEtudiant implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  public notificationService = inject(NotificationService);

  currentUser: any = null;
  showProfileMenu = false;
  showNotifications = false;
  notifications: Notification[] = [];

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadNotifications();
  }

  loadCurrentUser(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser = user;
    }
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (data: Notification[]) => {
        this.notifications = data;
      },
      error: (err: any) => {
        console.error('Erreur notifications:', err);
      }
    });
  }

  markAsRead(id: number): void {
    this.notificationService.markAsRead(id).subscribe({
      next: () => this.loadNotifications(),
      error: (err: any) => console.error(err)
    });
  }

  // --- GESTION DES MENUS ---
  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
    this.showNotifications = false;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showProfileMenu = false;
  }

  closeMenus(): void {
    this.showProfileMenu = false;
    this.showNotifications = false;
  }

  // --- NAVIGATION (Les fonctions qui manquaient) ---
  goToProfile(): void {
    this.router.navigate(['/etudiant/profil']);
    this.closeMenus();
  }

  goToSettings(): void {
    this.router.navigate(['/etudiant/parametres']);
    this.closeMenus();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        console.error(err);
        localStorage.removeItem('auth_token');
        this.router.navigate(['/login']);
      }
    });
  }
}
