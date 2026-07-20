import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface PaintColor {
  _id: string;
  brandName: string;
  colorCode: string;
  name: string;
  hexCode: string;
  hex?: string;
  r: number;
  g: number;
  b: number;
  isActive: boolean;
}

export interface PaintTexture {
  _id: string;
  name: string;
  imageUri: string;
  roughnessMapUri?: string;
  scaleDefault: number;
}

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private apiUrl = 'http://localhost:5000/api/catalog';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getColors(brand?: string, limit = 100, skip = 0): Observable<PaintColor[]> {
    let url = `${this.apiUrl}/colors?limit=${limit}&skip=${skip}`;
    if (brand) {
      url += `&brand=${encodeURIComponent(brand)}`;
    }
    return this.http.get<PaintColor[]>(url, { headers: this.getHeaders() });
  }

  listColors(brand?: string, limit = 100, skip = 0): Observable<PaintColor[]> {
    return this.getColors(brand, limit, skip);
  }

  getBrands(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/brands`, { headers: this.getHeaders() });
  }

  getTextures(limit = 50, skip = 0): Observable<PaintTexture[]> {
    return this.http.get<PaintTexture[]>(`${this.apiUrl}/textures?limit=${limit}&skip=${skip}`, { headers: this.getHeaders() });
  }

  listTextures(limit = 50, skip = 0): Observable<PaintTexture[]> {
    return this.getTextures(limit, skip);
  }

  // Admin Catalog operations
  addColor(colorData: Partial<PaintColor>): Observable<PaintColor> {
    return this.http.post<PaintColor>(`${this.apiUrl}/colors`, colorData, { headers: this.getHeaders() });
  }

  addTexture(textureData: Partial<PaintTexture>): Observable<PaintTexture> {
    return this.http.post<PaintTexture>(`${this.apiUrl}/textures`, textureData, { headers: this.getHeaders() });
  }
}
