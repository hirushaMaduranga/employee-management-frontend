import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  username: string = '';
  password: string = '';

  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  login(): void {
    this.errorMessage = '';

    // Check empty fields
    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'Username and password are required.';
      return;
    }

    this.loading = true;

    // Call Spring Boot login API
    this.authService
      .login({
        username: this.username,
        password: this.password,
      })
      .subscribe({
        next: (response) => {
          this.loading = false;

          // Save logged-in username
          localStorage.setItem('username', response.username);

          // Redirect to dashboard
          this.router.navigate(['/dashboard']);
        },

        error: () => {
          this.loading = false;
          this.errorMessage = 'Invalid username or password.';
        },
      });
  }
}
