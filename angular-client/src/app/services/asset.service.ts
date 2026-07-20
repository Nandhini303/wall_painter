import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface CloudinaryAsset {
  _id: string;
  publicId: string;
  secureUrl: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  format?: string;
  sizeBytes?: number;
  type: string;
  name: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  private apiUrl = 'https://wall-painter.onrender.com/api/uploads';
  
  assets = signal<CloudinaryAsset[]>([]);
  isLoading = signal(false);

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  loadAssets(type?: string): void {
    this.isLoading.set(true);
    let url = this.apiUrl;
    if (type) url += `?type=${type}`;
    
    this.http.get<CloudinaryAsset[]>(url, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.assets.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}
