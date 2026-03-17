# Chatbot REST API Documentation

This document describes the REST API endpoints that the chatbot frontend expects from the backend.

## Base URL
```
http://localhost:3000/api
```

## Endpoints

### 1. Send Message
Send a user message to the chatbot and receive a response.

**Endpoint:** `POST /api/chat`

**Request Headers:**
```
Content-Type: application/json
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
Access-Control-Allow-Headers: Content-Type
```

---

## Example Usage

### TypeScript/Node.js Backend Example

```typescript
// Example Express.js route handler
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

4. **Authentication:** For production use, add authentication headers (e.g., JWT tokens) to secure the API.

5. **Streaming:** This implementation uses REST polling. For real-time responses, the backend could return streamed responses, though the frontend is designed for complete message responses.
