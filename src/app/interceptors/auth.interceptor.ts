import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip auth for OAuth2 token endpoint to avoid infinite loops
    if (req.url.includes(environment.oauth.tokenUrl)) {
      return next.handle(req);
    }

    // Only add auth header for API requests
    if (req.url.startsWith(environment.apiUrl)) {
      // Check if token is expiring soon and refresh proactively
      if (this.authService.isTokenExpiringSoon() && !this.isRefreshing) {
        return this.handleTokenRefresh(req, next);
      }

      const token = this.authService.getAccessToken();
      if (token) {
        req = this.addAuthHeader(req, token);
      }
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized errors
        if (error.status === 401 && req.url.startsWith(environment.apiUrl)) {
          return this.handle401Error(req, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addAuthHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshAccessToken().pipe(
        switchMap((success: boolean) => {
          this.isRefreshing = false;
          if (success) {
            const token = this.authService.getAccessToken();
            this.refreshTokenSubject.next(token);
            return next.handle(this.addAuthHeader(request, token!));
          } else {
            // Refresh failed, user will be logged out by refreshAccessToken()
            return throwError(() => new Error('Token refresh failed'));
          }
        }),
        catchError((error) => {
          this.isRefreshing = false;
          return throwError(() => error);
        })
      );
    } else {
      // Wait for token refresh to complete
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => next.handle(this.addAuthHeader(request, token!)))
      );
    }
  }

  private handleTokenRefresh(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshAccessToken().pipe(
        switchMap((success: boolean) => {
          this.isRefreshing = false;
          if (success) {
            const token = this.authService.getAccessToken();
            this.refreshTokenSubject.next(token);
            return next.handle(this.addAuthHeader(request, token!));
          } else {
            return next.handle(request);
          }
        }),
        catchError((error) => {
          this.isRefreshing = false;
          return next.handle(request);
        })
      );
    } else {
      // Wait for token refresh to complete
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => next.handle(this.addAuthHeader(request, token!)))
      );
    }
  }
}
