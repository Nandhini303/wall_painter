import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  constructor() {}

  getOptimizedUrl(url: string, width?: number, height?: number): string {
    if (!url.includes('cloudinary.com')) return url;
    
    let transform = 'c_limit,q_auto,f_auto';
    if (width) transform += `,w_${width}`;
    if (height) transform += `,h_${height}`;
    
    return url.replace('/upload/', `/upload/${transform}/`);
  }

  getThumbnailUrl(url: string, size = 200): string {
    if (!url.includes('cloudinary.com')) return url;
    return url.replace('/upload/', `/upload/c_thumb,w_${size},h_${size},q_auto,f_auto/`);
  }
}
