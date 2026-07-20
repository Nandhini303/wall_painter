import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import Konva from 'konva';
import { FloorPlanService } from '../../../../services/floorplan.service';

@Component({
  selector: 'app-floorplan-canvas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="canvas-wrapper">
      <!-- Floating Top Toolbar -->
      <div class="floating-toolbar top-toolbar">
        <button class="tool-btn active" title="Pointer"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg></button>
        <div class="divider"></div>
        <button class="tool-btn" title="Crop"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></svg></button>
        <button class="tool-btn" title="Wall Draw"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg></button>
        <button class="tool-btn" title="Measure"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="6" width="16" height="12" rx="2"/><path d="M8 6v4M12 6v4M16 6v4"/></svg></button>
        <div class="divider"></div>
        <button class="tool-btn text-danger" title="Delete"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
      </div>

      <!-- Floating Left Toolbar -->
      <div class="floating-toolbar left-toolbar">
        <button class="tool-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></button>
        <button class="tool-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 22h20L12 2z"/></svg></button>
        <button class="tool-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></button>
        <button class="tool-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
        <button class="tool-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg></button>
      </div>

      <!-- Floating Bottom Toolbar -->
      <div class="floating-toolbar bottom-toolbar">
        <button class="tool-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg></button>
        <button class="tool-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></svg></button>
        <button class="tool-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></button>
      </div>

      <!-- Canvas Container -->
      <div class="canvas-container" #container></div>
    </div>
  `,
  styles: [`
    .canvas-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
    }
    .canvas-container {
      width: 100%;
      height: 100%;
      outline: none;
    }
    .floating-toolbar {
      position: absolute;
      background: rgba(20, 23, 31, 0.85);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      display: flex;
      padding: 4px;
      gap: 4px;
      z-index: 50;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .top-toolbar {
      top: 24px;
      left: 50%;
      transform: translateX(-50%);
    }
    .left-toolbar {
      left: 24px;
      top: 50%;
      transform: translateY(-50%);
      flex-direction: column;
    }
    .bottom-toolbar {
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
    }
    .tool-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background: transparent;
      color: #F5F6F8;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .tool-btn:hover { background: rgba(255,255,255,0.1); }
    .tool-btn.active { background: var(--accent); color: white; }
    .tool-btn.text-danger:hover { color: #ef4444; }
    
    .divider {
      width: 1px;
      height: 24px;
      background: rgba(255, 255, 255, 0.15);
      margin: auto 4px;
    }
    .left-toolbar .divider {
      width: 24px;
      height: 1px;
    }
  `]
})
export class FloorplanCanvas implements OnInit {
  @ViewChild('container', { static: true }) containerRef!: ElementRef;
  private stage!: Konva.Stage;
  private wallLayer!: Konva.Layer;

  constructor(private svc: FloorPlanService) {}

  ngOnInit() {
    this.initKonva();
    this.drawMockFloorPlan();
  }

  @HostListener('window:resize')
  onResize() {
    if (this.stage) {
      this.stage.width(this.containerRef.nativeElement.offsetWidth);
      this.stage.height(this.containerRef.nativeElement.offsetHeight);
    }
  }

  private initKonva() {
    const el = this.containerRef.nativeElement;
    this.stage = new Konva.Stage({
      container: el,
      width: el.offsetWidth,
      height: el.offsetHeight,
      draggable: true
    });

    this.wallLayer = new Konva.Layer();
    this.stage.add(this.wallLayer);

    // Click on empty stage deselects
    this.stage.on('click tap', (e) => {
      if (e.target === this.stage) {
        this.svc.selectElement(null);
        this.highlightWall(null);
      }
    });
  }

  private drawMockFloorPlan() {
    // Draw a mock wall to demonstrate the feature
    const wall = new Konva.Line({
      points: [100, 100, 400, 100, 400, 400, 100, 400, 100, 100],
      stroke: 'white',
      strokeWidth: 6,
      lineCap: 'round',
      lineJoin: 'round',
      name: 'wall1'
    });

    // Register it in the service
    this.svc.elements.set([
      { id: 'wall1', type: 'wall', name: 'Living Room 01', areaSqm: 28 }
    ]);

    wall.on('click tap', () => {
      this.svc.selectElement('wall1');
      this.highlightWall(wall);
    });

    this.wallLayer.add(wall);
    this.wallLayer.draw();
  }

  private highlightWall(node: Konva.Node | null) {
    // Remove previous highlights
    this.wallLayer.find('.highlight').forEach(n => n.destroy());
    
    if (node instanceof Konva.Line) {
      const hl = node.clone({
        stroke: '#3B82F6', // Accent blue
        strokeWidth: 10,
        opacity: 0.5,
        name: 'highlight',
        listening: false
      });
      this.wallLayer.add(hl);
      hl.moveToBottom();
    }
    this.wallLayer.draw();
  }
}
