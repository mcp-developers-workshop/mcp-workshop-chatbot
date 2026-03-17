# Chatbot Frontend

An Angular chatbot application with OAuth2 authentication that communicates with a REST backend.

## Features

- **OAuth2 Authentication** with PKCE (Proof Key for Code Exchange)
- Clean, modern chat interface
- Real-time message updates
- Conversation context management
- User profile display
- Loading states and error handling
- Message timestamps
- Clear conversation functionality
- Secure logout

## Project Structure

```
src/
├── app/
│   ├── auth-callback/
│   │   ├── auth-callback.component.ts    # OAuth2 callback handler
│   │   ├── auth-callback.component.html
│   │   └── auth-callback.component.css
│   ├── chatbot/
│   │   ├── chatbot.component.ts          # Main chatbot component logic
│   │   ├── chatbot.component.html        # Chat UI template
│   │   └── chatbot.component.css         # Chat styling
│   ├── guards/
│   │   └── auth.guard.ts                 # Route protection
│   ├── interceptors/
│   │   └── auth.interceptor.ts           # Add auth headers to requests
│   ├── login/
│   │   ├── login.component.ts            # Login page
│   │   ├── login.component.html
│   │   └── login.component.css
│   ├── models/
│   │   ├── auth.model.ts                 # Auth interfaces
│   │   └── message.model.ts              # Message interfaces
│   ├── services/
│   │   ├── auth.service.ts               # OAuth2 authentication service
│   │   └── chat.service.ts               # REST API service
│   ├── app-routing.module.ts             # Route configuration
│   ├── app.component.ts                  # Root component
│   └── app.module.ts                     # App module configuration
├── environments/
│   ├── environment.ts                    # Development config
│   └── environment.prod.ts               # Production config
├── main.ts                               # Application entry point
├── index.html                            # Main HTML file
└── styles.css                            # Global styles
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure OAuth2 settings in `src/environments/environment.ts`:
```typescript
oauth: {
  authorizationUrl: 'https://your-oauth-provider.com/oauth/authorize',
  tokenUrl: 'https://your-oauth-provider.com/oauth/token',
  userInfoUrl: 'https://your-oauth-provider.com/oauth/userinfo',
  clientId: 'your-client-id',
  redirectUri: 'http://localhost:4200/auth/callback',
  scope: 'openid profile email',
  responseType: 'code',
  usePKCE: true
}
```

See `OAUTH_SETUP.md` for detailed OAuth2 configuration instructions.

## Running the Application

1. Start the development server:
```bash
npm start
```

2. Open your browser and navigate to `http://localhost:4200`

3. You'll be redirected to the login page

4. Click "Sign in with OAuth2" to authenticate

5. After successful authentication, you'll be redirected to the chat interface

## Configuration

### OAuth2 Settings

OAuth2 authentication is configured in the environment files:
- Development: `src/environments/environment.ts`
- Production: `src/environments/environment.prod.ts`

**See `OAUTH_SETUP.md` for complete OAuth2 setup guide with examples for popular providers (Google, Microsoft, Auth0, Keycloak).**

### API Settings

The backend API URL is configured in the same environment files:
```typescript
apiUrl: 'http://localhost:3000/api'
```

## Backend Requirements

This frontend expects a REST backend with OAuth2 token validation and the following endpoints:

### Authentication
All API requests include an OAuth2 Bearer token in the `Authorization` header. The backend must validate this token.

### Endpoints
- `POST /api/chat` - Send messages and receive responses (authenticated)
- `DELETE /api/chat/:conversationId` - Clear conversation (authenticated, optional)

See `API.md` for complete API documentation with authentication examples.

## Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Technologies Used

- Angular 17
- TypeScript
- RxJS
- HttpClient for REST communication
- OAuth2 Authorization Code Flow with PKCE
- Angular Router with route guards

## Security Features

- **PKCE (Proof Key for Code Exchange):** Enhanced security for the OAuth2 flow
- **State Parameter:** CSRF protection during authentication
- **Secure Token Storage:** Tokens stored in localStorage with expiry validation
- **Automatic Token Injection:** HTTP interceptor adds tokens to API requests
- **Route Protection:** Auth guard prevents unauthorized access
- **Auto Logout:** Automatic logout on token expiration or invalid tokens

## Documentation

- `README.md` - This file, general overview
- `OAUTH_SETUP.md` - Detailed OAuth2 configuration guide with provider examples
- `API.md` - Backend API specification with authentication
