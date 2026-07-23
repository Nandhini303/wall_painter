import { Component, OnInit, OnDestroy, signal, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import Konva from 'konva';
import { ProjectService, Project } from '../../services/project.service';
import { CatalogService, PaintColor, PaintTexture } from '../../services/catalog.service';
import { SocketService } from '../../services/socket.service';
import { ToastService } from '../../services/toast.service';
import { ColorStudioService } from '../../services/color-studio';
import { ToolPropertiesComponent } from './components/tool-properties/tool-properties';
import { ColorSwatchPanelComponent } from './components/color-swatch-panel/color-swatch-panel';
import { CustomColorPopoverComponent } from './components/custom-color-popover/custom-color-popover';
import { TextureLibraryPanelComponent } from './components/texture-library-panel/texture-library-panel';
import { AssetLibraryPanelComponent } from './components/asset-library-panel/asset-library-panel.component';

import { LucideAngularModule, MousePointer2, Brush, Eraser, Sparkles, LassoSelect, Pentagon, ScanSearch, ZoomIn, ZoomOut, Hand, Undo2, Redo2, Grid2x2, SplitSquareHorizontal, Download, Share2, Save, Rocket, UploadCloud, Search, Layers3, Lock, Unlock, Eye, EyeOff, Copy, Trash2, ArrowUp, ArrowDown, Palette, PaintBucket, Menu } from '@lucide/angular';

@Component({
  selector: 'app-canvas-editor',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, 
    LucideAngularModule.pick({ MousePointer2, Brush, Eraser, Sparkles, LassoSelect, Pentagon, ScanSearch, ZoomIn, ZoomOut, Hand, Undo2, Redo2, Grid2x2, SplitSquareHorizontal, Download, Share2, Save, Rocket, UploadCloud, Search, Layers3, Lock, Unlock, Eye, EyeOff, Copy, Trash2, ArrowUp, ArrowDown, Palette, PaintBucket, Menu }),
    ToolPropertiesComponent, ColorSwatchPanelComponent, CustomColorPopoverComponent, TextureLibraryPanelComponent, AssetLibraryPanelComponent
  ],
  templateUrl: './canvas-editor.component.html',
  styleUrls: ['./canvas-editor.component.scss']
})
export class CanvasEditorComponent implements OnInit, OnDestroy {
  @ViewChild('container', { static: true }) containerRef!: ElementRef;

  project = signal<Project | null>(null);

  // Editor State
  activeTool = signal<'select' | 'ai-wand' | 'wand' | 'polygon' | 'lasso' | 'brush' | 'eraser' | 'eyedropper' | 'hand'>('select');
  showGrid = signal(false);
  showShareModal = signal(false);
  shareUrl = signal('');
  saveStatus = signal<'saved' | 'saving' | 'unsaved'>('saved');

  // Zoom & Pan
  zoomLevel = signal(100);

  // Auto-Save Debounce Timer
  private autoSaveTimer: any = null;

  // Undo / Redo History Stacks
  private historyStack: string[] = [];
  private redoStack: any[] = [];
  canUndo = signal(false);
  canRedo = signal(false);

