# Chatbot REST API Documentation

This document describes the REST API endpoints that the chatbot frontend expects from the backend.

## Base URL
```
http://localhost:3000/api
```

## Authentication

All API endpoints require OAuth2 authentication. Requests must include a valid Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

The access token is obtained through the OAuth2 Authorization Code flow with PKCE. See `OAUTH_SETUP.md` for detailed configuration instructions.

## Endpoints

### 1. Send Message
Send a user message to the chatbot and receive a response.

**Endpoint:** `POST /api/chat`

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "message": "Hello, how are you?",
  "conversationId": "optional-conversation-id"
}
```

**Request Fields:**
- `message` (string, required): The user's message text
- `conversationId` (string, optional): ID to maintain conversation context. If not provided, backend should create a new conversation.

**Response:** `200 OK`
```json
{
  "message": "I'm doing well, thank you! How can I help you today?",
  "conversationId": "conv-12345-67890",
  "timestamp": "2026-03-17T10:30:00Z"
}
```

**Response Fields:**
- `message` (string): The chatbot's response text
- `conversationId` (string): Unique identifier for this conversation (should be consistent across messages in the same conversation)
- `timestamp` (string): ISO 8601 timestamp of the response

**Error Response:** `400 Bad Request`
```json
{
  "error": "Message is required"
}
```

**Error Response:** `401 Unauthorized`
```json
{
  "error": "Invalid or expired token"
}
```

**Error Response:** `500 Internal Server Error`
```json
{
  "error": "Internal server error processing message"
}
```

---

### 2. Clear Conversation (Optional)
Clear the conversation history and context.

**Endpoint:** `DELETE /api/chat/:conversationId`

**Request Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `conversationId` (string, required): The ID of the conversation to clear

**Response:** `200 OK`
```json
{
  "message": "Conversation cleared successfully"
}
```

**Error Response:** `404 Not Found`
```json
{
  "error": "Conversation not found"
}
```

---

## CORS Configuration

The backend should allow CORS requests from the frontend origin. Example configuration:

```
Access-Control-Allow-Origin: http://localhost:4200
Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

---

## Example Usage

### TypeScript/Node.js Backend Example

```typescript
// Example Express.js route handler with OAuth2 token validation
const axios = require('axios');

// Middleware to validate OAuth2 token
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Validate token with OAuth2 provider
    const response = await axios.get('https://oauth-provider.example.com/oauth/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });

    req.user = response.data;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Apply authentication to all /api routes
app.use('/api', authenticateToken);

app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Your chatbot logic here
    const botResponse = await generateChatbotResponse(message, conversationId);

    res.json({
      message: botResponse.text,
      conversationId: botResponse.conversationId || generateNewConversationId(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'Internal server error processing message' });
  }
});

app.delete('/api/chat/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Clear conversation logic
    await clearConversationHistory(conversationId);

    res.json({ message: 'Conversation cleared successfully' });
  } catch (error) {
    console.error('Error clearing conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

---

## Notes

1. **Conversation State:** The backend should maintain conversation context using the `conversationId`. This allows for multi-turn conversations where the bot can reference previous messages.

2. **Message History:** The backend may want to store message history for each conversation to provide context-aware responses.

3. **Rate Limiting:** Consider implementing rate limiting on the `/api/chat` endpoint to prevent abuse.

4. **Authentication:** The frontend automatically includes OAuth2 Bearer tokens in all API requests via the `AuthInterceptor`. The backend must validate these tokens on each request. See the example above for token validation implementation.

5. **Token Validation:** The backend should validate tokens by calling the OAuth2 provider's userinfo endpoint or by verifying JWT signatures if using JWT-based tokens.

6. **User Context:** After validating the token, the user's information (email, name, etc.) is available in `req.user` and can be used to personalize responses or enforce user-specific permissions.

7. **Token Expiry:** If a token expires, the backend should return 401 Unauthorized. The frontend will automatically redirect to the login page.

8. **Streaming:** This implementation uses REST polling. For real-time responses, the backend could return streamed responses, though the frontend is designed for complete message responses.
