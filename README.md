# Chatbot Frontend

An Angular chatbot application that communicates with a REST backend.

## Features

- Clean, modern chat interface
- Real-time message updates
- Conversation context management
- Loading states and error handling
- Message timestamps
- Clear conversation functionality

## Project Structure

```
src/
├── app/
│   ├── chatbot/
│   │   ├── chatbot.component.ts      # Main chatbot component logic
│   │   ├── chatbot.component.html    # Chat UI template
│   │   └── chatbot.component.css     # Chat styling
│   ├── models/
│   │   └── message.model.ts          # TypeScript interfaces
│   ├── services/
│   │   └── chat.service.ts           # REST API service
│   ├── app.component.ts              # Root component
│   └── app.module.ts                 # App module configuration
├── main.ts                           # Application entry point
├── index.html                        # Main HTML file
└── styles.css                        # Global styles
```

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the Application

1. Start the development server:
```bash
npm start
```

2. Open your browser and navigate to `http://localhost:4200`

## Configuration

The backend API URL can be configured in `src/app/services/chat.service.ts`:

```typescript
private apiUrl = 'http://localhost:3000/api'; // Update this URL
```

## Backend Requirements

This frontend expects a REST backend with the following endpoints:

- `POST /api/chat` - Send messages and receive responses
- `DELETE /api/chat/:conversationId` - Clear conversation (optional)

See `API.md` for complete API documentation.

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
