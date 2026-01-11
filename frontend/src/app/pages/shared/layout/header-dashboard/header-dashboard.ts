import { Component, OnInit, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { DashboardConfigService, DashboardConfig } from '../../../../services/dashboard-config.service';

@Component({
  selector: 'app-header-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header-dashboard.html',
  styleUrls: ['./header-dashboard.scss']
})
export class HeaderDashboardComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();

  private authService = inject(AuthService);
  private router = inject(Router);
  private dashboardConfigService = inject(DashboardConfigService);

  currentUser: any = null;
  config!: DashboardConfig;
  showProfileMenu = false;
  showNotifications = false;
  notificationCount = 5;

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.config = this.dashboardConfigService.getDashboardConfig();
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
  }

  closeMenus(): void {
    this.showProfileMenu = false;
    this.showNotifications = false;
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
    const role = this.config.role.toLowerCase().replace('_', ' ').split(' ')[0];
    if(role === 'administrateur') {
      this.router.navigate([`/admin/profil`]);
      this.closeMenus();
      return;
    }
    this.router.navigate([`/${role}/profil`]);
    this.closeMenus();
  }

  goToSettings(): void {
    const role = this.config.role.toLowerCase().replace('_', '-');
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
        this.router.navigate(['/admin/utilisateurs/creer']);
        break;
    }
  }
}
