import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  showPassword = signal(false);
  rememberMe = signal(true);
  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

  private readonly GOOGLE_CLIENT_ID = '609241189909-qin8vc0oeacsg51tb0re7jad69o9re1j.apps.googleusercontent.com';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initGoogleIdentity();
  }

  private initGoogleIdentity(): void {
    if (typeof window !== 'undefined') {
      const scriptId = 'google-jssdk';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => this.setupGoogleButton();
        document.head.appendChild(script);
      } else {
        this.setupGoogleButton();
      }
    }
  }

  private setupGoogleButton(): void {
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.initialize({
        client_id: this.GOOGLE_CLIENT_ID,
        callback: (response: any) => this.handleGoogleCredential(response)
      });
    }
  }

  private handleGoogleCredential(response: any): void {
    if (response && response.credential) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      this.authService.loginWithGoogle({ credential: response.credential }).subscribe({
        next: () => {
          this.isLoading.set(false);
          if (this.authService.isAdmin()) {
            this.router.navigate(['/admin']);
          } else {
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
            this.router.navigateByUrl(returnUrl);
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.error || 'Google ID token authentication failed.');
        }
      });
    }
  }

  onSubmit(): void {
    if (this.isLoading()) return;

    if (!this.email || !this.password) {
      this.errorMessage.set('Please fill out all fields.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        if (this.authService.isAdmin()) {
          this.router.navigate(['/admin']);
        } else {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
          this.router.navigateByUrl(returnUrl);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 401) {
          this.errorMessage.set('Invalid email or password.');
        } else if (err.status === 400) {
          this.errorMessage.set(err.error?.error || 'Invalid request parameters.');
        } else if (err.status === 500) {
          this.errorMessage.set(err.error?.error || 'Database service unavailable.');
        } else if (err.status === 0) {
          this.errorMessage.set('Network connection error. Please ensure the backend server is running on port 5000.');
        } else {
          this.errorMessage.set(err.error?.error || 'Failed to authenticate. Please try again.');
        }
      }
    });
  }

  onGoogleLogin(): void {
    if (this.isLoading()) return;

    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          this.triggerGoogleOAuthRedirect();
        }
      });
    } else {
      this.triggerGoogleOAuthRedirect();
    }
  }

  private triggerGoogleOAuthRedirect(): void {
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback');
    const scope = encodeURIComponent('email profile');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${this.GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
    window.location.href = authUrl;
  }
}
