# OAuth2 Setup Guide

This document explains how to configure OAuth2 authentication for the chatbot application.

## Overview

The application uses the **OAuth2 Authorization Code Flow with PKCE** (Proof Key for Code Exchange), which is the recommended approach for Single Page Applications (SPAs) for security reasons.

## Configuration

### 1. Environment Configuration

OAuth2 settings are configured in the environment files:

- **Development:** `src/environments/environment.ts`
- **Production:** `src/environments/environment.prod.ts`

### 2. OAuth2 Parameters

Edit the environment files to configure your OAuth2 provider:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  oauth: {
    // OAuth2 Authorization Server endpoints
    authorizationUrl: 'https://oauth-provider.example.com/oauth/authorize',
    tokenUrl: 'https://oauth-provider.example.com/oauth/token',
    userInfoUrl: 'https://oauth-provider.example.com/oauth/userinfo',

    // Client credentials
    clientId: 'your-client-id',
    clientSecret: '', // Leave empty for PKCE flow (recommended)

    // Application URLs
    redirectUri: 'http://localhost:4200/auth/callback',

    // OAuth2 flow parameters
    scope: 'openid profile email',
    responseType: 'code',

    // PKCE settings
    usePKCE: true
  }
};
```

### 3. Parameter Descriptions

| Parameter | Description | Example |
|-----------|-------------|---------|
| `authorizationUrl` | OAuth2 authorization endpoint URL | `https://accounts.google.com/o/oauth2/v2/auth` |
| `tokenUrl` | OAuth2 token exchange endpoint URL | `https://oauth2.googleapis.com/token` |
| `userInfoUrl` | Endpoint to fetch user information | `https://www.googleapis.com/oauth2/v3/userinfo` |
| `clientId` | Your application's client ID from OAuth2 provider | `abc123.apps.googleusercontent.com` |
| `clientSecret` | Client secret (leave empty for PKCE) | `` |
| `redirectUri` | Callback URL for your application | `http://localhost:4200/auth/callback` |
| `scope` | OAuth2 scopes to request | `openid profile email` |
| `responseType` | OAuth2 response type | `code` |
| `usePKCE` | Enable PKCE for enhanced security | `true` |

## Popular OAuth2 Providers

### Google OAuth2

```typescript
oauth: {
  authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  userInfoUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
  clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
  clientSecret: '',
  redirectUri: 'http://localhost:4200/auth/callback',
  scope: 'openid profile email',
  responseType: 'code',
  usePKCE: true
}
```

**Setup Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Add `http://localhost:4200/auth/callback` to "Authorized redirect URIs"
6. Copy the Client ID

### Microsoft Azure AD

```typescript
oauth: {
  authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
  clientId: 'YOUR_AZURE_CLIENT_ID',
  clientSecret: '',
  redirectUri: 'http://localhost:4200/auth/callback',
  scope: 'openid profile email User.Read',
  responseType: 'code',
  usePKCE: true
}
```

**Setup Steps:**
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" → "App registrations"
3. Click "New registration"
4. Add `http://localhost:4200/auth/callback` to redirect URIs
5. Under "API permissions", add Microsoft Graph permissions
6. Copy the Application (client) ID

### Auth0

```typescript
oauth: {
  authorizationUrl: 'https://YOUR_DOMAIN.auth0.com/authorize',
  tokenUrl: 'https://YOUR_DOMAIN.auth0.com/oauth/token',
  userInfoUrl: 'https://YOUR_DOMAIN.auth0.com/userinfo',
  clientId: 'YOUR_AUTH0_CLIENT_ID',
  clientSecret: '',
  redirectUri: 'http://localhost:4200/auth/callback',
  scope: 'openid profile email',
  responseType: 'code',
  usePKCE: true
}
```

**Setup Steps:**
1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create a new Application (Single Page Application)
3. Add `http://localhost:4200/auth/callback` to "Allowed Callback URLs"
4. Add `http://localhost:4200` to "Allowed Web Origins"
5. Copy the Client ID and Domain

### Keycloak

