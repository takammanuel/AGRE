import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toasts" 
           [class]="'toast toast-' + toast.type">
        <div class="toast-icon">
          <i [class]="getIcon(toast.type)"></i>
        </div>
        <div class="toast-content">
          <p>{{ toast.message }}</p>
        </div>
        <button class="toast-close" (click)="close(toast.id)">
          <i class="bi bi-x"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 400px;
    }

    .toast {
      background: white;
      border-radius: 12px;
      padding: 1rem 1.25rem;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      gap: 1rem;
      animation: slideIn 0.3s ease;
      border-left: 4px solid;
    }

    .toast-success {
      border-left-color: #10b981;
    }

    .toast-error {
      border-left-color: #ef4444;
    }

    .toast-warning {
      border-left-color: #f59e0b;
    }

    .toast-info {
      border-left-color: #3b82f6;
    }

    .toast-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .toast-success .toast-icon {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }

    .toast-error .toast-icon {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .toast-warning .toast-icon {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }

    .toast-info .toast-icon {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }

    .toast-icon i {
      font-size: 1.5rem;
    }

    .toast-content {
      flex: 1;
    }

    .toast-content p {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 500;
      color: #1f2937;
      line-height: 1.5;
    }

    .toast-close {
      background: none;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
    }

    .toast-close:hover {
      color: #4b5563;
    }

    .toast-close i {
      font-size: 1.25rem;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @media (max-width: 768px) {
      .toast-container {
        right: 10px;
        left: 10px;
        max-width: none;
      }
    }
  `]
})
export class ToastComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.getToasts().subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  getIcon(type: string): string {
    const icons: { [key: string]: string } = {
      success: 'bi bi-check-circle-fill',
      error: 'bi bi-x-circle-fill',
      warning: 'bi bi-exclamation-triangle-fill',
      info: 'bi bi-info-circle-fill'
    };
    return icons[type] || icons['info'];
  }

  close(id: number) {
    this.toastService.remove(id);
  }
}
