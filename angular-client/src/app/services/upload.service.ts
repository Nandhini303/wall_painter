import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface UploadProgress {
  status: 'pending' | 'uploading' | 'done' | 'error';
  progress: number;
  message?: string;
  asset?: any;
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private apiUrl = 'https://wall-painter.onrender.com/api/uploads';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  uploadAsset(file: File, type: 'Image' | 'Texture' | 'Pattern' = 'Image'): Observable<UploadProgress> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const endpoint = type === 'Texture' ? '/texture' : '/image';
    const req = new HttpRequest('POST', `${this.apiUrl}${endpoint}`, formData, {
      headers: this.getHeaders(),
      reportProgress: true
    });

    return new Observable<UploadProgress>(observer => {
      observer.next({ status: 'pending', progress: 0 });

      this.http.request(req).subscribe({
        next: (event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress) {
            const percentDone = event.total ? Math.round(100 * event.loaded / event.total) : 0;
            observer.next({ status: 'uploading', progress: percentDone });
          } else if (event.type === HttpEventType.Response) {
            observer.next({ status: 'done', progress: 100, asset: event.body });
            observer.complete();
          }
        },
        error: (err) => {
          observer.next({ status: 'error', progress: 0, message: err.message });
          observer.complete();
        }
      });
    });
  }

  deleteAsset(publicId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${publicId}`, { headers: this.getHeaders() });
  }
}
