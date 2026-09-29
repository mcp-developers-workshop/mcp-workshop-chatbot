# Quick Start Guide

Get the chatbot up and running in 5 minutes.

## Prerequisites

- Node.js 18+ and npm
- An OAuth2 provider account (Google, Microsoft, Auth0, Keycloak, etc.)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure OAuth2

### Option A: Use Google OAuth2 (Easiest)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Navigate to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Choose "Web application"
6. Add authorized redirect URI: `http://localhost:4200/auth/callback`
7. Copy your Client ID

### Option B: Use Another Provider

See `OAUTH_SETUP.md` for detailed instructions for Microsoft Azure AD, Auth0, Keycloak, and others.

## Step 3: Create Environment Configuration

1. Copy the example configuration:
```bash
cp environment.example.ts src/environments/environment.ts
```

2. Edit `src/environments/environment.ts` and update:
   - `clientId`: Your OAuth2 client ID from Step 2
   - Other OAuth2 URLs if not using Google (see examples in the file)

**For Google OAuth2, use this configuration:**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  oauth: {
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
    clientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com', // ← Replace this
    clientSecret: '',
    redirectUri: 'http://localhost:4200/auth/callback',
    scope: 'openid profile email',
    responseType: 'code',
    usePKCE: true
  }
};
```

## Step 4: Set Up Backend (Mock Server)

For testing, you can use this simple Node.js mock server:

```bash
# Create a simple backend server
mkdir backend
cd backend
npm init -y
npm install express cors axios
```

Create `backend/server.js`:
```javascript
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Middleware to validate OAuth2 token
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Validate with Google (or your provider's userinfo endpoint)
    await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.use('/api', authenticateToken);

// Chat endpoint
app.post('/api/chat', (req, res) => {
  const { request } = req.body;

  res.json({
    response: `Echo: ${request}`,
    timestamp: new Date().toISOString()
  });
});

// Clear conversation endpoint
app.delete('/api/chat', (req, res) => {
  res.json({ message: 'Conversation cleared' });
});

app.listen(3000, () => {
  console.log('Backend running on http://localhost:3000');
});
```

Start the backend:
```bash
node server.js
```

## Step 5: Run the Frontend

In a new terminal:

```bash
npm start
```

Open your browser to `http://localhost:4200`

## Step 6: Test the Application

1. You should see the login page
2. Click "Sign in with OAuth2"
3. Authenticate with your OAuth2 provider
4. You'll be redirected back to the chat interface
5. Start chatting!

## Troubleshooting

### "redirect_uri_mismatch" error
- Ensure `http://localhost:4200/auth/callback` is registered in your OAuth2 provider's settings
- Check that the redirect URI in your code matches exactly (including protocol and port)

### "Invalid token" errors
- Make sure the backend's userinfo URL matches your OAuth2 provider
- For Google: `https://www.googleapis.com/oauth2/v3/userinfo`
- For others, see `OAUTH_SETUP.md`

### CORS errors
- Make sure your backend has CORS enabled
- The backend must allow the `Authorization` header

### Can't see user info
- Check that your OAuth2 scopes include `profile` and `email`
- Verify the `userInfoUrl` is correct for your provider

## Next Steps

- **Customize the UI:** Edit `src/app/chatbot/chatbot.component.css`
- **Add real chatbot logic:** Replace the echo response in the backend
- **Deploy to production:** See `README.md` for build instructions
- **Configure for production:** Update `src/environments/environment.prod.ts`

## Need Help?

- Full OAuth2 setup guide: `OAUTH_SETUP.md`
- API documentation: `API.md`
- General documentation: `README.md`