  // Room Templates Library
  roomTemplates = [
    { id: 'living-room', name: 'Cozy Living Room', imageUri: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80' },
    { id: 'bedroom', name: 'Modern Bedroom', imageUri: 'https://images.unsplash.com/photo-1540518614846-7ede433c517a?auto=format&fit=crop&w=1200&q=80' },
    { id: 'kitchen', name: 'Minimalist Kitchen', imageUri: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80' },
    { id: 'office', name: 'Executive Office', imageUri: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80' },
    { id: 'exterior', name: 'Exterior Facade', imageUri: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80' }
  ];
  selectedTemplateId = signal<string>('living-room');

  // Before / After Compare Mode
  isCompareMode = signal(false);
  splitPosition = signal(50); // 0 to 100%

  // Layers list with Lock & Opacity
  layers = signal<any[]>([
    { id: 'base-layer', name: 'Original Room Image', visible: true, locked: true, opacity: 1, blendMode: 'normal' },
    { id: 'paint-layer-1', name: 'Wall Accent Layer', visible: true, locked: false, opacity: 0.85, blendMode: 'multiply' }
  ]);
  selectedLayerId = signal<string>('paint-layer-1');

  // Konva Variables
  private stage!: Konva.Stage;
  private baseLayer!: Konva.Layer;
  private paintLayer!: Konva.Layer;
  private gridLayer!: Konva.Layer;
  private polygonAnchorsLayer!: Konva.Layer;
  private baseImage!: Konva.Image;
  private isDrawing = false;
  private currentLine!: Konva.Line;

  // Lasso & Polygon Drawing State
  private currentPolygon: Konva.Line | null = null;
  private polygonPoints: number[] = [];
  private isLassoDrawing = false;
  private lassoPoints: number[] = [];
  private currentLassoLine: Konva.Line | null = null;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private catalogService: CatalogService,
    private socketService: SocketService,
    public toastService: ToastService,
    public studio: ColorStudioService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProjectData(id);
      this.loadCatalogs();
    }
  }

  ngOnDestroy(): void {
    if (this.autoSaveTimer) clearInterval(this.autoSaveTimer);
    if (this.project()) {
      this.socketService.leaveProjectRoom(this.project()!._id);
    }
    this.socketService.disconnectSocket();
  }

  loadProjectData(id: string): void {
    this.projectService.getProject(id).subscribe({
      next: (proj) => {
        this.project.set(proj);
        this.shareUrl.set(window.location.href);

        if (proj.layers && proj.layers.length > 0) {
          this.layers.set(proj.layers);
        }

        // Connect Socket.IO
        this.socketService.joinProjectRoom(proj._id);

        // Init Stage Canvas
        setTimeout(() => this.initCanvas(proj.originalImageUri), 150);
      },
      error: () => {
        this.toastService.error('Failed to load project details.');
      }
    });
  }

  isLoadingImage = signal(true);
  imageError = signal(false);

  loadCatalogs(): void {
    // Left empty since we moved to local ColorStudioService
  }

  initCanvas(imageUri: string): void {
    const container = this.containerRef.nativeElement;
    const width = container.offsetWidth || 1000;
    const height = container.offsetHeight || 650;

    this.stage = new Konva.Stage({
      container: container,
      width: width,
      height: height
    });

    this.baseLayer = new Konva.Layer();
    this.paintLayer = new Konva.Layer();
    this.gridLayer = new Konva.Layer();
    this.polygonAnchorsLayer = new Konva.Layer();

    this.stage.add(this.baseLayer);
    this.stage.add(this.paintLayer);
    this.stage.add(this.gridLayer);
    this.stage.add(this.polygonAnchorsLayer);

    const fallbackUrl = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80';
    const targetUri = imageUri || fallbackUrl;

    this.isLoadingImage.set(true);
    this.imageError.set(false);

    const loadRoomImage = (url: string, tryCrossOrigin: boolean = true, isFallbackAttempt: boolean = false) => {
      const imgObj = new Image();
      if (tryCrossOrigin && !url.startsWith('data:')) {
        imgObj.crossOrigin = 'Anonymous';
      }

      imgObj.onload = () => {
        const imgWidth = imgObj.width || width;
        const imgHeight = imgObj.height || height;
        
        let drawW = width;
        let drawH = height;
        const containerAspect = width / height;
        const imgAspect = imgWidth / imgHeight;

        if (imgAspect > containerAspect) {
          drawW = width;
          drawH = width / imgAspect;
        } else {
          drawH = height;
          drawW = height * imgAspect;
        }

        const offsetX = (width - drawW) / 2;
        const offsetY = (height - drawH) / 2;

        if (this.baseImage) {
          this.baseImage.destroy();
        }

        this.baseImage = new Konva.Image({
          image: imgObj,
          x: offsetX,
          y: offsetY,
          width: drawW,
          height: drawH
        });

        this.baseLayer.add(this.baseImage);
        this.baseLayer.batchDraw();
        this.stage.batchDraw();
        this.isLoadingImage.set(false);
        this.saveHistory();
      };

      imgObj.onerror = () => {
        if (tryCrossOrigin) {
          // Retry without crossOrigin
          loadRoomImage(url, false, isFallbackAttempt);
        } else if (!isFallbackAttempt && url !== fallbackUrl) {
          // Try fallback room image
          loadRoomImage(fallbackUrl, true, true);
        } else {
          this.isLoadingImage.set(false);
          this.imageError.set(true);
          this.toastService.error('Could not render room image.');
        }
      };

      imgObj.src = url;
    };

    loadRoomImage(targetUri, true, false);

    this.setupDrawingEvents();
    this.setupAutoSaveLoop();
  }

  transformer!: Konva.Transformer;

  setupDrawingEvents(): void {
    this.transformer = new Konva.Transformer();
    this.paintLayer.add(this.transformer);

    this.stage.on('mousedown touchstart', (e) => {
      if (e.target === this.stage || e.target === this.baseImage) {
        this.clearSelectedObject();
      }

      if (this.activeTool() === 'select' || this.activeTool() === 'hand') return;

      const pos = this.stage.getPointerPosition();
      if (!pos) return;
      const colorHex = this.studio.activeColor().hex;

      // 1. Eyedropper Color Sampler Tool
      if (this.activeTool() === 'eyedropper') {
        this.performEyedropper(pos);
        return;
      }

      // 2. AI Auto-Select & Magic Wand Flood Fill Tools
      if (this.activeTool() === 'wand' || this.activeTool() === 'ai-wand') {
        this.performMagicWand(pos, this.activeTool() === 'ai-wand');
        return;
      }

      // 3. Freehand Lasso Mask Tool
      if (this.activeTool() === 'lasso') {
        this.isLassoDrawing = true;
        this.lassoPoints = [pos.x, pos.y];
        this.currentLassoLine = new Konva.Line({
          points: this.lassoPoints,
          stroke: colorHex,
          strokeWidth: 2,
          dash: [4, 4],
          closed: false
        });
        this.paintLayer.add(this.currentLassoLine);
        this.paintLayer.batchDraw();
        return;
      }

      // 4. Polygon Anchor Mask Tool
      if (this.activeTool() === 'polygon') {
        if (!this.currentPolygon) {
          this.polygonPoints = [pos.x, pos.y];
          this.currentPolygon = new Konva.Line({
            points: this.polygonPoints,
            fill: colorHex,
            stroke: colorHex,
            strokeWidth: 2,
            closed: false,
            opacity: this.studio.brushOpacity(),
            globalCompositeOperation: this.studio.activeBlendMode() as any,
            draggable: true,
            name: 'polygon-shape'
          });

          this.currentPolygon.on('click tap', (evt) => {
            if (this.activeTool() !== 'select') return;
            evt.cancelBubble = true;
            this.selectObject(evt.target);
          });

          this.paintLayer.add(this.currentPolygon);
        } else {
          this.polygonPoints.push(pos.x, pos.y);
          this.currentPolygon.points(this.polygonPoints);
        }
        this.paintLayer.batchDraw();
        return;
      }

      // 5. Brush & Eraser Tools
      this.isDrawing = true;
      const isEraser = this.activeTool() === 'eraser';

      this.currentLine = new Konva.Line({
        stroke: colorHex,
        strokeWidth: this.studio.brushSize(),
        globalCompositeOperation: isEraser ? 'destination-out' : (this.studio.activeBlendMode() as any),
        opacity: this.studio.brushOpacity(),
        points: [pos.x, pos.y, pos.x, pos.y],
        lineCap: 'round',
        lineJoin: 'round'
      });

      this.paintLayer.add(this.currentLine);
    });

    this.stage.on('dblclick dbltap', (e) => {
      if (this.activeTool() === 'polygon' && this.currentPolygon) {
        this.currentPolygon.closed(true);
        this.currentPolygon = null;
        this.polygonPoints = [];
        this.paintLayer.batchDraw();
        this.saveHistory();
        this.triggerUnsavedState();
      }
    });

    this.stage.on('mousemove touchmove', () => {
      const pos = this.stage.getPointerPosition();
      if (!pos) return;

      if (this.isLassoDrawing && this.currentLassoLine) {
        this.lassoPoints.push(pos.x, pos.y);
        this.currentLassoLine.points(this.lassoPoints);
        this.paintLayer.batchDraw();
      } else if (this.isDrawing && this.currentLine && this.activeTool() !== 'polygon') {
        const newPoints = this.currentLine.points().concat([pos.x, pos.y]);
        this.currentLine.points(newPoints);
        this.paintLayer.batchDraw();
        this.triggerUnsavedState();
      }
    });

    this.stage.on('mouseup touchend', () => {
      if (this.isLassoDrawing && this.currentLassoLine) {
        this.isLassoDrawing = false;
        this.currentLassoLine.destroy();
        this.currentLassoLine = null;

        const colorHex = this.studio.activeColor().hex;
        const activeTex = this.studio.activeTexture();

        const lassoMask = new Konva.Line({
          points: this.lassoPoints,
          fill: colorHex,
          stroke: colorHex,
          strokeWidth: 1,
          closed: true,
          opacity: this.studio.brushOpacity(),
          globalCompositeOperation: this.studio.activeBlendMode() as any,
          draggable: true,
          name: 'lasso-shape'
        });

        if (activeTex) {
          const texImg = new Image();
          texImg.crossOrigin = 'Anonymous';
          texImg.src = activeTex.imageUri;
          texImg.onload = () => {
            lassoMask.fillPriority('pattern');
            lassoMask.fillPatternImage(texImg);
            this.paintLayer.batchDraw();
          };
        }

        lassoMask.on('click tap', (evt) => {
          if (this.activeTool() !== 'select') return;
          evt.cancelBubble = true;
          this.selectObject(lassoMask);
        });

        this.paintLayer.add(lassoMask);
        this.paintLayer.batchDraw();
        this.saveHistory();
        this.triggerUnsavedState();
        this.lassoPoints = [];
      } else if (this.isDrawing && this.activeTool() !== 'polygon') {
        this.isDrawing = false;
        this.saveHistory();
        this.triggerUnsavedState();
      }
    });
  }

  // Apply current active texture & color to active selection or all shapes on canvas
  applyCurrentTextureAndColorToSelection(): void {
    if (!this.paintLayer) return;
    const activeTex = this.studio.activeTexture();
    const activeColor = this.studio.activeColor().hex;

    let targetNodes = this.transformer ? this.transformer.nodes() : [];
    if (targetNodes.length === 0) {
      targetNodes = this.paintLayer.getChildren().filter((n: any) => n !== this.transformer);
    }

    if (targetNodes.length === 0) {
      this.toastService.info('Select or draw a wall mask area to apply textures.');
      return;
    }

    if (activeTex) {
      const texImgObj = new Image();
      texImgObj.crossOrigin = 'Anonymous';
      texImgObj.src = activeTex.imageUri;
      texImgObj.onload = () => {
        targetNodes.forEach((node: any) => {
          if (node instanceof Konva.Line || node instanceof Konva.Shape) {
            node.fillPriority('pattern');
            node.fillPatternImage(texImgObj);
            node.fillPatternRepeat('repeat');
            
            // Apply scale & rotation from studio state
            node.fillPatternScaleX(this.studio.textureScale());
            node.fillPatternScaleY(this.studio.textureScale());
            node.fillPatternRotation(this.studio.textureRotation());
            node.opacity(this.studio.textureOpacity());

            node.stroke(activeColor);
            node.globalCompositeOperation(this.studio.activeBlendMode() as any);
          } else if (node instanceof Konva.Image) {
            node.globalCompositeOperation(this.studio.activeBlendMode() as any);
          }
        });
        this.paintLayer.batchDraw();
        this.saveHistory();
        this.triggerUnsavedState();
        this.toastService.success(`Applied ${activeTex.name} texture to selected wall!`);
      };
      texImgObj.onerror = () => {
        this.toastService.error(`Failed to load ${activeTex.name} texture. Please try again.`);
      };
    } else {
      targetNodes.forEach((node: any) => {
        if (node instanceof Konva.Line || node instanceof Konva.Shape) {
          node.fillPriority('color');
          node.fill(activeColor);
          node.stroke(activeColor);
        }
      });
      this.paintLayer.batchDraw();
      this.saveHistory();
      this.triggerUnsavedState();
      this.toastService.success(`Applied ${activeColor} color to wall selection!`);
    }
  }

  // Real-Time 3-Second Auto-Save Loop
  setupAutoSaveLoop(): void {
    this.autoSaveTimer = setInterval(() => {
      if (this.saveStatus() === 'unsaved' && this.project()) {
        this.performAutoSave();
      }
    }, 3000);
  }

  triggerUnsavedState(): void {
    if (this.saveStatus() !== 'unsaved') {
      this.saveStatus.set('unsaved');
    }
  }

  performAutoSave(): void {
    if (!this.project()) return;
    this.saveStatus.set('saving');

    const updatePayload = {
      layers: this.layers()
    };

    this.projectService.updateProject(this.project()!._id, updatePayload).subscribe({
      next: () => {
        this.saveStatus.set('saved');
      },
      error: () => {
        this.saveStatus.set('unsaved');
      }
    });
  }

  saveDraft(): void {
    this.performAutoSave();
    this.toastService.success('Project draft saved successfully!');
  }

  publishProject(): void {
    if (!this.project()) {
      console.error('No project loaded to publish');
      return;
    }
    console.log('Publishing project:', this.project()!._id);
    this.performAutoSave();

    this.projectService.publishProject(this.project()!._id).subscribe({
      next: (updated) => {
        console.log('Publish success:', updated);
        this.project.set(updated);
        this.toastService.success('Project published to gallery successfully!');
      },
      error: (err) => {
        console.error('Publish error:', err);
        this.toastService.error('Failed to publish project.');
      }
    });
  }

  // Zoom & Grid Handlers
  setZoom(delta: number): void {
    const next = Math.min(Math.max(this.zoomLevel() + delta, 50), 200);
    this.zoomLevel.set(next);
    if (this.stage) {
      const scale = next / 100;
      this.stage.scale({ x: scale, y: scale });
      this.stage.batchDraw();
    }
  }

  toggleGrid(): void {
    this.showGrid.set(!this.showGrid());
    if (this.showGrid()) {
      this.drawGrid();
    } else {
      this.gridLayer.destroyChildren();
      this.gridLayer.batchDraw();
    }
  }

  drawGrid(): void {
    this.gridLayer.destroyChildren();
    const width = this.stage.width();
    const height = this.stage.height();
    const step = 30;

    for (let i = 0; i < width / step; i++) {
      this.gridLayer.add(new Konva.Line({
        points: [i * step, 0, i * step, height],
        stroke: '#e2e8f0',
        strokeWidth: 1
      }));
    }
    for (let j = 0; j < height / step; j++) {
      this.gridLayer.add(new Konva.Line({
        points: [0, j * step, width, j * step],
        stroke: '#e2e8f0',
        strokeWidth: 1
      }));
    }
    this.gridLayer.batchDraw();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent): void {
    const isCtrl = event.ctrlKey || event.metaKey;

    if (isCtrl && event.key.toLowerCase() === 'z' && !event.shiftKey) {
      event.preventDefault();
      if (this.canUndo()) this.undo();
    } else if (isCtrl && (event.key.toLowerCase() === 'y' || (event.key.toLowerCase() === 'z' && event.shiftKey))) {
      event.preventDefault();
      if (this.canRedo()) this.redo();
    } else if (isCtrl && event.key.toLowerCase() === 's') {
      event.preventDefault();
      this.saveDraft();
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      if ((event.target as HTMLElement).tagName !== 'INPUT') {
        this.deleteSelectedObject();
      }
    }
  }

  selectObject(node: Konva.Node) {
    if (!this.transformer) return;
    this.transformer.nodes([node]);
    this.transformer.getLayer()?.batchDraw();

    if (node.name() === 'polygon-shape') {
      this.renderPolygonAnchors(node as Konva.Line);
    } else {
      this.clearPolygonAnchors();
    }
  }

  clearSelectedObject() {
    if (!this.transformer) return;
    this.transformer.nodes([]);
    this.transformer.getLayer()?.batchDraw();
    this.clearPolygonAnchors();
  }

  renderPolygonAnchors(polygon: Konva.Line) {
    this.clearPolygonAnchors();
    const points = polygon.points();

    for (let i = 0; i < points.length; i += 2) {
      const anchor = new Konva.Circle({
        x: points[i],
        y: points[i + 1],
        radius: 6,
        fill: '#3b82f6',
        stroke: '#ffffff',
        strokeWidth: 2,
        draggable: true,
        name: `anchor-${i / 2}`
      });

      anchor.on('dragmove', (e) => {
        const newPoints = polygon.points().slice();
        newPoints[i] = anchor.x();
        newPoints[i + 1] = anchor.y();
        polygon.points(newPoints);
        this.paintLayer.batchDraw();
      });

      anchor.on('dragend', () => {
        this.saveHistory();
        this.triggerUnsavedState();
      });

      anchor.on('dblclick dbltap', () => {
        const newPoints = polygon.points().slice();
        newPoints.splice(i, 2);
        polygon.points(newPoints);
        this.paintLayer.batchDraw();
        this.renderPolygonAnchors(polygon);
        this.saveHistory();
        this.triggerUnsavedState();
      });

      this.polygonAnchorsLayer.add(anchor);
    }

    // Add logic to insert new vertices on polygon click
    polygon.off('dblclick dbltap').on('dblclick dbltap', (e) => {
      const pos = this.stage.getPointerPosition();
      if (!pos) return;
      const pts = polygon.points();
      pts.push(pos.x, pos.y);
      polygon.points(pts);
      this.paintLayer.batchDraw();
      this.renderPolygonAnchors(polygon);
      this.saveHistory();
      this.triggerUnsavedState();
    });

    this.polygonAnchorsLayer.batchDraw();
  }

  clearPolygonAnchors() {
    if (this.polygonAnchorsLayer) {
      this.polygonAnchorsLayer.destroyChildren();
      this.polygonAnchorsLayer.batchDraw();
    }
  }

  deleteSelectedObject() {
    if (!this.transformer) return;
    const nodes = this.transformer.nodes();
    if (nodes.length > 0) {
      nodes.forEach(n => n.destroy());
      this.transformer.nodes([]);
      this.paintLayer.draw();
      this.saveHistory();
      this.triggerUnsavedState();
    }
  }

  saveHistory(): void {
    if (!this.paintLayer) return;
    const children = this.paintLayer.getChildren();
    this.historyStack.push(JSON.stringify(children.map((c: any) => c.toObject())));
    this.redoStack = [];
    this.canUndo.set(children.length > 0);
    this.canRedo.set(false);
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.stage.setPointersPositions(event);

    const assetJson = event.dataTransfer?.getData('application/json');
    if (!assetJson) return;

    try {
      const asset = JSON.parse(assetJson);
      const pos = this.stage.getPointerPosition();

      const imgObj = new Image();
      imgObj.crossOrigin = 'Anonymous';
      imgObj.src = asset.secureUrl;
      imgObj.onload = () => {
        const konvaImg = new Konva.Image({
          image: imgObj,
          x: (pos?.x || 0) - (imgObj.width / 4),
          y: (pos?.y || 0) - (imgObj.height / 4),
          width: imgObj.width / 2,
          height: imgObj.height / 2,
          draggable: true,
          name: 'asset-image'
        });

        konvaImg.on('dragend transformend', () => {
          this.triggerUnsavedState();
        });

        konvaImg.on('click tap', (e) => {
          if (this.activeTool() !== 'select') return;
          e.cancelBubble = true;
          this.selectObject(konvaImg);
        });

        this.paintLayer.add(konvaImg);
        this.paintLayer.draw();
        this.saveHistory();
        this.triggerUnsavedState();
      };
    } catch (e) { }
  }

  // Object-Level Undo / Redo History Engine (Preserves Base Image Layer)

  undo(): void {
    if (this.paintLayer && this.paintLayer.getChildren().length > 0) {
      const children = this.paintLayer.getChildren();
      const lastStroke = children[children.length - 1];
      if (lastStroke) {
        this.redoStack.push(lastStroke);
        lastStroke.remove();
        this.paintLayer.batchDraw();
        this.canUndo.set(this.paintLayer.getChildren().length > 0);
        this.canRedo.set(true);
        this.triggerUnsavedState();
        this.toastService.info('Undo applied (stroke removed)');
      }
    }
  }

  redo(): void {
    if (this.redoStack.length > 0 && this.paintLayer) {
      const restoredNode = this.redoStack.pop()!;
      this.paintLayer.add(restoredNode);
      this.paintLayer.batchDraw();
      this.canUndo.set(true);
      this.canRedo.set(this.redoStack.length > 0);
      this.triggerUnsavedState();
      this.toastService.info('Redo applied');
    }
  }



  setTool(tool: 'select' | 'ai-wand' | 'wand' | 'polygon' | 'lasso' | 'brush' | 'eraser' | 'eyedropper' | 'hand'): void {
    this.activeTool.set(tool);
    if (this.stage) {
      this.stage.draggable(tool === 'hand');
    }
  }

  // Eyedropper Color Sampler
  performEyedropper(pos: { x: number, y: number }): void {
    if (!this.baseImage) return;
    const canvas = document.createElement('canvas');
    canvas.width = this.stage.width();
    canvas.height = this.stage.height();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = this.baseImage.image();
    if (img) {
      ctx.drawImage(img, this.baseImage.x(), this.baseImage.y(), this.baseImage.width(), this.baseImage.height());
      const pixel = ctx.getImageData(Math.round(pos.x), Math.round(pos.y), 1, 1).data;
      const hex = '#' + ((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1);
      this.studio.setActiveColor({ hex, name: 'Sampled Color' });
      this.toastService.success(`Sampled color: ${hex}`);
      this.activeTool.set('brush');
    }
  }

  // AI Auto-Select & Magic Wand Flood Fill Algorithm
  performMagicWand(pos: { x: number, y: number }, isAiAutoSelect: boolean = false): void {
    if (!this.baseImage) return;

    this.toastService.info(isAiAutoSelect ? 'AI Auto-Detecting wall contours...' : 'Calculating Magic Wand flood fill...');

    const width = Math.round(this.stage.width());
    const height = Math.round(this.stage.height());

    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return;

    const nativeImg = this.baseImage.image();
    if (!nativeImg) return;

    ctx.drawImage(nativeImg, this.baseImage.x(), this.baseImage.y(), this.baseImage.width(), this.baseImage.height());
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const startX = Math.round(pos.x);
    const startY = Math.round(pos.y);
    const startIndex = (startY * width + startX) * 4;

    const r0 = data[startIndex];
    const g0 = data[startIndex + 1];
    const b0 = data[startIndex + 2];

    const tolerance = isAiAutoSelect ? this.studio.floodTolerance() + 15 : this.studio.floodTolerance();
    const visited = new Uint8Array(width * height);
    const maskData = ctx.createImageData(width, height);
    const maskPixels = maskData.data;

    const queue: number[] = [startX, startY];
    visited[startY * width + startX] = 1;

    const hexColor = this.studio.activeColor().hex;
    const colorRGB = this.hexToRgb(hexColor);

    let filledCount = 0;

    while (queue.length > 0) {
      const cy = queue.pop()!;
      const cx = queue.pop()!;
      const idx = (cy * width + cx) * 4;

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const dist = Math.abs(r - r0) + Math.abs(g - g0) + Math.abs(b - b0);

      if (dist <= tolerance * 3) {
        maskPixels[idx] = colorRGB.r;
        maskPixels[idx + 1] = colorRGB.g;
        maskPixels[idx + 2] = colorRGB.b;
        maskPixels[idx + 3] = Math.round(this.studio.brushOpacity() * 255);
        filledCount++;

        const neighbors = [
          [cx + 1, cy], [cx - 1, cy],
          [cx, cy + 1], [cx, cy - 1]
        ];

        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nIdx = ny * width + nx;
            if (!visited[nIdx]) {
              visited[nIdx] = 1;
              queue.push(nx, ny);
            }
          }
        }
      }
    }

    if (filledCount < 10) {
      this.toastService.info('Selection too small. Try clicking a different wall area or increasing tolerance.');
      return;
    }

    const finishMaskRendering = () => {
      const maskUrl = offscreen.toDataURL();
      const maskImgObj = new Image();
      maskImgObj.onload = () => {
        const konvaMaskImg = new Konva.Image({
          image: maskImgObj,
          x: 0,
          y: 0,
          width: width,
          height: height,
          globalCompositeOperation: this.studio.activeBlendMode() as any,
          opacity: 1,
          draggable: true,
          name: 'ai-mask-shape'
        });

        konvaMaskImg.on('click tap', (evt) => {
          if (this.activeTool() !== 'select') return;
          evt.cancelBubble = true;
          this.selectObject(konvaMaskImg);
        });

        this.paintLayer.add(konvaMaskImg);
        this.paintLayer.batchDraw();
        this.saveHistory();
        this.triggerUnsavedState();
        this.toastService.success(
          isAiAutoSelect 
            ? (activeTex ? `AI Wall Mask applied with ${activeTex.name} texture!` : 'AI Wall Mask generated!') 
            : (activeTex ? `Magic Wand mask applied with ${activeTex.name} texture!` : 'Magic Wand mask created!')
        );
      };
      maskImgObj.src = maskUrl;
    };

    const activeTex = this.studio.activeTexture();
    if (activeTex) {
      const texImg = new Image();
      texImg.crossOrigin = 'Anonymous';
      texImg.src = activeTex.imageUri;
      texImg.onload = () => {
        const patternCanvas = document.createElement('canvas');
        patternCanvas.width = width;
        patternCanvas.height = height;
        const pCtx = patternCanvas.getContext('2d');
        if (pCtx) {
          const pattern = pCtx.createPattern(texImg, 'repeat');
          if (pattern) {
            pCtx.fillStyle = pattern;
            pCtx.fillRect(0, 0, width, height);
            const texData = pCtx.getImageData(0, 0, width, height).data;
            for (let i = 0; i < maskPixels.length; i += 4) {
              if (maskPixels[i + 3] > 0) {
                // Tint texture with active color
                maskPixels[i] = Math.round((maskPixels[i] + texData[i]) / 2);
                maskPixels[i + 1] = Math.round((maskPixels[i + 1] + texData[i + 1]) / 2);
                maskPixels[i + 2] = Math.round((maskPixels[i + 2] + texData[i + 2]) / 2);
              }
            }
          }
        }
        ctx.putImageData(maskData, 0, 0);
        finishMaskRendering();
      };
      texImg.onerror = () => {
        ctx.putImageData(maskData, 0, 0);
        finishMaskRendering();
      };
    } else {
      ctx.putImageData(maskData, 0, 0);
      finishMaskRendering();
    }
  }

  private hexToRgb(hex: string): { r: number, g: number, b: number } {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 51, g: 154, b: 240 };
  }

