import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../services/notification';
import { Notification } from '../../../models/communication';

@Component({
  selector: 'app-notifications-list',
  standalone: true,
  imports: [CommonModule],
  // CORRECTION ICI : suppression de ".component" et changement de ".scss" en ".css"
  templateUrl: './notifications-list.html',
  styleUrls: ['./notifications-list.css']
})
export class NotificationsListComponent implements OnInit {
  private notificationService = inject(NotificationService);
  notifications: Notification[] = [];

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (data: Notification[]) => {
        this.notifications = data;
      },
      error: (err) => console.error('Erreur de chargement:', err)
    });
  }

  markAsRead(id: number): void {
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        this.loadNotifications();
      }
    });
  }
}
