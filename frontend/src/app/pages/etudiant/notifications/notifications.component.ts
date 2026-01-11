import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationService, Notification } from '../../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  private notificationService = inject(NotificationService);
  
  notifications: Notification[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.error = null;
    
    this.notificationService.getNotifications().subscribe({
      next: (response) => {
        this.notifications = response.data.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des notifications:', err);
        this.error = 'Impossible de charger les notifications';
        this.loading = false;
      }
    });
  }

  get hasUnreadNotifications(): boolean {
    return this.notifications.some(n => !n.lu);
  }

  markAsRead(notification: Notification): void {
    if (!notification.lu) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          notification.lu = true;
        },
        error: (err) => {
          console.error('Erreur lors du marquage:', err);
        }
      });
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.lu = true);
      },
      error: (err) => {
        console.error('Erreur:', err);
      }
    });
  }

  deleteNotification(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer cette notification ?')) {
      this.notificationService.deleteNotification(id).subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => n.id !== id);
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
        }
      });
    }
  }

  getNotificationIcon(notification: Notification): string {
    if (notification.titre.includes('créée')) return 'bi-plus-circle';
    if (notification.titre.includes('prise en charge')) return 'bi-person-check';
    if (notification.titre.includes('traitée')) return 'bi-check-circle';
    if (notification.titre.includes('rejetée')) return 'bi-x-circle';
    return 'bi-bell';
  }

  getNotificationClass(notification: Notification): string {
    if (notification.titre.includes('créée')) return 'notif-created';
    if (notification.titre.includes('prise en charge')) return 'notif-progress';
    if (notification.titre.includes('traitée')) return 'notif-completed';
    if (notification.titre.includes('rejetée')) return 'notif-rejected';
    return 'notif-default';
  }
}
