import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DashboardConfigService, DashboardConfig } from '../../../../services/dashboard-config.service';

@Component({
  selector: 'app-sidebar-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar-dashboard.html',
  styleUrls: ['./sidebar-dashboard.scss']
})
export class SidebarDashboardComponent implements OnInit {
  private dashboardConfigService = inject(DashboardConfigService);
  private router = inject(Router);

  config!: DashboardConfig;
  isSidebarCollapsed = false;

  ngOnInit(): void {
    this.config = this.dashboardConfigService.getDashboardConfig();
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }
}
