import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  link?: {
    text: string;
    url: string;
  };
  autoDismiss?: boolean;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  show(toast: Omit<Toast, 'id'>): void {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = {
      id,
      autoDismiss: toast.type === 'success' ? true : false,
      duration: 4000,
      ...toast
    };

    const toasts = [...this.toastsSubject.value, newToast];
    this.toastsSubject.next(toasts);

    if (newToast.autoDismiss) {
      setTimeout(() => this.dismiss(id), newToast.duration);
    }
  }

  success(title: string, message: string, link?: { text: string; url: string }): void {
    this.show({ type: 'success', title, message, link });
  }

  error(title: string, message: string): void {
    this.show({ type: 'error', title, message });
  }

  warning(title: string, message: string): void {
    this.show({ type: 'warning', title, message });
  }

  info(title: string, message: string): void {
    this.show({ type: 'info', title, message });
  }

  dismiss(id: string): void {
    const toasts = this.toastsSubject.value.filter(t => t.id !== id);
    this.toastsSubject.next(toasts);
  }

  clear(): void {
    this.toastsSubject.next([]);
  }
}

// Made with Bob