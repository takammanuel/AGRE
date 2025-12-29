import { Component } from '@angular/core';
import { FooterEtudiant } from '../layout/footer-etudiant/footer-etudiant';
import { HeaderEtudiant } from '../layout/header-etudiant/header-etudiant';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard-etudiant',
  imports: [FooterEtudiant, HeaderEtudiant, RouterOutlet],
  templateUrl: './dashboard-etudiant.html',
  styleUrl: './dashboard-etudiant.css',
})
export class DashboardEtudiant {

}
