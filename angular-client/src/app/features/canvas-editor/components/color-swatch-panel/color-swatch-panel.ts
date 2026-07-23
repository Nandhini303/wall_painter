import { Component, inject, computed, signal, Pipe, PipeTransform } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColorStudioService, StudioColor } from '../../../../services/color-studio';
import { OpenColor } from '../../../../data/open-color';

import { LucideAngularModule, Star } from 'lucide-angular';

@Pipe({
  name: 'selectHue',
  standalone: true
})
export class SelectHuePipe implements PipeTransform {
  transform(colors: StudioColor[], key: string, shade: number): StudioColor | undefined {
    const ocName = `${key}-${shade}`;
    return colors.find(c => c.ocName === ocName);
  }
}

import { importProvidersFrom } from '@angular/core';

@Component({
  selector: 'app-color-swatch-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, TitleCasePipe, SelectHuePipe, LucideAngularModule],
  templateUrl: './color-swatch-panel.html',
  styleUrls: ['./color-swatch-panel.scss']
})
export class ColorSwatchPanelComponent {
  studio = inject(ColorStudioService);
  
  searchQuery = signal('');
  
  openColorKeys = ['gray', 'red', 'pink', 'grape', 'violet', 'indigo', 'blue', 'cyan', 'teal', 'green', 'lime', 'yellow', 'orange'];
  shades = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  
  allColors = computed(() => {
    const list: StudioColor[] = [];
    const query = this.searchQuery().toLowerCase();
    
    for (const key of this.openColorKeys) {
      if (query && !key.includes(query)) continue;
      
      const hexes = (OpenColor as any)[key];
      for (let i = 0; i < hexes.length; i++) {
        list.push({
          hex: hexes[i],
          name: `${key} ${i}`,
          ocName: `${key}-${i}`
        });
      }
    }
    return list;
  });

  selectColor(color: StudioColor) {
    this.studio.setActiveColor(color);
  }
}
