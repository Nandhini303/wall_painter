import { Component, OnInit, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProjectService, Project } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

import { CommandPaletteComponent, CommandPaletteService } from '../../components/command-palette/command-palette.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { ModalService } from '../../services/modal.service';

import { AppIconComponent } from '../../components/app-icon/app-icon.component';

import { WorkspaceService, Workspace } from '../../services/workspace.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CommandPaletteComponent, ConfirmDialogComponent, AppIconComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  projects = signal<Project[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);


  // Active Nav Sidebar View Tab
  activeTab = signal<'dashboard' | 'projects' | 'templates' | 'paint-library' | 'uploads' | 'favorites' | 'team' | 'notifications' | 'account' | 'settings' | 'help'>('dashboard');
  activeTheme = signal<'light' | 'dark'>('light');

  showWorkspaceDropdown = signal(false);
  showCreateWorkspaceModal = signal(false);

  // Workspace Creation Form State
  newWsName = '';
  newWsType: 'Personal' | 'Team' | 'Client' = 'Personal';
  newWsColor = '#2563eb';

  viewMode = signal<'grid' | 'list'>('grid');
  searchQuery = signal('');
  activeFilter = signal<'all' | 'favorites' | 'recent'>('all');
  sortBy = signal<'newest' | 'oldest' | 'name'>('newest');



  // UI Modals & Dropdowns
  showCreateModal = signal(false);
  showNotifications = signal(false);
  showUserMenu = signal(false);

  // Project Creation State
  newProjectName = '';
  selectedFile: File | null = null;
  uploadProgress = signal<number>(0);
  isDragOver = signal(false);
  isSubmitting = signal(false);

  // Favorites & Renaming
  favoritesSet = signal<Set<string>>(new Set());
  editingProjectId = signal<string | null>(null);
  editingName = '';

  // Filtered & Sorted Projects Computed Signal
  filteredProjects = computed(() => {
    let list = [...this.projects()];

    // 1. Search Query Filter
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      list = list.filter(p => p.name.toLowerCase().includes(query));
    }

    // 2. Tab Filter
    const filter = this.activeFilter();
    if (filter === 'favorites') {
      list = list.filter(p => this.favoritesSet().has(p._id));
    } else if (filter === 'recent') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      list = list.filter(p => new Date(p.updatedAt) >= oneWeekAgo);
    }

    // 3. Sorting
    const sort = this.sortBy();
    if (sort === 'newest') {
      list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } else if (sort === 'oldest') {
      list.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
    } else if (sort === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  });

  // Analytics Stats Computed
  totalCount = computed(() => this.projects().length);
  favoritesCount = computed(() => this.favoritesSet().size);

  userName = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return 'User';
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.email.split('@')[0];
  });

  userInitial = computed(() => {
    const name = this.userName();
    return name ? name[0].toUpperCase() : 'U';
  });

  constructor(
    private projectService: ProjectService,
    public authService: AuthService,
    public toastService: ToastService,
    public modalService: ModalService,
    public paletteService: CommandPaletteService,
    public workspaceService: WorkspaceService,
    private router: Router
  ) {}

  // Workspace Actions
  toggleWorkspaceDropdown(): void {
    this.showWorkspaceDropdown.set(!this.showWorkspaceDropdown());
  }

  selectWorkspace(id: string): void {
    this.workspaceService.setActiveWorkspace(id);
    this.showWorkspaceDropdown.set(false);
    this.toastService.info(`Switched to ${this.workspaceService.activeWorkspace().name}`);
  }

  openCreateWorkspaceModal(): void {
    this.showWorkspaceDropdown.set(false);
    this.showCreateWorkspaceModal.set(true);
  }

  closeCreateWorkspaceModal(): void {
    this.showCreateWorkspaceModal.set(false);
    this.newWsName = '';
  }

  submitCreateWorkspace(): void {
    if (!this.newWsName.trim()) {
      this.toastService.error('Workspace name is required.');
      return;
    }

    const created = this.workspaceService.createWorkspace(this.newWsName, this.newWsType, this.newWsColor);
    this.closeCreateWorkspaceModal();
    this.toastService.success(`Workspace "${created.name}" created successfully!`);
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.isLoading.set(true);
    this.projectService.listProjects().subscribe({
      next: (res) => {
        this.projects.set(res.projects || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toastService.error('Failed to load projects from server.');
      }
    });
  }

  // View Mode Toggles
  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  setFilter(filter: 'all' | 'favorites' | 'recent'): void {
    this.activeFilter.set(filter);
  }

  // Favorite Star Optimistic Toggle
  toggleFavorite(projectId: string, event: Event): void {
    event.stopPropagation();
    const current = new Set(this.favoritesSet());
    if (current.has(projectId)) {
      current.delete(projectId);
      this.toastService.info('Removed from favorites.');
    } else {
      current.add(projectId);
      this.toastService.success('Added to favorites!');
    }
    this.favoritesSet.set(current);
  }

  // Inline Project Renaming
  startRename(project: Project, event: Event): void {
    event.stopPropagation();
    this.editingProjectId.set(project._id);
    this.editingName = project.name;
  }

  saveRename(projectId: string, event: Event): void {
    event.stopPropagation();
    if (!this.editingName.trim()) return;

    this.projectService.updateProject(projectId, { name: this.editingName }).subscribe({
      next: (updated) => {
        this.projects.update(list => list.map(p => p._id === projectId ? { ...p, name: updated.name } : p));
        this.editingProjectId.set(null);
        this.toastService.success('Project renamed successfully.');
      },
      error: () => this.toastService.error('Failed to rename project.')
    });
  }

  cancelRename(event: Event): void {
    event.stopPropagation();
    this.editingProjectId.set(null);
  }

  // Clipboard Ctrl+V Image Paste Listener
  @HostListener('window:paste', ['$event'])
  handlePaste(event: ClipboardEvent): void {
    const items = event.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          this.toastService.info('Pasted image from clipboard!');
          this.handleDirectFileUpload(file);
          break;
        }
      }
    }
  }

  // Drag & Drop Desktop Upload Handlers
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        this.handleDirectFileUpload(file);
      } else {
        this.toastService.error('Please drop an image file (PNG, JPG, WEBP).');
      }
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  handleDirectFileUpload(file: File): void {
    const defaultName = file.name.replace(/\.[^/.]+$/, '') + ' Design';
    this.isSubmitting.set(true);
    this.uploadProgress.set(20);

    const interval = setInterval(() => {
      if (this.uploadProgress() < 85) {
        this.uploadProgress.update(v => v + 15);
      }
    }, 150);

    this.projectService.createProject(defaultName, file).subscribe({
      next: (proj) => {
        clearInterval(interval);
        this.uploadProgress.set(100);
        this.isSubmitting.set(false);
        this.toastService.success('New project created from desktop upload!');
        setTimeout(() => {
          this.uploadProgress.set(0);
          this.router.navigate(['/canvas', proj._id]);
        }, 300);
      },
      error: (err) => {
        clearInterval(interval);
        this.uploadProgress.set(0);
        this.isSubmitting.set(false);
        this.toastService.error(err.error?.error || 'Failed to upload room image.');
      }
    });
  }

  // Project Creation Modal
  openCreateModal(): void {
    this.newProjectName = '';
    this.selectedFile = null;
    this.errorMessage.set(null);
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  createProject(): void {
    if (!this.newProjectName.trim()) {
      this.errorMessage.set('Project name is required.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.projectService.createProject(this.newProjectName, this.selectedFile || undefined).subscribe({
      next: (project) => {
        this.isSubmitting.set(false);
        this.closeCreateModal();
        this.toastService.success('Project created successfully!');
        this.router.navigate(['/canvas', project._id]);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.error || 'Failed to create project.');
      }
    });
  }

  // Delete Project Optimistic Action
  async deleteProject(projectId: string, event: Event): Promise<void> {
    event.stopPropagation();
    
    const confirmed = await this.modalService.confirm({
      title: 'Delete Visualizer Project?',
      message: 'Are you sure you want to delete this paint project? This action is permanent and cannot be undone.',
      confirmText: 'Delete Project',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (confirmed) {
      // Optimistic Removal
      const original = this.projects();
      this.projects.update(list => list.filter(p => p._id !== projectId));

      this.projectService.deleteProject(projectId).subscribe({
        next: () => {
          this.toastService.success('Project deleted.');
        },
        error: () => {
          this.projects.set(original);
          this.toastService.error('Failed to delete project.');
        }
      });
    }
  }

  greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  });

  fallbackImage = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80';

  onThumbnailError(event: any): void {
    if (event && event.target) {
      event.target.src = this.fallbackImage;
    }
  }

  // Delete All Projects Action
  async deleteAllProjects(): Promise<void> {
    if (this.projects().length === 0) {
      this.toastService.info('No projects to delete.');
      return;
    }

    const confirmed = await this.modalService.confirm({
      title: 'Delete All Projects?',
      message: 'Are you sure you want to delete ALL projects in this workspace? This action is permanent and cannot be undone.',
      confirmText: 'Delete All Projects',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (confirmed) {
      const original = this.projects();
      this.projects.set([]); // Optimistic update

      this.projectService.deleteAllProjects().subscribe({
        next: (res) => {
          this.toastService.success(res?.message || 'All projects deleted successfully.');
        },
        error: () => {
          this.projects.set(original); // Rollback
          this.toastService.error('Failed to delete all projects.');
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.toastService.info('Logged out.');
  }
}
