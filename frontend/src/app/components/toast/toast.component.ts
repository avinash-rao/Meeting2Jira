import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md">
      <div
        *ngFor="let toast of toasts$ | async"
        class="bg-jira-card rounded-lg shadow-lg min-w-[320px] overflow-hidden animate-slide-in border border-jira-border"
        [class.border-l-4]="true"
        [class.border-jira-success]="toast.type === 'success'"
        [class.border-jira-error]="toast.type === 'error'"
        [class.border-jira-warning]="toast.type === 'warning'"
        [class.border-jira-primary]="toast.type === 'info'"
      >
        <div class="p-4 flex items-start gap-3">
          <!-- Icon -->
          <div
            class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
            [class.bg-jira-successBg]="toast.type === 'success'"
            [class.text-jira-success]="toast.type === 'success'"
            [class.bg-jira-errorBg]="toast.type === 'error'"
            [class.text-jira-error]="toast.type === 'error'"
            [class.bg-jira-warningBg]="toast.type === 'warning'"
            [class.text-jira-warning]="toast.type === 'warning'"
            [class.bg-blue-50]="toast.type === 'info'"
            [class.text-jira-primary]="toast.type === 'info'"
          >
            <svg *ngIf="toast.type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <svg *ngIf="toast.type === 'error'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <svg *ngIf="toast.type === 'warning'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <svg *ngIf="toast.type === 'info'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <h4 class="text-jira-textPrimary font-semibold text-sm mb-1">{{ toast.title }}</h4>
            <p class="text-jira-textSecondary text-sm">{{ toast.message }}</p>
            <a
              *ngIf="toast.link"
              [href]="toast.link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-jira-primary hover:text-jira-primaryHover text-sm font-medium inline-flex items-center gap-1 mt-2"
            >
              {{ toast.link.text }}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
            </a>
          </div>

          <!-- Close button -->
          <button
            (click)="dismiss(toast.id)"
            class="flex-shrink-0 text-jira-textSecondary hover:text-jira-textPrimary transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `]
})
export class ToastComponent {
  toasts$ = this.toastService.toasts$;

  constructor(private toastService: ToastService) {}

  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }
}

// Made with Bob