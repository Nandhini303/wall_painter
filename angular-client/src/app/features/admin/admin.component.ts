import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService, AuditLog } from '../../services/admin.service';
import { CatalogService, PaintColor, PaintTexture } from '../../services/catalog.service';
import { AuthService, User } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { WorkspaceService } from '../../services/workspace.service';

import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { ModalService } from '../../services/modal.service';
import { AppIconComponent } from '../../components/app-icon/app-icon.component';
import { io, Socket } from 'socket.io-client';

export type AdminSection =
  | 'overview'
  | 'storage'
  | 'templates'
  | 'collections'
  | 'customColors'
  | 'textures'
  | 'brushes'
  | 'users'
  | 'settings'
  | 'auditLogs'
  | 'systemHealth';

export interface AdminNavItem {
  id: AdminSection;
  label: string;
  icon: string;
}

export interface WallTemplate {
  id: string;
  name: string;
  category: string;
  status: 'Published' | 'Draft';
  usageCount: number;
  imageUri: string;
  tags: string[];
  description: string;
}

export interface BrushPreset {
  id: string;
  name: string;
  type: 'Round' | 'Textured' | 'Spray' | 'Blend';
  defaultSize: number;
  defaultHardness: number;
  defaultOpacity: number;
}

export interface HealthCheck {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  latency?: string;
}

