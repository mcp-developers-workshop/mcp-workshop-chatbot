# Chatbot Frontend

An Angular chatbot application to test the Agent locally


## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy the example configuration:
```bash
cp environment.example.ts src/environments/environment.ts


2. Configure OAuth2 settings in `src/environments/environment.ts` as provided in the instructions. You can replace the enture block:
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

## Running the Application

1. Start the development server:
```bash
npm start
```

2. Open your browser and navigate to `http://localhost:4200`

3. You'll be redirected to the login page

4. Click "Sign in with OAuth2" to authenticate and login as as per instructions.

5. After successful authentication, you'll be redirected to the chat interface

6. As for a list of orders by typing - "Give me a list of orders"

7. You should see a list of orders displayed.