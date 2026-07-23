import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

import { importProvidersFrom } from '@angular/core';
import { LucideAngularModule, MousePointer2, Brush, Eraser, Sparkles, LassoSelect, Pentagon, ScanSearch, ZoomIn, ZoomOut, Hand, Undo2, Redo2, Grid2x2, SplitSquareHorizontal, Download, Share2, Save, Rocket, UploadCloud, Search, Layers3, Lock, Unlock, Eye, EyeOff, Copy, Trash2, ArrowUp, ArrowDown, Palette, PaintBucket, Menu, Image, ChevronDown, ChevronUp, Star, Pipette, Check } from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(LucideAngularModule.pick({ MousePointer2, Brush, Eraser, Sparkles, LassoSelect, Pentagon, ScanSearch, ZoomIn, ZoomOut, Hand, Undo2, Redo2, Grid2x2, SplitSquareHorizontal, Download, Share2, Save, Rocket, UploadCloud, Search, Layers3, Lock, Unlock, Eye, EyeOff, Copy, Trash2, ArrowUp, ArrowDown, Palette, PaintBucket, Menu, Image, ChevronDown, ChevronUp, Star, Pipette, Check }))
  ]
};
