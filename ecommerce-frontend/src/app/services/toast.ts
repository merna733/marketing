import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  id: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();
  private toastId = 0;

  showToast(
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info'
  ): void {
    const toast: Toast = {
      message,
      type,
      id: ++this.toastId,
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);

    setTimeout(() => {
      this.removeToast(toast.id);
    }, 5000);
  }

  removeToast(id: number): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter((toast) => toast.id !== id));
  }

  showSuccess(message: string): void {
    this.showToast(message, 'success');
  }

  showError(message: string): void {
    this.showToast(message, 'error');
  }

  showInfo(message: string): void {
    this.showToast(message, 'info');
  }

  showWarning(message: string): void {
    this.showToast(message, 'warning');
  }
}
