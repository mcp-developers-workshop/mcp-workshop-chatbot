export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface ChatRequest {
  request: string;
}

export interface ChatResponse {
  response: string;
  timestamp: string;
}
