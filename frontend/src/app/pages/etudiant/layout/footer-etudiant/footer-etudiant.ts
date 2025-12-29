import { Component } from '@angular/core';

@Component({
  selector: 'app-footer-etudiant',
  imports: [],
  templateUrl: './footer-etudiant.html',
  styleUrl: './footer-etudiant.scss',
})
export class FooterEtudiant {
  currentYear = new Date().getFullYear();
}
