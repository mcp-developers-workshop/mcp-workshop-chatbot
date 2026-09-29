// Copy this file to src/environments/environment.ts and configure your OAuth2 settings

export const environment = {
  production: false,

  // Backend API URL
  apiUrl: 'http://localhost:3000/api',

  oauth: {
    // ============================================
    // OAuth2 Provider Endpoints
    // ============================================
    // Replace these with your OAuth2 provider's endpoints
    authorizationUrl: 'https://oauth-provider.example.com/oauth/authorize',
    tokenUrl: 'https://oauth-provider.example.com/oauth/token',
    userInfoUrl: 'https://oauth-provider.example.com/oauth/userinfo',
    logoutUrl: 'https://oauth-provider.example.com/oauth/logout', // Optional: for proper SSO logout

    // ============================================
    // Client Configuration
    // ============================================
    // Client ID from your OAuth2 provider
    clientId: 'your-client-id-here',

    // Client Secret - MUST BE EMPTY for PKCE flow (recommended for SPAs)
    // WARNING: Never commit client secrets to frontend code - they're exposed to users
    clientSecret: '',

    // ============================================
    // Application URLs
    // ============================================
    // Must match the redirect URI registered with your OAuth2 provider
    redirectUri: 'http://localhost:4200/auth/callback',

    // ============================================
    // OAuth2 Parameters
    // ============================================
    // Scopes to request (space-separated)
    scope: 'openid profile email',

    // Response type - MUST be 'code' for authorization code flow with PKCE
    // Do NOT use 'token' (implicit flow) as it's less secure
    responseType: 'code',

    // ============================================
    // PKCE Configuration
    // ============================================
    // Enable PKCE for enhanced security (highly recommended for SPAs)
    usePKCE: true
  }
};

/* ============================================
   POPULAR PROVIDER CONFIGURATIONS
   ============================================

   Copy the appropriate configuration below and replace the oauth object above.

   ----------------------------------------
   GOOGLE OAUTH2
   ----------------------------------------
   oauth: {
     authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
     tokenUrl: 'https://oauth2.googleapis.com/token',
     userInfoUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
     logoutUrl: '', // Google handles logout through browser session
     clientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
     clientSecret: '',
     redirectUri: 'http://localhost:4200/auth/callback',
     scope: 'openid profile email',
     responseType: 'code',
     usePKCE: true
   }

   ----------------------------------------
   MICROSOFT AZURE AD
   ----------------------------------------
   oauth: {
     authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
     tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
     userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
     logoutUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/logout',
     clientId: 'YOUR_AZURE_CLIENT_ID',
     clientSecret: '',
     redirectUri: 'http://localhost:4200/auth/callback',
     scope: 'openid profile email User.Read',
     responseType: 'code',
     usePKCE: true
   }

   ----------------------------------------
   AUTH0
   ----------------------------------------
   oauth: {
     authorizationUrl: 'https://YOUR_DOMAIN.auth0.com/authorize',
     tokenUrl: 'https://YOUR_DOMAIN.auth0.com/oauth/token',
     userInfoUrl: 'https://YOUR_DOMAIN.auth0.com/userinfo',
     logoutUrl: 'https://YOUR_DOMAIN.auth0.com/v2/logout',
     clientId: 'YOUR_AUTH0_CLIENT_ID',
     clientSecret: '',
     redirectUri: 'http://localhost:4200/auth/callback',
     scope: 'openid profile email',
     responseType: 'code',
     usePKCE: true
   }

   ----------------------------------------
   KEYCLOAK
   ----------------------------------------
   oauth: {
     authorizationUrl: 'https://YOUR_KEYCLOAK_DOMAIN/auth/realms/YOUR_REALM/protocol/openid-connect/auth',
     tokenUrl: 'https://YOUR_KEYCLOAK_DOMAIN/auth/realms/YOUR_REALM/protocol/openid-connect/token',
     userInfoUrl: 'https://YOUR_KEYCLOAK_DOMAIN/auth/realms/YOUR_REALM/protocol/openid-connect/userinfo',
     logoutUrl: 'https://YOUR_KEYCLOAK_DOMAIN/auth/realms/YOUR_REALM/protocol/openid-connect/logout',
     clientId: 'YOUR_KEYCLOAK_CLIENT_ID',
     clientSecret: '',
     redirectUri: 'http://localhost:4200/auth/callback',
     scope: 'openid profile email',
     responseType: 'code',
     usePKCE: true
   }

*/