  // Working Export Options
  exportMaskPNG(): void {
    if (!this.paintLayer || !this.stage) return;
    this.baseLayer.visible(false);
    const dataUrl = this.stage.toDataURL({ pixelRatio: 2 });
    this.baseLayer.visible(true);
    this.stage.batchDraw();
    this.downloadFile(dataUrl, `${this.project()?.name || 'wall-mask'}-mask.png`);
    this.toastService.success('Exported PNG wall mask successfully!');
  }

  exportPNG(): void {
    if (!this.stage) return;
    const dataUrl = this.stage.toDataURL({ pixelRatio: 2 });
    this.downloadFile(dataUrl, `${this.project()?.name || 'paint-design'}.png`);
    this.toastService.success('Exported PNG image successfully!');
  }

  exportJPG(): void {
    if (!this.stage) return;
    const dataUrl = this.stage.toDataURL({ mimeType: 'image/jpeg', quality: 0.95 });
    this.downloadFile(dataUrl, `${this.project()?.name || 'paint-design'}.jpg`);
    this.toastService.success('Exported JPG image successfully!');
  }

  exportJSON(): void {
    if (!this.stage) return;
    const jsonStr = this.stage.toJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    this.downloadFile(url, `${this.project()?.name || 'paint-design'}.json`);
    this.toastService.success('Exported JSON project state!');
  }

