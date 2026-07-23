import { Component, inject, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColorStudioService } from '../../../../services/color-studio';

import { LucideAngularModule, Pipette } from '@lucide/angular';

@Component({
  selector: 'app-custom-color-popover',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule.pick({ Pipette })],
  templateUrl: './custom-color-popover.html',
  styleUrls: ['./custom-color-popover.scss']
})
export class CustomColorPopoverComponent {
  studio = inject(ColorStudioService);
  @Output() onApply = new EventEmitter<void>();
  
  activeTab = signal<'HEX' | 'RGB' | 'HSL' | 'HSV'>('HEX');
  customHex = signal('#000000');
  
  ngOnInit() {
    this.customHex.set(this.studio.activeColor().hex);
  }
  
  async pickColor() {
    // EyeDropper API
    if ('EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        this.customHex.set(result.sRGBHex);
        this.applyColor();
      } catch (e) {
        console.warn('EyeDropper cancelled or failed', e);
      }
    } else {
      alert('EyeDropper API is not supported in this browser.');
    }
  }
  
  applyColor() {
    this.studio.setActiveColor({ hex: this.customHex(), name: 'Custom' });
    this.onApply.emit();
  }
}
