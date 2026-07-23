import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = signal(false);
  rememberMe = signal(true);
  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {}

  onSubmit(): void {
    if (this.isLoading()) return; // Guard duplicate submissions

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
          this.errorMessage.set(err.error?.error || 'Database service unavailable. Please replace <db_password> in .env.');
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

    const userEmail = prompt('Enter your Google Account email to sign in:', 'user@gmail.com');
    if (!userEmail || !userEmail.trim()) {
      return;
    }

    const emailClean = userEmail.trim();
    if (!emailClean.includes('@')) {
      this.errorMessage.set('Please enter a valid Google email address.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const firstName = emailClean.split('@')[0];
    this.authService.loginWithGoogle({ email: emailClean, firstName }).subscribe({
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
        this.errorMessage.set(err.error?.error || 'Google Authentication failed.');
      }
    });
  }
}
