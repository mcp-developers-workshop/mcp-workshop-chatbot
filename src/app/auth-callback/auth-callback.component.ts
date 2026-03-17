import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth-callback',
  templateUrl: './auth-callback.component.html',
  styleUrls: ['./auth-callback.component.css']
})
export class AuthCallbackComponent implements OnInit {
  error: string | null = null;
  processing = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      const state = params['state'];
      const error = params['error'];

      if (error) {
        this.error = `Authentication failed: ${error}`;
        this.processing = false;
        return;
      }

      if (!code || !state) {
        this.error = 'Invalid callback parameters';
        this.processing = false;
        return;
      }

      // Handle OAuth2 callback
      this.authService.handleCallback(code, state).subscribe({
        next: (success) => {
          if (success) {
            this.router.navigate(['/chat']);
          } else {
            this.error = 'Authentication failed. Please try again.';
            this.processing = false;
          }
        },
        error: (err) => {
          console.error('Callback error:', err);
          this.error = 'Authentication failed. Please try again.';
          this.processing = false;
        }
      });
    });
  }

  retry(): void {
    this.router.navigate(['/login']);
  }
}
