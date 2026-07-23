import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; background: #0f172a; color: #ffffff;">
      <div style="width: 48px; height: 48px; border: 4px solid rgba(255,255,255,0.2); border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s infinite linear;"></div>
      <h2 style="margin-top: 24px; font-weight: 600; font-size: 1.2rem;">Authenticating with Google...</h2>
      <p style="color: #94a3b8; font-size: 0.9rem;">Completing OAuth 2.0 handshake with LuminaPaint</p>
    </div>
    <style>
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
  `
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Check URL query parameters & hash fragment for access_token or credential
    this.route.queryParams.subscribe(params => {
      const credential = params['credential'] || params['id_token'];
      const email = params['email'];

      if (credential || email) {
        this.authService.loginWithGoogle({ credential, email }).subscribe({
          next: () => {
            if (this.authService.isAdmin()) {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          },
          error: () => {
            this.router.navigate(['/login'], { queryParams: { error: 'Google OAuth callback failed' } });
          }
        });
      } else {
        // Parse hash fragment for implicit OAuth flow (#access_token=...)
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          const match = hash.match(/access_token=([^&]+)/);
          if (match && match[1]) {
            // Fetch user info with Google Access Token
            fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${match[1]}` }
            })
              .then(res => res.json())
              .then(user => {
                if (user && user.email) {
                  this.authService.loginWithGoogle({ email: user.email, firstName: user.given_name, lastName: user.family_name }).subscribe({
                    next: () => {
                      if (this.authService.isAdmin()) {
                        this.router.navigate(['/admin']);
                      } else {
                        this.router.navigate(['/dashboard']);
                      }
                    },
                    error: () => this.router.navigate(['/login'])
                  });
                } else {
                  this.router.navigate(['/login']);
                }
              })
              .catch(() => this.router.navigate(['/login']));
            return;
          }
        }
        
        // Default fallback redirect to login if no parameters found
        setTimeout(() => this.router.navigate(['/login']), 1500);
      }
    });
  }
}
