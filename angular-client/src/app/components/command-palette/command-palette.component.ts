import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export interface CommandItem {
  id: string;
  icon: string;
  label: string;
  category: 'Navigation' | 'Actions' | 'System';
  action: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class CommandPaletteService {
  isOpen = signal(false);

  toggle(): void {
    this.isOpen.set(!this.isOpen());
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }
}

import { Injectable } from '@angular/core';
import { AuthService } from '../../services/auth.service';

import { AppIconComponent } from '../app-icon/app-icon.component';

@Component({
  selector: 'app-command-palette',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconComponent],
  templateUrl: './command-palette.component.html',
  styleUrls: ['./command-palette.component.scss']
})
export class CommandPaletteComponent {
  query = signal('');

  commands: CommandItem[] = [];

  constructor(
    public paletteService: CommandPaletteService,
    private router: Router,
    private authService: AuthService
  ) {
    this.commands = [
      { id: '1', icon: 'dashboard', label: 'Go to Dashboard', category: 'Navigation', action: () => this.navigate('/dashboard') },
      { id: '2', icon: 'canvas', label: 'Open Canvas Visualizer', category: 'Navigation', action: () => this.navigate('/canvas') },
      { id: '3', icon: 'admin', label: 'Admin Portal', category: 'Navigation', action: () => this.navigate('/admin') },
      { id: '4', icon: 'plus', label: 'Create New Project', category: 'Actions', action: () => this.navigate('/dashboard') },
      { id: '5', icon: 'user', label: 'Log Out', category: 'System', action: () => this.authService.logout() }
    ];
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.paletteService.toggle();
    } else if (event.key === 'Escape' && this.paletteService.isOpen()) {
      this.paletteService.close();
    }
  }

  get filteredCommands(): CommandItem[] {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.commands;
    return this.commands.filter(c => c.label.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
  }

  execute(cmd: CommandItem): void {
    this.paletteService.close();
    cmd.action();
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }
}
