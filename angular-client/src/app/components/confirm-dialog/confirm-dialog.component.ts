import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../services/modal.service';

import { AppIconComponent } from '../app-icon/app-icon.component';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, AppIconComponent],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  constructor(public modalService: ModalService) {}

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.modalService.isOpen()) {
      this.modalService.handleCancel();
    }
  }
}
