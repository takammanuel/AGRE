import { Component, OnInit, OnDestroy, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { DashboardConfigService, DashboardConfig } from '../../../../services/dashboard-config.service';
import { SearchRequeteComponent } from '../../../../components/search-requete/search-requete.component';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'app-header-dashboard',
  standalone: true,
  imports: [CommonModule, SearchRequeteComponent],
  templateUrl: './header-dashboard.html',
  styleUrls: ['./header-dashboard.scss']
})
export class HeaderDashboardComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();

  private authService = inject(AuthService);
  private router = inject(Router);
  private dashboardConfigService = inject(DashboardConfigService);
  private notificationService = inject(NotificationService);

  currentUser: any = null;
  config!: DashboardConfig;
  showProfileMenu = false;
  showNotifications = false;
  notificationCount = 0;
  notifications: any[] = [];
  private countSubscription?: Subscription;

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.config = this.dashboardConfigService.getDashboardConfig();

    // S'abonner au compteur de notifications
    this.countSubscription = this.notificationService.unreadCount$.subscribe(count => {
      this.notificationCount = count;
    });

    // Charger les notifications et forcer le refresh du compteur
    this.loadNotifications();
    this.notificationService.refreshCount();
  }

  ngOnDestroy(): void {
    if (this.countSubscription) {
      this.countSubscription.unsubscribe();
    }
  }

  loadNotifications(): void {
    if (this.currentUser?.id) {
      this.notificationService.getNotifications(this.currentUser.id).subscribe({
        next: (res: any) => {
          this.notifications = (res.data || []).slice(0, 5); // Limiter à 5 notifications
        },
        error: (err) => console.error('Erreur chargement notifications', err)
      });
    }
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
    this.showNotifications = false;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showProfileMenu = false;
    if (this.showNotifications) {
      this.loadNotifications();
    }
  }

  closeMenus(): void {
    this.showProfileMenu = false;
    this.showNotifications = false;
  }

  markAsRead(notification: any): void {
    if (!notification.is_read) {
      this.notificationService.markAsRead(notification.id).subscribe(() => {
        notification.is_read = true;
        this.notificationService.refreshCount();
      });
    }
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'CHAT': return 'bi-chat-dots text-primary';
      case 'REQUETE': return 'bi-file-earmark-text text-info';
      case 'URGENT': return 'bi-exclamation-triangle text-warning';
      case 'SUCCESS': return 'bi-check-circle text-success';
      default: return 'bi-bell text-secondary';
    }
  }

  getNotificationBgClass(type: string): string {
    switch (type) {
      case 'CHAT': return 'bg-primary-light';
      case 'REQUETE': return 'bg-info-light';
      case 'URGENT': return 'bg-warning-light';
      case 'SUCCESS': return 'bg-success-light';
      default: return 'bg-secondary-light';
    }
  }

  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  }

  goToNotifications(): void {
    const role = this.getRolePrefix();
    this.router.navigate([`/${role}/notifications`]);
    this.closeMenus();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }

  goToProfile(): void {
    const role = this.getRolePrefix();
    this.router.navigate([`/${role}/profil`]);
    this.closeMenus();
  }

  goToSettings(): void {
    const role = this.getRolePrefix();
    this.router.navigate([`/${role}/parametres`]);
    this.closeMenus();
  }

  navigateToSection(role: string): void {
    switch(role) {
      case 'ETUDIANT':
        this.router.navigate(['/etudiant/nouvelle-requete']);
        break;
      case 'AGENT_ACADEMIQUE':
        this.router.navigate(['/agent/requetes-affectees']);
        break;
      case 'RESPONSABLE_PEDAGOGIQUE':
        this.router.navigate(['/responsable/requetes-en-attente']);
        break;
      case 'ADMINISTRATEUR':
        this.router.navigate(['/admin/utilisateurs']);
        break;
    }
  }

  private getRolePrefix(): string {
    switch (this.config.role) {
      case 'ADMINISTRATEUR': return 'admin';
      case 'AGENT_ACADEMIQUE': return 'agent';
      case 'RESPONSABLE_PEDAGOGIQUE': return 'responsable';
      default: return 'etudiant';
    }
  }
}
