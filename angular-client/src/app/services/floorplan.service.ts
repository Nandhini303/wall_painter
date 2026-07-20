import { Injectable, signal } from '@angular/core';
import { SocketService } from './socket.service';

export interface FloorPlanElement {
  id: string;
  type: 'wall' | 'furniture' | 'architectural';
  name: string;
  points?: number[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  paint?: string;
  gloss?: string;
  texture?: string;
  areaSqm?: number;
}

export interface WallFinish {
  id: string;
  category: 'paint' | 'wallpaper' | 'stone' | 'wood';
  name: string;
  previewUrl: string;
}

export interface CatalogItem {
  id: string;
  category: 'furniture' | 'architectural';
  name: string;
  iconUrl: string;
  defaultWidth: number;
  defaultHeight: number;
}

export interface LayerNode {
  id: string;
  name: string;
  type: 'group' | 'layer';
  visible: boolean;
  locked: boolean;
  children?: LayerNode[];
}

@Injectable({ providedIn: 'root' })
export class FloorPlanService {
  // State
  selectedElement = signal<FloorPlanElement | null>(null);
  elements = signal<FloorPlanElement[]>([]);
  
  // Catalog Data
  wallFinishes = signal<WallFinish[]>([
    { id: 'wf1', category: 'paint', name: 'Farrow & Ball Stiffkey Blue', previewUrl: '/assets/textures/blue.jpg' },
    { id: 'wf2', category: 'paint', name: 'Dulux Whisper White', previewUrl: '/assets/textures/white.jpg' },
    { id: 'wf3', category: 'wallpaper', name: 'Damask Vintage', previewUrl: '/assets/textures/wallpaper.jpg' },
    { id: 'wf4', category: 'wood', name: 'Oak Timber', previewUrl: '/assets/textures/wood.jpg' },
  ]);

  catalog = signal<CatalogItem[]>([
    { id: 'c1', category: 'furniture', name: 'Sofa', iconUrl: 'sofa', defaultWidth: 200, defaultHeight: 100 },
    { id: 'c2', category: 'furniture', name: 'Dining Table', iconUrl: 'table', defaultWidth: 150, defaultHeight: 150 },
    { id: 'c3', category: 'architectural', name: 'Window', iconUrl: 'window', defaultWidth: 100, defaultHeight: 20 },
    { id: 'c4', category: 'architectural', name: 'Door', iconUrl: 'door', defaultWidth: 90, defaultHeight: 20 },
  ]);

  layers = signal<LayerNode[]>([
    { id: 'l1', name: 'Furniture', type: 'layer', visible: true, locked: false, children: [] },
    { id: 'l2', name: 'Structure', type: 'layer', visible: true, locked: false, children: [] },
    { id: 'l3', name: 'Walls', type: 'layer', visible: true, locked: false, children: [] },
    { id: 'l4', name: 'Lighting', type: 'layer', visible: true, locked: false, children: [] }
  ]);

  constructor(private socket: SocketService) {}

  selectElement(id: string | null) {
    if (!id) {
      this.selectedElement.set(null);
      return;
    }
    const el = this.elements().find(e => e.id === id);
    this.selectedElement.set(el || null);
  }

  updateSelectedElement(updates: Partial<FloorPlanElement>) {
    const current = this.selectedElement();
    if (!current) return;
    
    const updated = { ...current, ...updates };
    this.selectedElement.set(updated);
    
    // Update in array
    this.elements.update(arr => arr.map(e => e.id === updated.id ? updated : e));
    
    // Broadcast via socket
    this.socket.sendFloorplanUpdate(updated);
  }
}
