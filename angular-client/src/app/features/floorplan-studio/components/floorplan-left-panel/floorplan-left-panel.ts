import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FloorPlanService } from '../../../../services/floorplan.service';

@Component({
  selector: 'app-floorplan-left-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="left-panel-container">
      <!-- Left Icon Rail -->
      <div class="icon-rail">
        <div class="rail-icon active"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg></div>
        <div class="rail-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/></svg></div>
        <div class="rail-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></div>
        <div class="rail-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></div>
        <div class="spacer"></div>
        <div class="rail-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></div>
      </div>

      <!-- Main Accordion Content -->
      <div class="panel-content">
        <!-- Floor Plans Accordion -->
        <div class="accordion-section" [class.open]="sections['plans']">
          <div class="section-header" (click)="toggle('plans')">
            <span>FLOOR PLANS</span>
            <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>
          @if (sections['plans']) {
            <div class="section-body">
              <div class="plan-item active"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg> Current Plan</div>
              <div class="plan-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> Rooms</div>
            </div>
          }
        </div>

        <!-- Wall Finishes Accordion -->
        <div class="accordion-section" [class.open]="sections['finishes']">
          <div class="section-header" (click)="toggle('finishes')">
            <span>WALL FINISHES</span>
            <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>
          @if (sections['finishes']) {
            <div class="section-body grid-2x2">
              @for (finish of svc.wallFinishes(); track finish.id) {
                <div class="finish-card" [class.active]="activeFinish === finish.id" (click)="activeFinish = finish.id">
                  <div class="finish-preview" [style.background]="finish.category === 'paint' ? '#3B82F6' : '#E5E7EB'">
                    <span class="finish-icon" *ngIf="finish.category === 'paint'"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></span>
                  </div>
                  <div class="finish-label">{{ finish.name }}</div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Furniture Catalog Accordion -->
        <div class="accordion-section" [class.open]="sections['furniture']">
          <div class="section-header" (click)="toggle('furniture')">
            <span>FURNITURE</span>
            <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>
          @if (sections['furniture']) {
            <div class="section-body grid-4x4">
              @for (item of getCatalog('furniture'); track item.id) {
                <div class="catalog-item" draggable="true">
                  <div class="item-icon">
                    <svg *ngIf="item.iconUrl === 'sofa'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"/><path d="M2 13h20v5H2z"/><path d="M6 18v2M18 18v2"/></svg>
                    <svg *ngIf="item.iconUrl === 'table'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 9h16v2H4zM6 11v8M18 11v8"/></svg>
                  </div>
                  <div class="item-label">{{ item.name }}</div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Architectural Accordion -->
        <div class="accordion-section" [class.open]="sections['architectural']">
          <div class="section-header" (click)="toggle('architectural')">
            <span>ARCHITECTURAL</span>
            <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>
          @if (sections['architectural']) {
            <div class="section-body grid-4x4">
              @for (item of getCatalog('architectural'); track item.id) {
                <div class="catalog-item" draggable="true">
                  <div class="item-icon">
                    <svg *ngIf="item.iconUrl === 'window'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 12h18M12 3v18"/></svg>
                    <svg *ngIf="item.iconUrl === 'door'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v15"/><path d="M2 20h20M14 12v.01"/></svg>
                  </div>
                  <div class="item-label">{{ item.name }}</div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .left-panel-container {
      display: flex;
      height: 100%;
    }
    .icon-rail {
      width: 48px;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px 0;
      gap: 16px;
      background: var(--surface);
      border-right: 1px solid var(--border);
    }
    .rail-icon {
      color: var(--text-muted);
      cursor: pointer;
      transition: color 0.2s;
    }
    .rail-icon:hover { color: var(--text); }
    .rail-icon.active { color: var(--accent); }
    .spacer { flex: 1; }
    
    .panel-content {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background: var(--surface-raised);
    }
    .accordion-section {
      margin-bottom: 16px;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      cursor: pointer;
      padding: 8px 0;
      user-select: none;
    }
    .section-header .chevron { transition: transform 0.2s; }
    .accordion-section.open .chevron { transform: rotate(180deg); }
    
    .section-body { margin-top: 8px; }
    
    /* List items */
    .plan-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px;
      border-radius: 8px;
      font-size: 13px;
      color: var(--text);
      cursor: pointer;
      margin-bottom: 4px;
    }
    .plan-item:hover { background: var(--surface-hover); }
    .plan-item.active { background: var(--accent-light, #e0e7ff); color: var(--accent); }
    
    /* 2x2 Grid for Finishes */
    .grid-2x2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .finish-card {
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px;
      cursor: pointer;
      transition: border-color 0.2s;
    }
    .finish-card:hover { border-color: var(--text-muted); }
    .finish-card.active { border-color: var(--accent); }
    .finish-preview {
      height: 60px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      margin-bottom: 6px;
    }
    .finish-label {
      font-size: 11px;
      color: var(--text);
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    /* 4x4 Grid for Catalog Items */
    .grid-4x4 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }
    .catalog-item {
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 12px 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: grab;
      transition: border-color 0.2s;
    }
    .catalog-item:hover { border-color: var(--text-muted); }
    .item-icon { color: var(--text-muted); margin-bottom: 4px; }
    .item-label { font-size: 10px; color: var(--text); text-align: center; }
  `]
})
export class FloorplanLeftPanel {
  sections: Record<string, boolean> = {
    plans: true,
    finishes: true,
    furniture: true,
    architectural: true
  };
  
  activeFinish = 'wf1';

  constructor(public svc: FloorPlanService) {}

  toggle(section: string) {
    this.sections[section] = !this.sections[section];
  }

  getCatalog(category: 'furniture' | 'architectural') {
    return this.svc.catalog().filter((c: any) => c.category === category);
  }
}
