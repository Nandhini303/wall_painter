import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MsTopBar } from './components/ms-top-bar/ms-top-bar';
import { MsLeftPanel } from './components/ms-left-panel/ms-left-panel';
import { MsRightPanel } from './components/ms-right-panel/ms-right-panel';
import { MsCanvas } from './components/ms-canvas/ms-canvas';

@Component({
  selector: 'app-master-studio',
  standalone: true,
  imports: [CommonModule, MsTopBar, MsLeftPanel, MsRightPanel, MsCanvas],
  template: `
    <div class="studio-layout">
      <app-ms-top-bar></app-ms-top-bar>
      <div class="studio-body">
        <app-ms-left-panel></app-ms-left-panel>
        <div class="studio-center">
          <app-ms-canvas></app-ms-canvas>
        </div>
        <app-ms-right-panel></app-ms-right-panel>
      </div>
    </div>
  `,
  styles: [`
    .studio-layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 100vw;
      background: var(--surface);
      overflow: hidden;
    }
    .studio-body {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    .studio-center {
      flex: 1;
      position: relative;
    }
  `]
})
export class MasterStudio {}