  private downloadFile(url: string, filename: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  }

  // Share Modal & Copy Link
  openShareModal(): void {
    this.showShareModal.set(true);
  }

  closeShareModal(): void {
    this.showShareModal.set(false);
  }

  copyShareLink(): void {
    navigator.clipboard.writeText(this.shareUrl());
    this.toastService.success('Project link copied to clipboard!');
    this.closeShareModal();
  }

  // selectColor removed

  // selectTexture removed

  // Layers CRUD
  addLayer(): void {
    const newId = `paint-layer-${Date.now()}`;
    const newLayer = {
      id: newId,
      name: `Wall Layer ${this.layers().length}`,
      visible: true,
      locked: false,
      opacity: 0.85
    };
    this.layers.update(list => [...list, newLayer]);
    this.selectedLayerId.set(newId);
    this.triggerUnsavedState();
    this.toastService.success('New layer added');
  }

  deleteLayer(id: string, event: Event): void {
    event.stopPropagation();
    if (id === 'base-layer') return;
    this.layers.update(list => list.filter(l => l.id !== id));
    this.triggerUnsavedState();
    this.toastService.info('Layer deleted');
  }

  toggleLock(layer: any, event: Event): void {
    event.stopPropagation();
    layer.locked = !layer.locked;
    this.triggerUnsavedState();
  }

