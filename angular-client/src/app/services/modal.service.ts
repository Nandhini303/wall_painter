import { Injectable, signal } from '@angular/core';

export interface ModalOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  isOpen = signal(false);
  options = signal<ModalOptions>({ title: '', message: '' });
  private resolveFn: ((value: boolean) => void) | null = null;

  confirm(opts: ModalOptions): Promise<boolean> {
    this.options.set({
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
      ...opts
    });
    this.isOpen.set(true);

    return new Promise<boolean>((resolve) => {
      this.resolveFn = resolve;
    });
  }

  handleConfirm(): void {
    this.isOpen.set(false);
    if (this.resolveFn) {
      this.resolveFn(true);
      this.resolveFn = null;
    }
  }

  handleCancel(): void {
    this.isOpen.set(false);
    if (this.resolveFn) {
      this.resolveFn(false);
      this.resolveFn = null;
    }
  }
}
