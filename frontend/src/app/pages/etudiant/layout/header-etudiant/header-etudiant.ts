import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

// Chemins remontant à la racine de app/
import { AuthService } from '../../../../services/auth.service';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'app-header-etudiant',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header-etudiant.html',
  styleUrls: ['./header-etudiant.scss']
})
export class HeaderEtudiant implements OnInit {
  // Conservation du "as any" pour ton environnement
  public notificationService = inject(NotificationService) as any;
  public authService = inject(AuthService) as any;
  private router = inject(Router);

  currentUser: any = null;
  notifications: any[] = [];
  showNotifications = false;
  showProfileMenu = false;
  showMobileMenu = false;

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser?.();
    // Initialiser le compteur au chargement
    if (this.currentUser?.id) {
       this.notificationService.refreshCount();
    }
    this.loadNotifications();
  }

  loadNotifications(): void {
    const userId = this.currentUser?.id || 1;
    this.notificationService.getNotifications(userId).subscribe({
      next: (res: any) => this.notifications = res.data || res,
      error: (err: any) => console.error('Erreur notifications:', err)
    });
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showProfileMenu = false;
    if (this.showNotifications) this.loadNotifications();
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
    this.showNotifications = false;
  }

  closeMenus(): void {
    this.showNotifications = false;
    this.showProfileMenu = false;
  }

  markAsRead(id: number): void {
    // Trouver la notification pour savoir si c'est un chat
    const notif = this.notifications.find(n => n.id === id);

    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        this.notificationService.refreshCount(); // Mise à jour du badge rouge
        this.loadNotifications();

        // Redirection si c'est une notification liée à un message
        if (notif && notif.requete_id && (notif.type === 'CHAT' || notif.titre?.includes('message'))) {
          this.router.navigate(['/etudiant/messagerie', notif.requete_id]);
          this.closeMenus();
        }
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

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }
}
