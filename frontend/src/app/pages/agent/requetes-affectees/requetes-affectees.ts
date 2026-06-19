import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RequestService, Requete } from '../../../services/request.service';
import { RequestStatusPipe } from '../../../pipes/request-status.pipe';
import { PriorityPipe } from '../../../pipes/priority.pipe';

@Component({
  selector: 'app-requetes-affectees',
  standalone: true,
  imports: [CommonModule, FormsModule, RequestStatusPipe, PriorityPipe],
  templateUrl: './requetes-affectees.html',
  styleUrls: ['./requetes-affectees.css']
})
export class RequetesAffecteesComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private requestService = inject(RequestService);

  requetes: Requete[] = [];
  loading = true;
  error = '';
  currentPage = 1;
  pagination: any = {};
  filters: any = {};

  ngOnInit(): void {
    this.loadRequetes();
  }

  loadRequetes(): void {
    this.loading = true;
    this.requestService.getAssignedRequests({ ...this.filters, page: this.currentPage }).subscribe({
      next: (response) => {
        console.log("fffff:" + JSON.stringify(response.data?.data, null, 2))
        this.requetes = response.data?.data || [];
        this.pagination = response.data || {};
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement';
        this.loading = false;
      }
    });
  }

  viewDetails(id: number): void {
    this.router.navigate(['/agent/requete', id]);
  }
}

