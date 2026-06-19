import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-notifications-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notifications-list.html',
  styleUrls: ['./notifications-list.css']
})
export class NotificationsListComponent implements OnInit {
  public notificationService = inject(NotificationService);
  public authService = inject(AuthService);
  private router = inject(Router);

  notifications: any[] = [];
  userId: number | null = null;

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userId = user.id;
      this.load();
    }
  }

  load(): void {
    if (!this.userId) return;
    this.notificationService.getNotifications(this.userId).subscribe({
      next: (res: any) => {
        this.notifications = res.data || [];
      },
      error: (err) => {
        console.error('Erreur lors du chargement des notifications:', err);
      }
    });
  }

  markAsRead(id: number, event?: Event): void {
    // Empêcher la propagation de l'événement pour éviter la navigation
    if (event) {
      event.stopPropagation();
    }

    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        this.notificationService.refreshCount();
        this.load();
      },
      error: (err) => {
        console.error('Erreur lors du marquage comme lu:', err);
      }
    });
  }

  markAllAsRead(): void {
    const unreadIds = this.notifications
      .filter(n => !n.is_read)
      .map(n => n.id);

    if (unreadIds.length === 0) return;

    // Marquer toutes les notifications non lues
    unreadIds.forEach((id, index) => {
      this.notificationService.markAsRead(id).subscribe({
        next: () => {
          // Rafraîchir seulement après la dernière notification
          if (index === unreadIds.length - 1) {
            this.notificationService.refreshCount();
            this.load();
          }
        }
      });
    });
  }

  navigateToRequete(notif: any): void {
    // Marquer comme lu si ce n'est pas déjà fait
    if (!notif.is_read) {
      this.markAsRead(notif.id);
    }

    // Navigation selon le rôle
    const role = this.authService.getUserRole();
    if (role === 'AGENT_ACADEMIQUE') {
      this.router.navigate(['/agent/messagerie', notif.requete_id]);
    } else if (role === 'ETUDIANT') {
      this.router.navigate(['/etudiant/messagerie', notif.requete_id]);
    } else if (role === 'RESPONSABLE_PEDAGOGIQUE') {
      this.router.navigate(['/responsable/messagerie', notif.requete_id]);
    }
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.is_read).length;
  }
}
