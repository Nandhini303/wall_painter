import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColorStudioService } from '../../../../services/color-studio';

@Component({
  selector: 'app-tool-properties',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tool-properties.html',
  styleUrls: ['./tool-properties.scss']
})
export class ToolPropertiesComponent {
  studio = inject(ColorStudioService);
}
