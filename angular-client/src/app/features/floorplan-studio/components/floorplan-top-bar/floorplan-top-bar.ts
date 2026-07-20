import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-floorplan-top-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="top-bar">
      <div class="left-section">
        <div class="app-mark">A</div>
        <a routerLink="/dashboard" class="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
        </a>
        <div class="breadcrumb">
          <span class="label">Project:</span>
          <input type="text" value="Skyline Residence" class="project-name-input" />
        </div>
      </div>

      <div class="center-section">
        <h1 class="view-title">Skyline Residence - Ground Floor</h1>
      </div>

      <div class="right-section">
        <button class="btn-ghost">Save</button>
        <button class="btn-accent">Export</button>
        <div class="avatar">AL</div>
        <div class="search-box">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
          <input type="text" placeholder="Search" />
        </div>
      </div>
    </header>
  `,
  styles: [`
    .top-bar {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      background-color: var(--surface);
      border-bottom: 1px solid var(--border);
    }
    .left-section, .right-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .app-mark {
      font-weight: 800;
      font-size: 20px;
      color: var(--accent);
      margin-right: 12px;
    }
    .back-link {
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      border-radius: 4px;
      transition: background 0.2s;
    }
    .back-link:hover { background: var(--surface-hover); }
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .label {
      font-size: 12px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .project-name-input {
      background: transparent;
      border: none;
      color: var(--text);
      font-weight: 500;
      font-size: 14px;
      padding: 4px;
      border-radius: 4px;
    }
    .project-name-input:focus {
      outline: none;
      background: var(--surface-hover);
    }
    .view-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
      margin: 0;
    }
    .btn-ghost {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text);
      padding: 6px 16px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
    }
    .btn-ghost:hover { background: var(--surface-hover); }
    .btn-accent {
      background: var(--accent);
      border: none;
      color: white;
      padding: 6px 16px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
    }
    .btn-accent:hover { filter: brightness(1.1); }
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--accent-light, #e0e7ff);
      color: var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 12px;
    }
    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--surface-hover);
      padding: 6px 12px;
      border-radius: 20px;
      color: var(--text-muted);
    }
    .search-box input {
      background: transparent;
      border: none;
      color: var(--text);
      outline: none;
      width: 120px;
    }
  `]
})
export class FloorplanTopBar {}