```typescript
oauth: {
  authorizationUrl: 'https://YOUR_KEYCLOAK_DOMAIN/auth/realms/YOUR_REALM/protocol/openid-connect/auth',
  tokenUrl: 'https://YOUR_KEYCLOAK_DOMAIN/auth/realms/YOUR_REALM/protocol/openid-connect/token',
  userInfoUrl: 'https://YOUR_KEYCLOAK_DOMAIN/auth/realms/YOUR_REALM/protocol/openid-connect/userinfo',
  clientId: 'YOUR_KEYCLOAK_CLIENT_ID',
  clientSecret: '',
  redirectUri: 'http://localhost:4200/auth/callback',
  scope: 'openid profile email',
  responseType: 'code',
  usePKCE: true
}
```

## OAuth2 Provider Registration

When registering your application with an OAuth2 provider, ensure you:

1. **Set the correct redirect URI:**
   - Development: `http://localhost:4200/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`

2. **Request appropriate scopes:**
   - `openid` - Required for OpenID Connect
   - `profile` - Access to user's profile information
   - `email` - Access to user's email address

3. **Configure application type:**
   - Select "Single Page Application" (SPA) or "Public Client"
   - This ensures the provider supports PKCE

4. **CORS Settings:**
   - Some providers require you to whitelist your application domain

## Security Considerations

### PKCE (Proof Key for Code Exchange)

PKCE is **enabled by default** (`usePKCE: true`) and is highly recommended for SPAs because:

- Protects against authorization code interception attacks
- No need to store client secrets in the frontend
- Supported by most modern OAuth2 providers

### Token Storage

- Access tokens are stored in `localStorage`
- Tokens are automatically included in API requests via HTTP interceptor
- Tokens are cleared on logout or when expired

### State Parameter

A random `state` parameter is automatically generated and validated to prevent CSRF attacks.

## Testing

### Local Testing

1. Update `environment.ts` with your OAuth2 provider settings
2. Run the application: `npm start`
3. Navigate to `http://localhost:4200`
4. Click "Sign in with OAuth2"
5. Complete authentication with your provider
6. You'll be redirected back to the chat interface

### Production Deployment

1. Update `environment.prod.ts` with production URLs and credentials
2. Register production redirect URI with your OAuth2 provider
3. Build the application: `npm run build`
4. Deploy the `dist/` folder to your hosting service

## Troubleshooting

### Common Issues

**Issue:** "redirect_uri_mismatch" error
- **Solution:** Ensure the redirect URI in your code exactly matches the one registered with the OAuth2 provider (including protocol, port, and path)

**Issue:** "invalid_client" error
- **Solution:** Check that your client ID is correct

**Issue:** "unauthorized_client" error with PKCE
- **Solution:** Ensure your OAuth2 provider supports PKCE and that your client is configured as a public client

**Issue:** CORS errors during token exchange
- **Solution:** This typically means PKCE is not properly configured. Ensure `usePKCE: true` and that your provider supports PKCE

**Issue:** User info not displaying
- **Solution:** Check that the `userInfoUrl` is correct and that your scopes include `profile` and/or `email`

## Flow Diagram

```
User → Login Page → Click "Sign in"
  ↓
Generate state & PKCE verifier
  ↓
Redirect to OAuth2 Provider
  ↓
User authenticates
  ↓
Provider redirects to /auth/callback with code
  ↓
Validate state parameter
  ↓
Exchange code for tokens (with PKCE verifier)
  ↓
Store tokens & fetch user info
  ↓
Redirect to /chat
  ↓
Chat interface (authenticated)
```

## API Integration

The backend API should validate the OAuth2 access token on each request. The token is automatically included in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

### Backend Token Validation

Your backend should:

1. Extract the Bearer token from the Authorization header
2. Validate the token with your OAuth2 provider
3. Optionally cache validation results for performance
4. Return 401 Unauthorized if token is invalid or expired

Example Node.js/Express validation:

```javascript
const axios = require('axios');

async function validateToken(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Validate with OAuth2 provider's userinfo endpoint
    const response = await axios.get('https://oauth-provider.example.com/oauth/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });

    req.user = response.data;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

app.use('/api', validateToken);
```

## Additional Resources

- [OAuth 2.0 RFC 6749](https://tools.ietf.org/html/rfc6749)
- [PKCE RFC 7636](https://tools.ietf.org/html/rfc7636)
- [OpenID Connect](https://openid.net/connect/)
