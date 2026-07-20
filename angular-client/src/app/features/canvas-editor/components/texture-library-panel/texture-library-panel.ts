import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColorStudioService, StudioTexture } from '../../../../services/color-studio';

@Component({
  selector: 'app-texture-library-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './texture-library-panel.html',
  styleUrls: ['./texture-library-panel.scss']
})
export class TextureLibraryPanelComponent {
  studio = inject(ColorStudioService);
  
  searchQuery = signal('');
  selectedCategory = signal('All');
  
  categories = ['All', 'Matte', 'Gloss', 'Concrete', 'Wood', 'Marble', 'Stone', 'Wallpaper'];
  
  // Hardcoded real thumbnails to ensure no empty placeholders
  allTextures: StudioTexture[] = [
    { id: 't1', name: 'Smooth Matte', category: 'Matte', imageUri: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=300&q=80' },
    { id: 't2', name: 'High Gloss Plaster', category: 'Gloss', imageUri: 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&w=300&q=80' },
    { id: 't3', name: 'Urban Concrete', category: 'Concrete', imageUri: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=300&q=80' },
    { id: 't4', name: 'Oak Wood Paneling', category: 'Wood', imageUri: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=300&q=80' },
    { id: 't5', name: 'Carrara Marble', category: 'Marble', imageUri: 'https://images.unsplash.com/photo-1508215885820-4585e5610d28?auto=format&fit=crop&w=300&q=80' },
    { id: 't6', name: 'Rough Stone', category: 'Stone', imageUri: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=300&q=80' },
    { id: 't7', name: 'Vintage Floral', category: 'Wallpaper', imageUri: 'https://images.unsplash.com/photo-1615800098779-1be32e60cca3?auto=format&fit=crop&w=300&q=80' },
    { id: 't8', name: 'Satin Finish', category: 'Matte', imageUri: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=300&q=80' }
  ];
  
  filteredTextures = computed(() => {
    let list = this.allTextures;
    const cat = this.selectedCategory();
    if (cat !== 'All') {
      list = list.filter(t => t.category === cat);
    }
    const q = this.searchQuery().toLowerCase();
    if (q) {
      list = list.filter(t => t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
    }
    return list;
  });

  selectTexture(tex: StudioTexture | null) {
    if (this.studio.activeTexture()?.id === tex?.id) {
      this.studio.setActiveTexture(null); // toggle off
    } else {
      this.studio.setActiveTexture(tex);
    }
  }
}
