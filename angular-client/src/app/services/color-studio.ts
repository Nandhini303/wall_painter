import { Injectable, signal, computed } from '@angular/core';

export interface StudioColor {
  hex: string;
  name?: string;
  ocName?: string; // e.g. "blue-5"
}

export interface StudioTexture {
  id: string;
  name: string;
  category: string;
  imageUri: string;
}

@Injectable({
  providedIn: 'root'
})
export class ColorStudioService {
  // Active State Signals
  activeColor = signal<StudioColor>({ hex: '#339af0', name: 'Blue 5', ocName: 'blue-5' }); // default --oc-blue-5
  activeTexture = signal<StudioTexture | null>(null);
  
  // Brush & Selection Properties
  brushSize = signal<number>(24);
  brushOpacity = signal<number>(0.85);
  featherRadius = signal<number>(4);
  floodTolerance = signal<number>(35);
  activeBlendMode = signal<string>('multiply');

  // Texture Properties
  textureScale = signal<number>(1);
  textureRotation = signal<number>(0);
  textureOpacity = signal<number>(1);
  textureBlendMode = signal<string>('multiply');

  // Persistence Signals
  recentColors = signal<StudioColor[]>([]);
  favoriteColors = signal<StudioColor[]>([]);

  constructor() {
    this.loadFromStorage();
  }

  // --- Actions ---
  
  setActiveColor(color: StudioColor) {
    this.activeColor.set(color);
    this.addToRecents(color);
  }

  setActiveTexture(texture: StudioTexture | null) {
    this.activeTexture.set(texture);
  }

  // --- Recents ---
  
  private addToRecents(color: StudioColor) {
    let current = [...this.recentColors()];
    // Remove if already exists to move to top
    current = current.filter(c => c.hex.toLowerCase() !== color.hex.toLowerCase());
    current.unshift(color);
    if (current.length > 12) {
      current = current.slice(0, 12);
    }
    this.recentColors.set(current);
    this.saveToStorage();
  }

  clearRecents() {
    this.recentColors.set([]);
    this.saveToStorage();
  }

  // --- Favorites ---
  
  toggleFavorite(color: StudioColor) {
    const current = [...this.favoriteColors()];
    const existsIndex = current.findIndex(c => c.hex.toLowerCase() === color.hex.toLowerCase());
    
    if (existsIndex >= 0) {
      current.splice(existsIndex, 1);
    } else {
      current.push(color);
    }
    this.favoriteColors.set(current);
    this.saveToStorage();
  }
  
  isFavorite(hex: string): boolean {
    return this.favoriteColors().some(c => c.hex.toLowerCase() === hex.toLowerCase());
  }

  reorderFavorites(newOrder: StudioColor[]) {
    this.favoriteColors.set(newOrder);
    this.saveToStorage();
  }

  // --- Storage ---
  
  private saveToStorage() {
    try {
      localStorage.setItem('color_studio_recents', JSON.stringify(this.recentColors()));
      localStorage.setItem('color_studio_favorites', JSON.stringify(this.favoriteColors()));
    } catch (e) {
      console.warn('LocalStorage save failed');
    }
  }

  private loadFromStorage() {
    try {
      const recents = localStorage.getItem('color_studio_recents');
      const favorites = localStorage.getItem('color_studio_favorites');
      
      if (recents) {
        this.recentColors.set(JSON.parse(recents));
      }
      if (favorites) {
        this.favoriteColors.set(JSON.parse(favorites));
      }
    } catch (e) {
      console.warn('LocalStorage load failed');
    }
  }
}
