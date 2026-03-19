# Authentication Flow and Token Handling

This document explains how OAuth2 bearer tokens are automatically included in every API request.

## How It Works

### 1. HTTP Interceptor

The `AuthInterceptor` (`src/app/interceptors/auth.interceptor.ts`) automatically intercepts **all** HTTP requests and adds the Authorization header.

```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Check if this is an API request
    if (req.url.startsWith(environment.apiUrl)) {
      const token = this.authService.getAccessToken();

      if (token) {
        // Clone request and add Authorization header
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    }

    return next.handle(req);
  }
}
```

### 2. Automatic Application

The interceptor is registered globally in `app.module.ts`:

```typescript
providers: [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }
]
```

This means **every** HttpClient request automatically goes through the interceptor.

### 3. Example Request Flow

When you call:
```typescript
this.http.post<ChatResponse>(`${this.apiUrl}/chat`, request);
```

The interceptor automatically transforms it to include:
```
POST http://localhost:3000/api/chat
Headers:
  Content-Type: application/json
  Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Body:
  {
    "message": "Hello!"
  }
```

### 4. Token Source

The token comes from:
- **Storage:** `localStorage` (key: `access_token`)
- **Retrieval:** `AuthService.getAccessToken()`
- **Origin:** OAuth2 Authorization Code flow with PKCE
- **Validation:** Checked for expiry before being included

### 5. Automatic Error Handling

The interceptor also handles 401 Unauthorized responses:

```typescript
catchError((error: HttpErrorResponse) => {
  if (error.status === 401) {
    this.authService.logout(); // Clear tokens and redirect to login
  }
  return throwError(() => error);
})
```

## API Endpoints That Receive Tokens

All requests to `environment.apiUrl` automatically include the token:

✅ **POST** `/api/chat` - Send message
```
Authorization: Bearer <token>
```

✅ **DELETE** `/api/chat` - Clear conversation
```
Authorization: Bearer <token>
```

✅ **Any future API endpoints** you add will automatically include the token

## Backend Token Verification

Your backend receives the token in the Authorization header:

```javascript
// Express.js example
app.use('/api', async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token after "Bearer "

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Validate token with OAuth2 provider
    const response = await axios.get('https://oauth-provider.example.com/oauth/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });

    req.user = response.data; // User info available in all routes
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});
```

## Verification

You can verify the token is being sent by:

### 1. Browser DevTools
- Open DevTools (F12)
- Go to Network tab
- Make a chat request
- Click on the request
- Check Headers → Request Headers
- You should see: `Authorization: Bearer <long-token-string>`

### 2. Backend Logging
Add logging to your backend:
```javascript
app.use('/api', (req, res, next) => {
  console.log('Authorization Header:', req.headers.authorization);
  next();
});
```

### 3. Curl Test
After logging in, copy the token from localStorage and test:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"message": "Hello"}'
```

## Token Lifecycle

1. **Login:** User authenticates via OAuth2 → receives access token
2. **Storage:** Token stored in `localStorage` with expiry time
3. **Usage:** Token automatically added to every API request
4. **Validation:** Backend validates token on each request
5. **Expiry:** Frontend checks expiry before using token
6. **401 Error:** If backend returns 401, user is automatically logged out
7. **Logout:** User clicks logout → tokens cleared from storage

## Security Notes

- ✅ Token stored in localStorage (persistent across page reloads)
- ✅ Token only sent to API URLs (not to external sites)
- ✅ Token checked for expiry before use
- ✅ Automatic logout on 401 errors
- ✅ HTTPS required in production to prevent token theft
- ✅ Token never logged or exposed in error messages

## Troubleshooting

### Token Not Being Sent

**Check 1:** Is the request URL correct?
- Token only added if `req.url.startsWith(environment.apiUrl)`
- Verify `environment.apiUrl` matches your API base URL

**Check 2:** Is there a valid token?
- Open DevTools → Application → Local Storage
- Check for `access_token` key
- If missing, you need to log in again

**Check 3:** Is the interceptor registered?
- Check `app.module.ts`
- Should have HTTP_INTERCEPTORS provider

### Backend Not Receiving Token

**Check 1:** CORS configuration
- Backend must allow `Authorization` header
- Check `Access-Control-Allow-Headers` includes `Authorization`

**Check 2:** Backend parsing
- Token is in format: `Bearer <token>`
- Extract with: `authHeader.split(' ')[1]`

## Complete Request Example

**Frontend Code:**
```typescript
// In ChatService
sendMessage(message: string): Observable<ChatResponse> {
  const request = { message };
  return this.http.post<ChatResponse>(`${this.apiUrl}/chat`, request);
}
// No manual Authorization header needed!
```

**Actual HTTP Request:**
```http
POST /api/chat HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

{"message":"Hello"}
```

**Backend Receives:**
```javascript
req.headers.authorization
// => "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."

const token = req.headers.authorization.split(' ')[1]
// => "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Summary

✅ **YES** - Bearer token is automatically passed in Authorization header
✅ **YES** - Applied to every request to the API
✅ **YES** - No manual header setup needed in service methods
✅ **YES** - 401 errors trigger automatic logout
✅ **YES** - Token validated for expiry before use

The implementation is **complete and working** - every API request includes the OAuth2 bearer token in the Authorization header automatically!