export interface SettingsSection {
  id: string;
  label: string;
  description: string;
  hasChanges: boolean;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConfirmDialogComponent, AppIconComponent],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  // --- Navigation ---
  activeSection = signal<AdminSection>('overview');
  sidebarCollapsed = signal(false);

  navItems: AdminNavItem[] = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'storage', label: 'Storage & Assets', icon: 'grid' },
    { id: 'templates', label: 'Template Manager', icon: 'grid' },
    { id: 'collections', label: 'Color Collections', icon: 'canvas' },
    { id: 'customColors', label: 'Custom Colors', icon: 'fill' },
    { id: 'textures', label: 'Textures & Materials', icon: 'brush' },
    { id: 'brushes', label: 'Brush Library', icon: 'select' },
    { id: 'users', label: 'Users & Workspaces', icon: 'user' },
    { id: 'settings', label: 'Platform Settings', icon: 'grid' },
    { id: 'auditLogs', label: 'Audit Logs', icon: 'info' },
    { id: 'systemHealth', label: 'System Health', icon: 'admin' }
  ];

  // --- Data Signals ---
  users = signal<User[]>([]);
  colors = signal<PaintColor[]>([]);
  textures = signal<PaintTexture[]>([]);
  auditLogs = signal<AuditLog[]>([]);
  analytics = signal<any>(null);
  isLoading = signal(true);
  searchQuery = signal('');
  
  // Dashboard Migrated Widgets Data
  colorCollections = [
    { name: 'Minimal Whites', count: '14 Swatches', colors: ['#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0'] },
    { name: 'Warm Neutrals', count: '18 Swatches', colors: ['#fef3c7', '#fde68a', '#f59e0b', '#d97706'] },
    { name: 'Modern Concrete', count: '12 Swatches', colors: ['#94a3b8', '#64748b', '#475569', '#334155'] },
    { name: 'Luxury Black', count: '8 Swatches', colors: ['#1e293b', '#0f172a', '#020617', '#111827'] },
    { name: 'Nature Greens', count: '16 Swatches', colors: ['#d1fae5', '#6ee7b7', '#10b981', '#047857'] },
    { name: 'Earth Tones', count: '20 Swatches', colors: ['#ffedd5', '#fed7aa', '#f97316', '#c2410c'] }
  ];

  recentMaterials = [
    { name: 'Smooth Satin Finish', finish: 'Satin', manufacturer: 'Sherwin-Williams', usage: '42 Uses' },
    { name: 'Textured Stucco Wall', finish: 'Matte Stucco', manufacturer: 'Benjamin Moore', usage: '28 Uses' },
    { name: 'Venetian Plaster Elegance', finish: 'Plaster Gloss', manufacturer: 'Behr Architectural', usage: '35 Uses' },
    { name: 'Matte Velvet Plaster', finish: 'Velvet', manufacturer: 'PPG Paints', usage: '19 Uses' }
  ];

  favoriteTemplates = [
    { id: 'living-room', name: 'Cozy Living Room', category: 'Residential', imageUri: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80' },
    { id: 'bedroom', name: 'Modern Bedroom', category: 'Residential', imageUri: 'https://images.unsplash.com/photo-1540518614846-7ede433c517a?auto=format&fit=crop&w=600&q=80' },
    { id: 'kitchen', name: 'Minimalist Kitchen', category: 'Kitchen & Dining', imageUri: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80' },
    { id: 'office', name: 'Executive Office', category: 'Commercial', imageUri: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80' },
    { id: 'exterior', name: 'Exterior Facade', category: 'Exterior', imageUri: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80' }
  ];

  // Storage Mock Data
  storageMetrics = signal<{
    quota: any;
    assets: any[];
    totalUsedStr: string;
    usagePercentage: number;
    imageStr: string;
    mapStr: string;
    assetStr: string;
  } | null>(null);
  
  private socket!: Socket;

  // --- Templates ---
  templates = signal<WallTemplate[]>([
    { id: 't1', name: 'Cozy Living Room', category: 'Residential', status: 'Published', usageCount: 142, imageUri: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80', tags: ['living', 'warm'], description: 'Warm living room with natural light' },
    { id: 't2', name: 'Modern Bedroom', category: 'Residential', status: 'Published', usageCount: 98, imageUri: 'https://images.unsplash.com/photo-1540518614846-7ede433c517a?auto=format&fit=crop&w=400&q=80', tags: ['bedroom', 'modern'], description: 'Clean modern bedroom design' },
    { id: 't3', name: 'Minimalist Kitchen', category: 'Kitchen & Dining', status: 'Draft', usageCount: 67, imageUri: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80', tags: ['kitchen', 'minimal'], description: 'Sleek minimalist kitchen' },
    { id: 't4', name: 'Executive Office', category: 'Commercial', status: 'Published', usageCount: 54, imageUri: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=400&q=80', tags: ['office', 'professional'], description: 'Professional executive office' },
    { id: 't5', name: 'Exterior Facade', category: 'Exterior', status: 'Published', usageCount: 89, imageUri: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80', tags: ['exterior', 'facade'], description: 'Exterior building facade' }
  ]);

  // --- Brush Presets ---
  brushPresets = signal<BrushPreset[]>([
    { id: 'b1', name: 'Soft Round', type: 'Round', defaultSize: 24, defaultHardness: 50, defaultOpacity: 100 },
    { id: 'b2', name: 'Hard Round', type: 'Round', defaultSize: 12, defaultHardness: 100, defaultOpacity: 100 },
    { id: 'b3', name: 'Textured Roller', type: 'Textured', defaultSize: 48, defaultHardness: 60, defaultOpacity: 85 },
    { id: 'b4', name: 'Fine Spray', type: 'Spray', defaultSize: 32, defaultHardness: 30, defaultOpacity: 70 },
    { id: 'b5', name: 'Smooth Blend', type: 'Blend', defaultSize: 20, defaultHardness: 40, defaultOpacity: 60 }
  ]);

  // --- System Health ---
  healthChecks = signal<HealthCheck[]>([
    { name: 'Express API Server', status: 'operational', latency: '12ms' },
    { name: 'MongoDB Atlas Database', status: 'operational', latency: '45ms' },
    { name: 'Socket.IO Real-Time Sync', status: 'operational', latency: '8ms' },
    { name: 'Cloud Storage Service', status: 'operational', latency: '120ms' }
  ]);

  // --- Settings Sections ---
  settingsSections: SettingsSection[] = [
    { id: 'general', label: 'General', description: 'Platform name, default units, default color format', hasChanges: false },
    { id: 'uploads', label: 'Uploads', description: 'Max file size, allowed formats, storage quota per plan', hasChanges: false },
    { id: 'realtime', label: 'Realtime Sync', description: 'Socket.IO connection status, reconnect settings', hasChanges: false },
    { id: 'notifications', label: 'Notifications', description: 'Email templates, in-app notification toggles', hasChanges: false },
    { id: 'security', label: 'Security', description: 'Session timeout, 2FA requirement, password policy', hasChanges: false },
    { id: 'branding', label: 'Branding', description: 'Logo upload, primary/accent color override for white-label', hasChanges: false }
  ];

  // --- Color Form ---
  newColor = { brandName: '', colorCode: '', name: '', hexCode: '#2563EB', r: 37, g: 99, b: 235 };
  newTexture = { name: '', imageUri: '', roughnessMapUri: '', scaleDefault: 1.0 };

  // --- Template Upload Modal ---
  showTemplateUploadModal = signal(false);
  newTemplate = { name: '', category: 'Residential', tags: '', description: '', imageUri: '' };

  // --- Brush Preset Modal ---
  showBrushPresetModal = signal(false);
  newBrush: BrushPreset = { id: '', name: '', type: 'Round', defaultSize: 24, defaultHardness: 50, defaultOpacity: 100 };

  // --- Invite User Modal ---
  showInviteUserModal = signal(false);
  newInvite = { email: '', role: 'User', workspace: '1' };

  // --- Computed Breadcrumb ---
  breadcrumbLabel = computed(() => {
    const item = this.navItems.find(n => n.id === this.activeSection());
    return item ? item.label : 'Overview';
  });

  // --- Computed Search Filters ---
  filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.users();
    return this.users().filter(u => u.firstName?.toLowerCase().includes(q) || u.lastName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  });

  filteredColors = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.colors();
    return this.colors().filter(c => c.name.toLowerCase().includes(q) || c.colorCode.toLowerCase().includes(q) || c.brandName.toLowerCase().includes(q));
  });

  filteredTextures = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.textures();
    return this.textures().filter(t => t.name.toLowerCase().includes(q));
  });

  filteredAuditLogs = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.auditLogs();
    return this.auditLogs().filter(l => l.action.toLowerCase().includes(q) || l.details.toLowerCase().includes(q));
  });

  filteredTemplates = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.templates();
    return this.templates().filter(t => t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
  });

  constructor(
    private adminService: AdminService,
    private catalogService: CatalogService,
    public authService: AuthService,
    public toastService: ToastService,
    public modalService: ModalService,
    public workspaceService: WorkspaceService
  ) {}

  ngOnInit(): void {
    this.loadAllData();
    this.setupSocket();
  }

  setupSocket(): void {
    this.socket = io('http://localhost:5000');
    this.socket.on('admin:users:updated', () => {
      // Background refresh so we don't flash loading skeleton
      this.adminService.listUsers().subscribe({
        next: (res) => this.users.set(res),
        error: () => {}
      });
    });
  }

  setSection(section: AdminSection): void {
    this.activeSection.set(section);
    this.searchQuery.set('');
  }

  // --- Data Loading ---
  loadAllData(): void {
    this.isLoading.set(true);
    this.loadUsers();
    this.loadCatalogs();
    this.loadAuditLogs();
    this.loadAnalytics();
    this.loadStorageMetrics();
  }

  loadStorageMetrics(): void {
    this.adminService.getStorageAnalytics().subscribe({
      next: (res) => {
        const bytesToGB = (bytes: number) => (bytes / (1024 * 1024 * 1024)).toFixed(2);
        const bytesToMB = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1);
        
        const q = res.quota;
        this.storageMetrics.set({
          quota: q,
          assets: res.assets,
          totalUsedStr: `${bytesToGB(q.totalUsedBytes)} GB / ${bytesToGB(q.totalQuotaBytes)} GB (${Math.round((q.totalUsedBytes / q.totalQuotaBytes) * 100)}%)`,
          usagePercentage: Math.round((q.totalUsedBytes / q.totalQuotaBytes) * 100),
          imageStr: `${bytesToGB(q.imageBytes)} GB`,
          mapStr: `${bytesToMB(q.mapBytes)} MB`,
          assetStr: `${bytesToMB(q.assetBytes)} MB`
        });
      },
      error: (err) => console.error('Failed to load storage metrics', err)
    });
  }

  loadUsers(): void {
    this.adminService.listUsers().subscribe({
      next: (res) => { this.users.set(res); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
  }

  loadCatalogs(): void {
    this.catalogService.listColors().subscribe(c => this.colors.set(c));
    this.catalogService.listTextures().subscribe(t => this.textures.set(t));
  }

  loadAuditLogs(): void {
    this.adminService.listAuditLogs().subscribe({
      next: (res) => this.auditLogs.set(res.logs || []),
      error: () => {}
    });
  }

  loadAnalytics(): void {
    this.adminService.getAnalytics().subscribe({
      next: (res) => this.analytics.set(res),
      error: () => {}
    });
  }

  // --- Invite User Actions ---
  openInviteUserModal(): void {
    this.showInviteUserModal.set(true);
  }

  closeInviteUserModal(): void {
    this.showInviteUserModal.set(false);
    this.newInvite = { email: '', role: 'User', workspace: '1' };
  }

  submitInviteUser(): void {
    if (!this.newInvite.email || !this.newInvite.role) {
      this.toastService.error('Email and role are required.');
      return;
    }
    this.adminService.inviteUser(this.newInvite.email, this.newInvite.role, this.newInvite.workspace).subscribe({
      next: () => {
        this.toastService.success(`User ${this.newInvite.email} invited!`);
        this.closeInviteUserModal();
        // The socket event will trigger a data reload automatically
      },
      error: (err) => this.toastService.error(err.error?.error || 'Failed to invite user.')
    });
  }

  // --- User Actions ---
  async changeRole(userId: string, currentRole: string): Promise<void> {
    const roles: ('Admin' | 'Designer' | 'User')[] = ['Admin', 'Designer', 'User'];
    const nextRole = roles[(roles.indexOf(currentRole as any) + 1) % roles.length];

    const confirmed = await this.modalService.confirm({
      title: 'Update User Role Permission?',
      message: `Change this user's role from ${currentRole} to ${nextRole}?`,
      confirmText: `Change to ${nextRole}`,
      cancelText: 'Cancel',
      variant: 'warning'
    });

    if (confirmed) {
      this.adminService.updateUserRole(userId, nextRole).subscribe({
        next: () => {
          this.toastService.success(`Role updated to ${nextRole}`);
          this.loadUsers();
          this.loadAuditLogs();
        },
        error: () => this.toastService.error('Failed to update user role.')
      });
    }
  }

  // --- Color Form ---
  onHexChange(): void {
    const hex = this.newColor.hexCode.replace('#', '');
    if (hex.length === 6) {
      this.newColor.r = parseInt(hex.substring(0, 2), 16);
      this.newColor.g = parseInt(hex.substring(2, 4), 16);
      this.newColor.b = parseInt(hex.substring(4, 6), 16);
    }
  }

  addColor(): void {
    if (!this.newColor.name || !this.newColor.brandName || !this.newColor.colorCode) {
      this.toastService.error('Please fill out all color fields.');
      return;
    }
    this.catalogService.addColor(this.newColor).subscribe({
      next: (c) => {
        this.colors.update(list => [c, ...list]);
        this.toastService.success('Paint color added to catalog!');
        this.newColor = { brandName: '', colorCode: '', name: '', hexCode: '#2563EB', r: 37, g: 99, b: 235 };
      },
      error: (err) => this.toastService.error(err.error?.error || 'Failed to add color.')
    });
  }

  // --- Texture Form ---
  addTexture(): void {
    if (!this.newTexture.name || !this.newTexture.imageUri) {
      this.toastService.error('Please provide texture name and image URL.');
      return;
    }
    this.catalogService.addTexture(this.newTexture).subscribe({
      next: (t) => {
        this.textures.update(list => [t, ...list]);
        this.toastService.success('Wall texture added to library!');
        this.newTexture = { name: '', imageUri: '', roughnessMapUri: '', scaleDefault: 1.0 };
      },
      error: (err) => this.toastService.error(err.error?.error || 'Failed to add texture.')
    });
  }

  // --- Drag and Drop File Handlers ---
  onDragOver(event: DragEvent, type: 'template' | 'texture'): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent, type: 'template' | 'texture'): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent, type: 'template' | 'texture'): void {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0], type);
    }
  }

  onFileSelected(event: Event, type: 'template' | 'texture'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0], type);
    }
  }

  private handleFile(file: File, type: 'template' | 'texture'): void {
    if (!file.type.startsWith('image/')) {
      this.toastService.error('Please upload an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'template') {
        this.newTemplate.imageUri = result;
      } else if (type === 'texture') {
        this.newTexture.imageUri = result;
      }
    };
    reader.readAsDataURL(file);
  }

  // --- Template Actions ---
  openTemplateUploadModal(): void { this.showTemplateUploadModal.set(true); }
  closeTemplateUploadModal(): void { this.showTemplateUploadModal.set(false); this.newTemplate = { name: '', category: 'Residential', tags: '', description: '', imageUri: '' }; }

  submitNewTemplate(): void {
    if (!this.newTemplate.name) { this.toastService.error('Template name is required.'); return; }
    const tmpl: WallTemplate = {
      id: `t-${Date.now()}`,
      name: this.newTemplate.name,
      category: this.newTemplate.category,
      status: 'Draft',
      usageCount: 0,
      imageUri: this.newTemplate.imageUri || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80',
      tags: this.newTemplate.tags.split(',').map(t => t.trim()).filter(Boolean),
      description: this.newTemplate.description
    };
    this.templates.update(list => [tmpl, ...list]);
    this.closeTemplateUploadModal();
    this.toastService.success(`Template "${tmpl.name}" created as Draft.`);
  }

  async deleteTemplate(id: string): Promise<void> {
    const confirmed = await this.modalService.confirm({
      title: 'Delete Template?',
      message: 'This action cannot be undone. The template will be permanently removed.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      this.templates.update(list => list.filter(t => t.id !== id));
      this.toastService.success('Template deleted.');
    }
  }

  toggleTemplateStatus(id: string): void {
    this.templates.update(list => list.map(t => t.id === id ? { ...t, status: t.status === 'Published' ? 'Draft' as const : 'Published' as const } : t));
  }

  // --- Brush Preset Actions ---
  openBrushPresetModal(): void { this.showBrushPresetModal.set(true); }
  closeBrushPresetModal(): void { this.showBrushPresetModal.set(false); this.newBrush = { id: '', name: '', type: 'Round', defaultSize: 24, defaultHardness: 50, defaultOpacity: 100 }; }

  submitNewBrush(): void {
    if (!this.newBrush.name) { this.toastService.error('Brush name is required.'); return; }
    const brush: BrushPreset = { ...this.newBrush, id: `b-${Date.now()}` };
    this.brushPresets.update(list => [...list, brush]);
    this.closeBrushPresetModal();
    this.toastService.success(`Brush preset "${brush.name}" added.`);
  }

  async deleteBrush(id: string): Promise<void> {
    const confirmed = await this.modalService.confirm({
      title: 'Delete Brush Preset?',
      message: 'This brush preset will be permanently removed.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      this.brushPresets.update(list => list.filter(b => b.id !== id));
      this.toastService.success('Brush preset deleted.');
    }
  }

  // --- Settings Actions ---
  saveSettings(sectionId: string): void {
    const idx = this.settingsSections.findIndex(s => s.id === sectionId);
    if (idx >= 0) {
      this.settingsSections[idx].hasChanges = false;
    }
    this.toastService.success(`${this.settingsSections[idx]?.label || 'Settings'} saved.`);
  }

  markSettingsChanged(sectionId: string): void {
    const idx = this.settingsSections.findIndex(s => s.id === sectionId);
    if (idx >= 0) {
      this.settingsSections[idx].hasChanges = true;
    }
  }
}
