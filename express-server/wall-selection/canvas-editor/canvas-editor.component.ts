import { Component, ElementRef, ViewChild, Input, AfterViewInit } from '@angular/core';

interface Point { x: number; y: number; }

@Component({
  selector: 'app-canvas-editor',
  templateUrl: './canvas-editor.component.html',
})
export class CanvasEditorComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() imageUrl: string = '';

  private ctx!: CanvasRenderingContext2D;
  private image = new Image();
  polygon: Point[] = [];
  isDrawing = false;

  ngAfterViewInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    if (this.imageUrl) {
      this.image.src = this.imageUrl;
      this.image.onload = () => this.drawBase();
    }
  }

  drawBase() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.image.width;
    canvas.height = this.image.height;
    this.ctx.drawImage(this.image, 0, 0);
  }

  onCanvasClick(event: MouseEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const point: Point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    this.polygon.push(point);
    this.redraw();
  }

  redraw() {
    this.drawBase();
    if (this.polygon.length < 2) return;
    this.ctx.beginPath();
    this.ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
    this.polygon.slice(1).forEach(p => this.ctx.lineTo(p.x, p.y));
    this.ctx.closePath();
    this.ctx.strokeStyle = '#00A3FF';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  applyColor(hex: string, opacity: number) {
    if (this.polygon.length < 3) return;
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
    this.polygon.slice(1).forEach(p => this.ctx.lineTo(p.x, p.y));
    this.ctx.closePath();
    this.ctx.clip();
    this.ctx.globalAlpha = opacity;
    this.ctx.fillStyle = hex;
    this.ctx.fillRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
    this.ctx.restore();
  }

  exportImage(): string {
    return this.canvasRef.nativeElement.toDataURL('image/png');
  }

  resetPolygon() {
    this.polygon = [];
    this.drawBase();
  }
}