  toggleVisibility(layer: any, event: Event): void {
    event.stopPropagation();
    layer.visible = !layer.visible;
    this.triggerUnsavedState();
  }

  duplicateLayer(layer: any, event: Event): void {
    event.stopPropagation();
    const dupId = `paint-layer-${Date.now()}`;
    const dupLayer = { ...layer, id: dupId, name: `${layer.name} (Copy)` };
    this.layers.update(list => [...list, dupLayer]);
    this.selectedLayerId.set(dupId);
    this.triggerUnsavedState();
    this.toastService.success('Layer duplicated');
  }

  moveLayerUp(index: number, event: Event): void {
    event.stopPropagation();
    if (index <= 1) return;
    const list = [...this.layers()];
    const temp = list[index];
    list[index] = list[index - 1];
    list[index - 1] = temp;
    this.layers.set(list);
    this.triggerUnsavedState();
  }

  moveLayerDown(index: number, event: Event): void {
    event.stopPropagation();
    if (index >= this.layers().length - 1 || index === 0) return;
    const list = [...this.layers()];
    const temp = list[index];
    list[index] = list[index + 1];
    list[index + 1] = temp;
    this.layers.set(list);
    this.triggerUnsavedState();
  }

  // Room Template Switcher
  switchTemplate(templateId: string): void {
    this.selectedTemplateId.set(templateId);
    const tmpl = this.roomTemplates.find(t => t.id === templateId);
    if (tmpl && this.baseImage) {
      const imgObj = new Image();
      imgObj.crossOrigin = 'Anonymous';
      imgObj.src = tmpl.imageUri;
      imgObj.onload = () => {
        this.baseImage.image(imgObj);
        this.baseLayer.draw();
        this.saveHistory();
        this.toastService.success(`Switched to ${tmpl.name} template`);
      };
    }
  }

  toggleCompareMode(): void {
    this.isCompareMode.set(!this.isCompareMode());
  }
}
