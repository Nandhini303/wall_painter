import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssetService, CloudinaryAsset } from '../../../../services/asset.service';
import { UploadService, UploadProgress } from '../../../../services/upload.service';
import { ToastService } from '../../../../services/toast.service';
import { SocketService } from '../../../../services/socket.service';

import { LucideAngularModule, Image, ChevronDown, ChevronUp, UploadCloud, Copy, Trash2 } from '@lucide/angular';

@Component({
  selector: 'app-asset-library-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule.pick({ Image, ChevronDown, ChevronUp, UploadCloud, Copy, Trash2 })],
  templateUrl: './asset-library-panel.html',
  styleUrls: ['./asset-library-panel.scss']
})
export class AssetLibraryPanelComponent implements OnInit {
  isExpanded = signal(true);
  uploading = signal(false);
  uploadProgress = signal(0);
  searchQuery = signal('');
  activeFilter = signal('All');

  constructor(
    public assetService: AssetService,
    private uploadService: UploadService,
    private toastService: ToastService,
    private socketService: SocketService
  ) {}

  ngOnInit() {
    this.assetService.loadAssets();

    this.socketService.on('asset:uploaded', (asset: CloudinaryAsset) => {
      this.assetService.assets.update(assets => [asset, ...assets]);
    });

    this.socketService.on('asset:deleted', (data: { publicId: string }) => {
      this.assetService.assets.update(assets => assets.filter(a => a.publicId !== data.publicId));
    });
  }

  get filteredAssets() {
    let assets = this.assetService.assets();
    if (this.activeFilter() !== 'All') {
      assets = assets.filter(a => a.type === this.activeFilter());
    }
    const q = this.searchQuery().toLowerCase();
    if (q) {
      assets = assets.filter(a => a.name.toLowerCase().includes(q));
    }
    return assets;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleUpload(files[0]);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.handleUpload(file);
  }

  handleUpload(file: File) {
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'].includes(file.type)) {
      this.toastService.error('Invalid file type.');
      return;
    }
    
    this.uploading.set(true);
    this.uploadProgress.set(0);
    
    this.uploadService.uploadAsset(file, 'Image').subscribe({
      next: (res: UploadProgress) => {
        if (res.status === 'uploading') {
          this.uploadProgress.set(res.progress);
        } else if (res.status === 'done') {
          this.uploading.set(false);
          this.toastService.success('Asset uploaded');
        } else if (res.status === 'error') {
          this.uploading.set(false);
          this.toastService.error('Upload failed');
        }
      }
    });
  }

  deleteAsset(publicId: string, event: Event) {
    event.stopPropagation();
    this.uploadService.deleteAsset(publicId).subscribe({
      next: () => this.toastService.success('Asset deleted'),
      error: () => this.toastService.error('Failed to delete')
    });
  }

  copyUrl(url: string, event: Event) {
    event.stopPropagation();
    navigator.clipboard.writeText(url);
    this.toastService.success('URL Copied');
  }

  onDragStartAsset(event: DragEvent, asset: CloudinaryAsset) {
    event.dataTransfer?.setData('application/json', JSON.stringify(asset));
    event.dataTransfer?.setData('text/plain', asset.secureUrl);
  }
}
