import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService, User } from './auth.service';

export interface AuditLog {
  _id: string;
  userId?: User;
  action: string;
  ipAddress: string;
  details: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'https://wall-painter.onrender.com/api/admin';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  listUsers(limit = 50, skip = 0): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users?limit=${limit}&skip=${skip}`, { headers: this.getHeaders() });
  }

  inviteUser(email: string, role: string, workspace: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users/invite`, { email, role, workspace }, { headers: this.getHeaders() });
  }

  updateUserRole(userId: string, role: 'Admin' | 'Designer' | 'User'): Observable<User> {
    return this.http.put<User>(
      `${this.apiUrl}/users/${userId}/role`,
      { role },
      { headers: this.getHeaders() }
    );
  }

  getStorageAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/storage`, { headers: this.getHeaders() });
  }

  listAuditLogs(limit = 100, skip = 0): Observable<{ logs: AuditLog[]; total: number }> {
    return this.http.get<{ logs: AuditLog[]; total: number }>(
      `${this.apiUrl}/audit-logs?limit=${limit}&skip=${skip}`,
      { headers: this.getHeaders() }
    );
  }

  getAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/analytics`, { headers: this.getHeaders() });
  }
}
