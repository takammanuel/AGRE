import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DashboardConfigService, DashboardConfig } from '../../../../services/dashboard-config.service';
import { BadgeCounterService, BadgeCounts } from '../../../../services/badge-counter.service';

@Component({
  selector: 'app-sidebar-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar-dashboard.html',
  styleUrls: ['./sidebar-dashboard.scss']
})
export class SidebarDashboardComponent implements OnInit {
  private dashboardConfigService = inject(DashboardConfigService);
  private badgeCounterService = inject(BadgeCounterService);
  private router = inject(Router);

  config!: DashboardConfig;
  isSidebarCollapsed = false;
  badgeCounts: BadgeCounts = {
    utilisateurs: 0,
    approbations: 0,
    requetes_escaladees: 0,
    requetes_urgentes: 0,
    services: 0,
    types_requetes: 0,
    messages_non_lus: 0,
    notifications_non_lues: 0
  };

  ngOnInit(): void {
    this.config = this.dashboardConfigService.getDashboardConfig();
    
    // Charger les compteurs initiaux
    this.badgeCounterService.getBadgeCounts().subscribe();
    
    // S'abonner aux changements
    this.badgeCounterService.counts$.subscribe(counts => {
      this.badgeCounts = counts;
    });
    
    // Démarrer le polling automatique
    this.badgeCounterService.startPolling();
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  getBadgeForRoute(route: string): number | undefined {
    if (route.includes('utilisateurs')) return this.badgeCounts.utilisateurs || undefined;
    if (route.includes('approbations')) return this.badgeCounts.approbations || undefined;
    if (route.includes('requetes-escaladees')) return this.badgeCounts.requetes_escaladees || undefined;
    if (route.includes('urgentes')) return this.badgeCounts.requetes_urgentes || undefined;
    if (route.includes('services')) return this.badgeCounts.services || undefined;
    if (route.includes('types-requetes')) return this.badgeCounts.types_requetes || undefined;
    if (route.includes('messagerie')) return this.badgeCounts.messages_non_lus || undefined;
    return undefined;
  }
}
