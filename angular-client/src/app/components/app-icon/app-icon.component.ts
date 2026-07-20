import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-icon.component.html',
  styleUrls: ['./app-icon.component.scss']
})
export class AppIconComponent {
  @Input() name: string = 'dashboard';
  @Input() size: number = 20;
  @Input() strokeWidth: number = 1.75;
  @Input() color: string = 'currentColor';
}
