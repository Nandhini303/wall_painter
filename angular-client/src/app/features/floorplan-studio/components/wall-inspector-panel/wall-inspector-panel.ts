import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FloorPlanService } from '../../../../services/floorplan.service';

@Component({
  selector: 'app-wall-inspector-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="inspector-container">
      @if (svc.selectedElement(); as el) {
        <div class="inspector-header">
          <h3>{{ el.type === 'wall' ? 'Wall:' : 'Element:' }} {{ el.name }}</h3>
        </div>

        <div class="inspector-body">
          <div class="form-group">
            <label>Paint</label>
            <select class="form-control" [ngModel]="el.paint" (ngModelChange)="updateElement({paint: $event})">
              @for (finish of svc.wallFinishes(); track finish.id) {
                <option [value]="finish.id">{{ finish.name }}</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label>Gloss</label>
            <select class="form-control" [ngModel]="el.gloss || 'Satin'" (ngModelChange)="updateElement({gloss: $event})">
              <option value="Matte">Matte</option>
              <option value="Satin">Satin</option>
              <option value="Gloss">Gloss</option>
            </select>
          </div>

          <div class="form-group">
            <label>Area</label>
            <div class="read-only-field">{{ el.areaSqm || 0 }} sqm</div>
          </div>

          <div class="swatches-section">
            <label>Colors</label>
            <div class="swatch-row">
              @for (color of swatches; track color) {
                <div class="swatch" 
                     [style.background]="color"
                     [class.active]="el.texture === color"
                     (click)="updateElement({texture: color})"></div>
              }
            </div>
          </div>

          <div class="textures-section">
            <label>Textures</label>
            <div class="texture-row">
              @for (tex of textures; track tex) {
                <div class="texture-chip" 
                     [style.background-image]="'url(' + tex + ')'"
                     (click)="updateElement({texture: tex})"></div>
              }
            </div>
          </div>

          <div class="render-preview">
            <!-- Static placeholder for now as per plan -->
            <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=400" alt="Live Render Preview" />
          </div>
        </div>
      } @else {
        <div class="empty-state">
          Select an element on the canvas to inspect it.
        </div>
      }

      <div class="spacer"></div>

      <!-- Layers Panel -->
      <div class="layers-section">
        <div class="layers-header">
          <span>LAYERS</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
        </div>
        <div class="layers-tree">
          @for (layer of svc.layers(); track layer.id) {
            <div class="layer-node">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l10 6.5v7L12 22 2 15.5v-7L12 2zM12 22v-6.5"/><path d="M22 8.5l-10 7-10-7"/><path d="M2 15.5l10-7 10 7M12 2v6.5"/></svg>
              <span class="layer-name">{{ layer.name }}</span>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .inspector-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--surface);
    }
    .inspector-header {
      padding: 16px;
      border-bottom: 1px solid var(--border);
    }
    .inspector-header h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
    }
    .empty-state {
      padding: 32px 16px;
      text-align: center;
      color: var(--text-muted);
      font-size: 13px;
    }
    .inspector-body {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      overflow-y: auto;
    }
    .form-group {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .form-group label {
      font-size: 13px;
      color: var(--text-muted);
      width: 60px;
    }
    .form-control, .read-only-field {
      flex: 1;
      background: var(--surface-hover);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 8px 12px;
      color: var(--text);
      font-size: 13px;
      outline: none;
    }
    .read-only-field { border: none; background: transparent; padding-left: 0; }
    
    label { font-size: 12px; color: var(--text-muted); margin-bottom: 8px; display: block; }
    
    .swatch-row { display: flex; gap: 8px; }
    .swatch {
      width: 24px; height: 24px; border-radius: 50%;
      cursor: pointer; border: 2px solid transparent;
    }
    .swatch.active { border-color: white; box-shadow: 0 0 0 2px var(--accent); }
    
    .texture-row { display: flex; gap: 8px; }
    .texture-chip {
      width: 48px; height: 32px; border-radius: 4px;
      background-size: cover; background-position: center;
      cursor: pointer; border: 1px solid var(--border);
    }
    
    .render-preview {
      margin-top: 16px;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--border);
    }
    .render-preview img { width: 100%; height: auto; display: block; }
    
    .spacer { flex: 1; }
    
    .layers-section {
      border-top: 1px solid var(--border);
      background: var(--surface-raised);
    }
    .layers-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 16px; font-size: 11px; font-weight: 600; color: var(--text-muted);
    }
    .layers-tree { padding: 0 16px 16px; }
    .layer-node {
      display: flex; align-items: center; gap: 8px;
      padding: 8px; border-radius: 6px; color: var(--text); cursor: pointer;
    }
    .layer-node:hover { background: var(--surface-hover); }
    .layer-name { font-size: 13px; }
  `]
})
export class WallInspectorPanel {
  swatches = ['#475569', '#3B82F6', '#E2E8F0', '#FDE68A', '#D97706'];
  textures = [
    'https://images.unsplash.com/photo-1596766467362-e2c7a4bf6b14?auto=format&fit=crop&q=80&w=100',
    'https://images.unsplash.com/photo-1601008080644-88484a0cda8b?auto=format&fit=crop&q=80&w=100',
    'https://images.unsplash.com/photo-1581428982868-e410dd047a90?auto=format&fit=crop&q=80&w=100',
  ];

  constructor(public svc: FloorPlanService) {}

  updateElement(updates: any) {
    this.svc.updateSelectedElement(updates);
  }
}
