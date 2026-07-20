import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface User {
  id?: string;
  _id?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'Admin' | 'Designer' | 'User';
  status?: 'Active' | 'Inactive';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  
  // State management using Angular Signals
  private currentUserSignal = signal<User | null>(null);
  
  currentUser = computed(() => this.currentUserSignal());
  isAuthenticated = computed(() => this.currentUserSignal() !== null);
  isAdmin = computed(() => this.currentUserSignal()?.role === 'Admin');

  constructor(private http: HttpClient, private router: Router) {
    this.loadToken();
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.token && res.user) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
          this.currentUserSignal.set(res.user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private loadToken(): void {
    const savedUser = localStorage.getItem('user');
    const token = this.getToken();
    if (savedUser && token) {
      try {
        this.currentUserSignal.set(JSON.parse(savedUser));
      } catch (e) {
        this.logout();
      }
    }
  }
}
