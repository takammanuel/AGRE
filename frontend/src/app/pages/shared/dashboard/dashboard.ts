import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderDashboardComponent } from '../layout/header-dashboard/header-dashboard';
import { SidebarDashboardComponent } from '../layout/sidebar-dashboard/sidebar-dashboard';
// import { FooterDashboardComponent } from '../layout/footer-dashboard/footer-dashboard';
import { DashboardConfigService, DashboardConfig } from '../../../services/dashboard-config.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderDashboardComponent,
    SidebarDashboardComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  private dashboardConfigService = inject(DashboardConfigService);

  config!: DashboardConfig;
  isSidebarVisible = false;

  ngOnInit(): void {
    this.config = this.dashboardConfigService.getDashboardConfig();
  }

  toggleSidebar(): void {
    this.isSidebarVisible = !this.isSidebarVisible;
  }
}
