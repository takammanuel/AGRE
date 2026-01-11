import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // 1. IMPORTÉ ICI
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-notifications-list',
  standalone: true,
  imports: [CommonModule, RouterModule], // 2. AJOUTÉ AUX IMPORTS
  templateUrl: './notifications-list.html',
  styleUrl: './notifications-list.css'
})
export class NotificationsListComponent implements OnInit {
  public notificationService = inject(NotificationService);
  public authService = inject(AuthService); // 3. PASSÉ EN PUBLIC (obligatoire pour le HTML)

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
      }
    });
  }

  markAsRead(id: number): void {
    this.notificationService.markAsRead(id).subscribe(() => {
      this.notificationService.refreshCount();
      this.load();
    });
  }
}
