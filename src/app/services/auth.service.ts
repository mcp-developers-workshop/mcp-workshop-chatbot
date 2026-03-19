import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { TokenResponse, UserInfo, AuthState } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private accessTokenKey = 'access_token';
  private refreshTokenKey = 'refresh_token';
  private tokenExpiryKey = 'token_expiry';
  private authStateKey = 'auth_state';
  private userInfoKey = 'user_info';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private userInfoSubject = new BehaviorSubject<UserInfo | null>(this.getUserInfoFromStorage());
  public userInfo$ = this.userInfoSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Initiate OAuth2 authorization code flow with PKCE
   */
  login(): void {
    const state = this.generateRandomString(32);
    const codeVerifier = environment.oauth.usePKCE ? this.generateRandomString(64) : undefined;

    // Store state and code verifier for verification after redirect
    const authState: AuthState = {
      state,
      codeVerifier,
      redirectUrl: this.router.url
    };
    sessionStorage.setItem(this.authStateKey, JSON.stringify(authState));

    // Build authorization URL
    const params: Record<string, string> = {
      client_id: environment.oauth.clientId,
      redirect_uri: environment.oauth.redirectUri,
      response_type: environment.oauth.responseType,
      scope: environment.oauth.scope,
      state: state
    };

    // Add PKCE challenge if enabled
    if (codeVerifier) {
      this.generateCodeChallenge(codeVerifier).then(codeChallenge => {
        params['code_challenge'] = codeChallenge;
        params['code_challenge_method'] = 'S256';

        const authUrl = this.buildUrl(environment.oauth.authorizationUrl, params);
        window.location.href = authUrl;
      });
    } else {
      const authUrl = this.buildUrl(environment.oauth.authorizationUrl, params);
      window.location.href = authUrl;
    }
  }

  /**
   * Handle OAuth2 callback and exchange code for tokens
   */
  handleCallback(code: string, state: string): Observable<boolean> {
    // Verify state parameter
    const storedAuthState = sessionStorage.getItem(this.authStateKey);
    if (!storedAuthState) {
      console.error('No auth state found');
      return of(false);
    }

    const authState: AuthState = JSON.parse(storedAuthState);
    if (authState.state !== state) {
      console.error('State mismatch');
      return of(false);
    }

    // Exchange authorization code for tokens
    return this.exchangeCodeForToken(code, authState.codeVerifier).pipe(
      tap(() => {
        sessionStorage.removeItem(this.authStateKey);
        this.isAuthenticatedSubject.next(true);
      }),
      map(() => true),
      catchError(error => {
        console.error('Token exchange failed:', error);
        return of(false);
      })
    );
  }

  /**
   * Exchange authorization code for access token
   */
  private exchangeCodeForToken(code: string, codeVerifier?: string): Observable<TokenResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    let body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('code', code)
      .set('redirect_uri', environment.oauth.redirectUri)
      .set('client_id', environment.oauth.clientId);

    // Add PKCE verifier if used
    if (codeVerifier) {
      body = body.set('code_verifier', codeVerifier);
    }

    // Add client secret if configured (not recommended for SPAs)
    if (environment.oauth.clientSecret) {
      body = body.set('client_secret', environment.oauth.clientSecret);
    }

    return this.http.post<TokenResponse>(environment.oauth.tokenUrl, body.toString(), { headers }).pipe(
      tap(response => {
        this.storeTokens(response);
        this.fetchUserInfo().subscribe();
      })
    );
  }

  /**
   * Fetch user information from OAuth2 provider
   */
  fetchUserInfo(): Observable<UserInfo> {
    const token = this.getAccessToken();
    if (!token) {
      return of({} as UserInfo);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<UserInfo>(environment.oauth.userInfoUrl, { headers }).pipe(
      tap(userInfo => {
        localStorage.setItem(this.userInfoKey, JSON.stringify(userInfo));
        this.userInfoSubject.next(userInfo);
      }),
      catchError(error => {
        console.error('Failed to fetch user info:', error);
        return of({} as UserInfo);
      })
    );
  }

  /**
   * Logout user and clear tokens
   */
  logout(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.tokenExpiryKey);
    localStorage.removeItem(this.userInfoKey);
    sessionStorage.removeItem(this.authStateKey);

    this.isAuthenticatedSubject.next(false);
    this.userInfoSubject.next(null);

    this.router.navigate(['/login']);
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    if (!this.hasValidToken()) {
      return null;
    }
    return localStorage.getItem(this.accessTokenKey);
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  /**
   * Check if token is about to expire (within 60 seconds)
   */
  isTokenExpiringSoon(): boolean {
    const expiry = localStorage.getItem(this.tokenExpiryKey);
    if (!expiry) {
      return false;
    }
    // Consider token expiring soon if less than 60 seconds remaining
    return Date.now() > (parseInt(expiry, 10) - 60000);
  }

  /**
   * Refresh access token using refresh token
   */
  refreshAccessToken(): Observable<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return of(false);
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    let body = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('refresh_token', refreshToken)
      .set('client_id', environment.oauth.clientId);

    if (environment.oauth.clientSecret) {
      body = body.set('client_secret', environment.oauth.clientSecret);
    }

    return this.http.post<TokenResponse>(environment.oauth.tokenUrl, body.toString(), { headers }).pipe(
      tap(response => {
        this.storeTokens(response);
        this.isAuthenticatedSubject.next(true);
      }),
      map(() => true),
      catchError(error => {
        console.error('Token refresh failed:', error);
        // If refresh fails, logout the user
        this.logout();
        return of(false);
      })
    );
  }

  /**
   * Check if user has valid token
   */
  private hasValidToken(): boolean {
    const token = localStorage.getItem(this.accessTokenKey);
    const expiry = localStorage.getItem(this.tokenExpiryKey);

    if (!token || !expiry) {
      return false;
    }

    return Date.now() < parseInt(expiry, 10);
  }

  /**
   * Store tokens in localStorage
   */
  private storeTokens(tokenResponse: TokenResponse): void {
    localStorage.setItem(this.accessTokenKey, tokenResponse.access_token);

    if (tokenResponse.refresh_token) {
      localStorage.setItem(this.refreshTokenKey, tokenResponse.refresh_token);
    }

    const expiryTime = Date.now() + (tokenResponse.expires_in * 1000);
    localStorage.setItem(this.tokenExpiryKey, expiryTime.toString());
  }

  /**
   * Get user info from storage
   */
  private getUserInfoFromStorage(): UserInfo | null {
    const userInfo = localStorage.getItem(this.userInfoKey);
    return userInfo ? JSON.parse(userInfo) : null;
  }

  /**
   * Generate random string for state and PKCE verifier
   */
  private generateRandomString(length: number): string {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(values)
      .map(x => possible[x % possible.length])
      .join('');
  }

  /**
   * Generate PKCE code challenge from verifier
   */
  private async generateCodeChallenge(codeVerifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);

    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(baseUrl: string, params: Record<string, string>): string {
    const url = new URL(baseUrl);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    return url.toString();
  }
}
