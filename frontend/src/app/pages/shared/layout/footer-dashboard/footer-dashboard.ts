import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer-dashboard.html',
  styleUrls: ['./footer-dashboard.css']
})
export class FooterDashboardComponent {
  currentYear = new Date().getFullYear();
}