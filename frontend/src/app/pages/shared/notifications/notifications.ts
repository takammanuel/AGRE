import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';
import { DashboardConfigService } from '../../../services/dashboard-config.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css']
})
export class NotificationsComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private dashboardConfigService = inject(DashboardConfigService);

  notifications: any[] = [];
  loading = true;
  userId: number | null = null;

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userId = user.id;
      this.loadNotifications();
    }
  }

  loadNotifications(): void {
    if (!this.userId) return;
    this.loading = true;
    this.notificationService.getNotifications(this.userId).subscribe({
      next: (res: any) => {
        this.notifications = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  markAsRead(notification: any): void {
    if (!notification.is_read) {
      this.notificationService.markAsRead(notification.id).subscribe(() => {
        notification.is_read = true;
        this.notificationService.refreshCount();
      });
    }
  }

  goToConversation(notification: any): void {
    // Marquer comme lu
    if (!notification.is_read) {
      this.notificationService.markAsRead(notification.id).subscribe(() => {
        notification.is_read = true;
        this.notificationService.refreshCount();
      });
    }
    
    // Rediriger vers la messagerie si requete_id existe
    if (notification.requete_id) {
      const role = this.getRolePrefix();
      this.router.navigate([`/${role}/messagerie`, notification.requete_id]);
    }
  }

  private getRolePrefix(): string {
    const config = this.dashboardConfigService.getDashboardConfig();
    switch (config.role) {
      case 'ADMINISTRATEUR': return 'admin';
      case 'AGENT_ACADEMIQUE': return 'agent';
      case 'RESPONSABLE_PEDAGOGIQUE': return 'responsable';
      default: return 'etudiant';
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(notif => {
      if (!notif.is_read) {
        this.notificationService.markAsRead(notif.id).subscribe();
        notif.is_read = true;
      }
    });
    this.notificationService.refreshCount();
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'CHAT': return 'bi-chat-dots';
      case 'REQUETE': return 'bi-file-earmark-text';
      case 'URGENT': return 'bi-exclamation-triangle';
      case 'SUCCESS': return 'bi-check-circle';
      default: return 'bi-bell';
    }
  }

  getNotificationClass(type: string): string {
    switch (type) {
      case 'CHAT': return 'text-primary bg-primary-subtle';
      case 'REQUETE': return 'text-info bg-info-subtle';
      case 'URGENT': return 'text-warning bg-warning-subtle';
      case 'SUCCESS': return 'text-success bg-success-subtle';
      default: return 'text-secondary bg-secondary-subtle';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
