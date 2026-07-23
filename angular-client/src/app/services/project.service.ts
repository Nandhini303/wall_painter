import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Project {
  _id: string;
  name: string;
  originalImageUri: string;
  processedMasksUri?: string;
  layers: any[];
  canvasConfig: any;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private get apiUrl(): string {
    return (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:5000/api/projects'
      : 'https://wall-painter.onrender.com/api/projects';
  }

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  listProjects(limit = 50, skip = 0): Observable<{ projects: Project[]; total: number }> {
    return this.http.get<{ projects: Project[]; total: number }>(
      `${this.apiUrl}?limit=${limit}&skip=${skip}`,
      { headers: this.getHeaders() }
    );
  }

  getProject(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createProject(name: string, imageFile?: File): Observable<Project> {
    const formData = new FormData();
    formData.append('name', name);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<Project>(this.apiUrl, formData, { headers });
  }

  updateProject(id: string, updateData: Partial<Project>): Observable<Project> {
    return this.http.put<Project>(
      `${this.apiUrl}/${id}`,
      updateData,
      { headers: this.getHeaders() }
    );
  }

  publishProject(id: string): Observable<Project> {
    return this.http.put<Project>(
      `${this.apiUrl}/${id}/publish`,
      {},
      { headers: this.getHeaders() }
    );
  }

  deleteProject(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  deleteAllProjects(): Observable<any> {
    return this.http.delete(this.apiUrl, { headers: this.getHeaders() });
  }
}
