import { Injectable, signal, computed } from '@angular/core';

export interface Workspace {
  id: string;
  name: string;
  type: 'Personal' | 'Team' | 'Client';
  color: string;
  initial: string;
  isDefault?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  private workspacesSignal = signal<Workspace[]>([
    { id: '1', name: 'Personal Workspace', type: 'Personal', color: '#2563eb', initial: 'P', isDefault: true },
    { id: '2', name: 'Enterprise Design Team', type: 'Team', color: '#10b981', initial: 'E' },
    { id: '3', name: 'Luxury Client Studio', type: 'Client', color: '#6366f1', initial: 'L' }
  ]);

  private activeWorkspaceIdSignal = signal<string>('1');

  workspaces = computed(() => this.workspacesSignal());
  activeWorkspace = computed(() => {
    const active = this.workspacesSignal().find(w => w.id === this.activeWorkspaceIdSignal());
    return active || this.workspacesSignal()[0];
  });

  setActiveWorkspace(id: string): void {
    this.activeWorkspaceIdSignal.set(id);
  }

  createWorkspace(name: string, type: 'Personal' | 'Team' | 'Client', color: string): Workspace {
    const initial = name.trim().charAt(0).toUpperCase() || 'W';
    const newWs: Workspace = {
      id: `ws-${Date.now()}`,
      name,
      type,
      color,
      initial
    };
    this.workspacesSignal.update(list => [...list, newWs]);
    this.activeWorkspaceIdSignal.set(newWs.id);
    return newWs;
  }
}
