import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FloorplanTopBar } from './components/floorplan-top-bar/floorplan-top-bar';
import { FloorplanLeftPanel } from './components/floorplan-left-panel/floorplan-left-panel';
import { FloorplanCanvas } from './components/floorplan-canvas/floorplan-canvas';
import { WallInspectorPanel } from './components/wall-inspector-panel/wall-inspector-panel';

@Component({
  selector: 'app-floorplan-studio',
  standalone: true,
  imports: [CommonModule, FloorplanTopBar, FloorplanLeftPanel, FloorplanCanvas, WallInspectorPanel],
  template: `
    <div class="floorplan-layout">
      <app-floorplan-top-bar></app-floorplan-top-bar>
      <div class="floorplan-workspace">
        <app-floorplan-left-panel></app-floorplan-left-panel>
        <app-floorplan-canvas></app-floorplan-canvas>
        <app-wall-inspector-panel></app-wall-inspector-panel>
      </div>
    </div>
  `,
  styles: [`
    .floorplan-layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      background-color: var(--surface); /* Existing theme surface */
    }
    .floorplan-workspace {
      display: flex;
      flex: 1;
      overflow: hidden;
      position: relative;
    }
    app-floorplan-left-panel {
      width: 320px;
      display: flex;
      flex-direction: column;
      border-right: 1px solid var(--border);
      background-color: var(--surface-raised);
      z-index: 10;
    }
    app-floorplan-canvas {
      flex: 1;
      position: relative;
      background-color: #e5e7eb; /* Soft light gray for the floorplan grid background */
    }
    app-wall-inspector-panel {
      width: 320px;
      display: flex;
      flex-direction: column;
      border-left: 1px solid var(--border);
      background-color: var(--surface-raised);
      z-index: 10;
    }
  `]
})
export class FloorplanStudio implements OnInit {
  ngOnInit() {
    // Init logic
  }
}
